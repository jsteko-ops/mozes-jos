import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ checkinId: string }>;
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
    value.length > 0 &&
    value.length <= 128 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/")
  );
}

export async function POST(request: Request, context: Context) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return deny("Prijava je potrebna.", 401);
  }

  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  const { checkinId } = await context.params;

  if (!validId(checkinId)) {
    return deny("Neispravan ID Check-ina.", 400);
  }

  let body: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (raw.length > 4096) {
      return deny("Zahtjev je prevelik.", 413);
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return deny("Neispravan zahtjev.", 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return deny("Neispravan JSON.", 400);
  }

  if (typeof body.reply !== "string") {
    return deny("Odgovor mora biti tekst.", 400);
  }

  const reply = body.reply.trim();

  if (!reply || reply.length > 2000) {
    return deny("Odgovor mora imati od 1 do 2000 znakova.", 400);
  }

  try {
    const notificationRef = adminDb.collection("notifications").doc();

    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(uid);
      const clientRef = adminDb.collection("clients").doc(uid);
      const checkinRef = clientRef.collection("checkins").doc(checkinId);

      const [userSnapshot, clientSnapshot] = await Promise.all([
        transaction.get(userRef),
        transaction.get(clientRef),
      ]);

      const user = userSnapshot.data();
      const client = clientSnapshot.data();
      const gymId = str(client?.gymId);
      const trainerId = str(client?.trainerId);

      if (
        !userSnapshot.exists ||
        user?.role !== "client" ||
        !clientSnapshot.exists ||
        !validId(gymId) ||
        !validId(trainerId) ||
        (str(user?.gymId) && str(user?.gymId) !== gymId)
      ) {
        throw new ApiError(403, "Pristup nije dopušten.");
      }

      const gymRef = adminDb.collection("gyms").doc(gymId);
      const clientMemberRef = adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(uid);
      const trainerUserRef = adminDb.collection("users").doc(trainerId);
      const trainerMemberRef = adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(trainerId);

      const [
        gymSnapshot,
        clientMemberSnapshot,
        trainerUserSnapshot,
        trainerMemberSnapshot,
        checkinSnapshot,
      ] = await Promise.all([
        transaction.get(gymRef),
        transaction.get(clientMemberRef),
        transaction.get(trainerUserRef),
        transaction.get(trainerMemberRef),
        transaction.get(checkinRef),
      ]);

      const gym = gymSnapshot.data();
      const clientMember = clientMemberSnapshot.data();
      const trainerUser = trainerUserSnapshot.data();
      const trainerMember = trainerMemberSnapshot.data();
      const clientRole = clientMember?.gymRole ?? clientMember?.role;
      const trainerRole = trainerMember?.gymRole ?? trainerMember?.role;

      if (
        !gymSnapshot.exists ||
        !str(gym?.ownerId) ||
        !clientMemberSnapshot.exists ||
        clientRole !== "client" ||
        clientMember?.gymId !== gymId ||
        str(clientMember?.trainerId) !== trainerId ||
        !trainerUserSnapshot.exists ||
        trainerUser?.role !== "trainer" ||
        trainerUser?.gymId !== gymId ||
        !trainerMemberSnapshot.exists ||
        trainerRole !== "trainer" ||
        trainerMember?.gymId !== gymId ||
        !checkinSnapshot.exists
      ) {
        throw new ApiError(403, "Check-in nije dostupan.");
      }

      const checkin = checkinSnapshot.data() ?? {};

      if (!str(checkin.trainerComment)) {
        throw new ApiError(
          409,
          "Trener još nije odgovorio na ovaj Check-in."
        );
      }

      transaction.update(checkinRef, {
        clientReply: reply,
        clientReplyAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(notificationRef, {
        userId: trainerId,
        title: "Novi odgovor klijenta",
        message: "Klijent je odgovorio na tvoj komentar na Check-inu.",
        type: "checkin",
        link: `/dashboard/trainer/checkin?client=${encodeURIComponent(uid)}&checkin=${encodeURIComponent(checkinId)}`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return deny(error.message, error.status);
    }

    console.error("Greška pri spremanju odgovora klijenta:", error);
    return deny("Odgovor trenutačno nije moguće spremiti.", 500);
  }
}
