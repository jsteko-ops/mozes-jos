import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function iso(value: unknown): string | null {
  if (!value) return null;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate() as Date;
  } else if (typeof value === "string") {
    date = new Date(value);
  } else {
    return null;
  }

  return Number.isFinite(date.getTime())
    ? date.toISOString()
    : null;
}

export async function GET(request: Request) {
  const authorization =
    request.headers.get("authorization") ?? "";

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return deny("Prijava je potrebna.", 401);
  }

  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(
      token,
      true
    );

    uid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  if (!validId(uid)) {
    return deny("Neispravan korisnicki ID.", 403);
  }

  try {
    const userRef = adminDb.collection("users").doc(uid);
    const clientRef = adminDb.collection("clients").doc(uid);

    const [userSnapshot, clientSnapshot] =
      await Promise.all([
        userRef.get(),
        clientRef.get(),
      ]);

    if (
      !userSnapshot.exists ||
      userSnapshot.data()?.role !== "client"
    ) {
      return deny("Pristup nije dopusten.", 403);
    }

    if (!clientSnapshot.exists) {
      return deny("Klijentski profil nije pronaden.", 404);
    }

    const user = userSnapshot.data();
    const client = clientSnapshot.data();

    const gymId = str(client?.gymId);
    const userGymId = str(user?.gymId);
    const trainerId = str(client?.trainerId);

    if (
      !validId(gymId) ||
      (userGymId && userGymId !== gymId) ||
      (trainerId && !validId(trainerId))
    ) {
      return deny("Povezanost s teretanom nije valjana.", 403);
    }

    const gymRef = adminDb.collection("gyms").doc(gymId);

    const memberRef = adminDb
      .collection("gymMembers")
      .doc(gymId)
      .collection("members")
      .doc(uid);

    const trainerRef = trainerId
      ? adminDb
          .collection("gymMembers")
          .doc(gymId)
          .collection("members")
          .doc(trainerId)
      : null;
    const trainerUserRef = trainerId
      ? adminDb.collection("users").doc(trainerId)
      : null;

    const [
      gymSnapshot,
      memberSnapshot,
      trainerSnapshot,
      trainerUserSnapshot,
    ] = await Promise.all([
      gymRef.get(),
      memberRef.get(),
      trainerRef ? trainerRef.get() : Promise.resolve(null),
      trainerUserRef ? trainerUserRef.get() : Promise.resolve(null),
    ]);

    const gym = gymSnapshot.data();
    const member = memberSnapshot.data();
    const trainer = trainerSnapshot?.data();
    const trainerUser = trainerUserSnapshot?.data();

    const memberRole = member?.gymRole ?? member?.role;
    const trainerRole = trainer?.gymRole ?? trainer?.role;
    const ownerIsAssignedCoach =
      Boolean(trainerId) &&
      trainerId === str(gym?.ownerId) &&
      trainerUser?.role === "gym_owner" &&
      str(trainerUser?.gymId) === gymId;
    const teamTrainerIsAssigned =
      Boolean(trainerId) &&
      trainerSnapshot?.exists === true &&
      trainerRole === "trainer" &&
      trainer?.gymId === gymId;

    if (
      !gymSnapshot.exists ||
      !validId(str(gym?.ownerId)) ||
      !memberSnapshot.exists ||
      memberRole !== "client" ||
      member?.gymId !== gymId ||
      str(member?.trainerId) !== trainerId
    ) {
      return deny("Check-inovi nisu dostupni.", 403);
    }

    if (
      trainerId &&
      !ownerIsAssignedCoach &&
      !teamTrainerIsAssigned
    ) {
      return deny("Dodjela trenera nije valjana.", 403);
    }

    // UID dolazi iz provjerenog tokena.
    // Nije moguce zatraziti ID drugog klijenta.
    const snapshot = await clientRef
      .collection("checkins")
      .get();

    const checkins = snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        weight: data.weight ?? null,
        energy: data.energy ?? null,
        sleep: data.sleep ?? null,
        hunger: data.hunger ?? null,
        water: str(data.water),
        comment: str(data.comment),
        photos: Array.isArray(data.photos)
          ? data.photos.filter(
              (photo: unknown) => typeof photo === "string"
            )
          : [],
        reviewed: data.reviewed === true,
        trainerComment: str(data.trainerComment),
        clientReply: str(data.clientReply),
        createdAt: iso(data.createdAt),
        updatedAt: iso(data.updatedAt),
        reviewedAt: iso(data.reviewedAt),
        trainerCommentAt: iso(data.trainerCommentAt),
      };
    });

    checkins.sort(
      (a, b) =>
        (Date.parse(b.createdAt ?? "") || 0) -
        (Date.parse(a.createdAt ?? "") || 0)
    );

    return NextResponse.json(
      { clientId: uid, checkins },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Greska pri dohvatu vlastitih check-inova:",
      error
    );

    return deny(
      "Check-inove trenutno nije moguce ucitati.",
      500
    );
  }
}