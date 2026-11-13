import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    clientId: string;
    checkinId: string;
  }>;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function deny(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validId(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/")
  );
}

export async function PATCH(
  request: Request,
  context: Context
) {
  const authorization =
    request.headers.get("authorization") ?? "";

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return deny("Prijava je potrebna.", 401);
  }

  let trainerUid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(
      token,
      true
    );
    trainerUid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  const { clientId, checkinId } = await context.params;

  if (!validId(clientId) || !validId(checkinId)) {
    return deny("Neispravan ID.", 400);
  }

  let body: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (raw.length > 4096) {
      return deny("Zahtjev je prevelik.", 413);
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return deny("Neispravan zahtjev.", 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return deny("Neispravan JSON.", 400);
  }

  const action = body.action;

  if (action !== "review" && action !== "comment") {
    return deny("Nepoznata radnja.", 400);
  }

  let comment = "";

  if (action === "comment") {
    if (typeof body.trainerComment !== "string") {
      return deny("Komentar mora biti tekst.", 400);
    }

    if (body.trainerComment.length > 2000) {
      return deny("Komentar je predug.", 400);
    }

    comment = body.trainerComment.trim();
  }

  try {
    const result = await adminDb.runTransaction(
      async (transaction) => {
        const trainerSnapshot = await transaction.get(
          adminDb.collection("users").doc(trainerUid)
        );

        const trainer = trainerSnapshot.data();
        const gymId = str(trainer?.gymId);

        if (!trainerSnapshot.exists || !validId(gymId)) {
          throw new ApiError(403, "Pristup nije dopusten.");
        }

        const gymRef = adminDb
          .collection("gyms")
          .doc(gymId);

        const trainerMemberRef = adminDb
          .collection("gymMembers")
          .doc(gymId)
          .collection("members")
          .doc(trainerUid);

        const clientRef = adminDb
          .collection("clients")
          .doc(clientId);

        const clientMemberRef = adminDb
          .collection("gymMembers")
          .doc(gymId)
          .collection("members")
          .doc(clientId);

        const checkinRef = clientRef
          .collection("checkins")
          .doc(checkinId);

        const [
          gymSnapshot,
          trainerMemberSnapshot,
          clientSnapshot,
          clientMemberSnapshot,
          checkinSnapshot,
        ] = await Promise.all([
          transaction.get(gymRef),
          transaction.get(trainerMemberRef),
          transaction.get(clientRef),
          transaction.get(clientMemberRef),
          transaction.get(checkinRef),
        ]);

        const gym = gymSnapshot.data();
        const trainerMember =
          trainerMemberSnapshot.data();
        const client = clientSnapshot.data();
        const clientMember =
          clientMemberSnapshot.data();

        const trainerRole =
          trainerMember?.gymRole ??
          trainerMember?.role;
        const ownerIsAssignedCoach =
          trainer?.role === "gym_owner" &&
          gym?.ownerId === trainerUid &&
          trainer?.gymId === gymId;
        const teamTrainerIsAssigned =
          trainer?.role === "trainer" &&
          trainerMemberSnapshot.exists &&
          trainerRole === "trainer" &&
          trainerMember?.gymId === gymId;

        const clientRole =
          clientMember?.gymRole ??
          clientMember?.role;

        if (
          !gymSnapshot.exists ||
          !str(gym?.ownerId) ||
          (!ownerIsAssignedCoach && !teamTrainerIsAssigned) ||
          !clientSnapshot.exists ||
          !clientMemberSnapshot.exists ||
          clientRole !== "client" ||
          client?.gymId !== gymId ||
          clientMember?.gymId !== gymId ||
          client?.trainerId !== trainerUid ||
          clientMember?.trainerId !== trainerUid
        ) {
          throw new ApiError(
            403,
            "Check-in nije dostupan."
          );
        }

        if (!checkinSnapshot.exists) {
          throw new ApiError(
            404,
            "Check-in nije pronaden."
          );
        }

        const checkin = checkinSnapshot.data() ?? {};

        if (action === "review") {
          if (checkin.reviewed === true) {
            return { changed: false };
          }

          transaction.update(checkinRef, {
            reviewed: true,
            reviewedAt: FieldValue.serverTimestamp(),
          });

          return { changed: true };
        }

        const previousComment =
          typeof checkin.trainerComment === "string"
            ? checkin.trainerComment
            : "";

        if (previousComment === comment) {
          return { changed: false };
        }

        transaction.update(checkinRef, {
          trainerComment: comment,
          trainerCommentAt:
            FieldValue.serverTimestamp(),
        });

        if (comment.length > 0) {
          const hadComment =
            previousComment.trim().length > 0;

          const notificationRef = adminDb
            .collection("notifications")
            .doc();

          transaction.set(notificationRef, {
            userId: clientId,
            title: hadComment
              ? "Ažuriran komentar trenera"
              : "Odgovor trenera",
            message: hadComment
              ? "Trener je ažurirao komentar na tvom check-inu."
              : "Trener je odgovorio na tvoj check-in.",
            type: "checkin",
            link:
              `/dashboard/client?tab=checkin&checkin=${encodeURIComponent(checkinId)}`,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        return { changed: true };
      }
    );

    return NextResponse.json(
      {
        success: true,
        action,
        changed: result.changed,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return deny(error.message, error.status);
    }

    console.error(
      "Greska pri uredivanju check-ina:",
      error
    );

    return deny(
      "Promjenu trenutno nije moguce spremiti.",
      500
    );
  }
}