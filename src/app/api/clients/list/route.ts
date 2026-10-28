import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toIsoDate(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const timestamp = value as { toDate?: () => Date };

  if (typeof timestamp.toDate !== "function") {
    return null;
  }

  const date = timestamp.toDate();

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
    return errorResponse("Prijava je potrebna.", 401);
  }

  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return errorResponse("Prijava nije valjana.", 401);
  }

  try {
    const profileSnapshot = await adminDb
      .collection("users")
      .doc(uid)
      .get();

    if (!profileSnapshot.exists) {
      return errorResponse("Korisnicki profil nije pronaden.", 403);
    }

    const profile = profileSnapshot.data();

    const role = asString(profile?.role);
    const gymId = asString(profile?.gymId);

    if (
      !gymId ||
      gymId.includes("/") ||
      (role !== "gym_owner" && role !== "trainer")
    ) {
      return errorResponse("Pristup nije dopusten.", 403);
    }

    const gymSnapshot = await adminDb
      .collection("gyms")
      .doc(gymId)
      .get();

    if (!gymSnapshot.exists) {
      return errorResponse("Teretana nije pronadena.", 403);
    }

    const gymOwnerId = asString(gymSnapshot.data()?.ownerId);

    if (!gymOwnerId) {
      return errorResponse("Teretana nema valjanog vlasnika.", 403);
    }

    if (role === "gym_owner" && gymOwnerId !== uid) {
      return errorResponse("Nisi vlasnik ove teretane.", 403);
    }

    const url = new URL(request.url);

    const trainerId = asString(
      url.searchParams.get("trainerId")
    );

    if (
      !trainerId ||
      trainerId.length > 128 ||
      trainerId.includes("/")
    ) {
      return errorResponse("Neispravan ID trenera.", 400);
    }

    if (role === "trainer" && trainerId !== uid) {
      return errorResponse(
        "Mozes citati samo svoje klijente.",
        403
      );
    }

    const trainerSnapshot = await adminDb
      .collection("users")
      .doc(trainerId)
      .get();

    const trainerData = trainerSnapshot.data();

    if (
      !trainerSnapshot.exists ||
      trainerData?.role !== "trainer" ||
      trainerData?.gymId !== gymId
    ) {
      return errorResponse(
        "Trener ne pripada ovoj teretani.",
        403
      );
    }

    const memberSnapshot = await adminDb
      .collection("gymMembers")
      .doc(gymId)
      .collection("members")
      .doc(trainerId)
      .get();

    const member = memberSnapshot.data();
    const memberRole = member?.gymRole ?? member?.role;

    if (
      !memberSnapshot.exists ||
      memberRole !== "trainer" ||
      member?.gymId !== gymId
    ) {
      return errorResponse(
        "Trener nema valjano clanstvo.",
        403
      );
    }

    const snapshot = await adminDb
      .collection("clients")
      .where("gymId", "==", gymId)
      .where("trainerId", "==", trainerId)
      .get();

    const clients: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      note: string;
      goal: string;
      trainerId: string;
      gymId: string;
      createdAt: string | null;
    }> = [];

    for (let index = 0; index < snapshot.docs.length; index += 50) {
      const page = snapshot.docs.slice(index, index + 50);

      const membershipSnapshots = await Promise.all(
        page.map((clientDoc) =>
          adminDb
            .collection("gymMembers")
            .doc(gymId)
            .collection("members")
            .doc(clientDoc.id)
            .get()
        )
      );

      for (let offset = 0; offset < page.length; offset++) {
        const clientDoc = page[offset];
        const memberSnapshot = membershipSnapshots[offset];
        const member = memberSnapshot.data();



        if (
          !memberSnapshot.exists ||
          (member?.gymRole ?? member?.role) !== "client" ||
          member?.gymId !== gymId ||
          member?.trainerId !== trainerId
        ) {
          continue;
        }

        const data = clientDoc.data();

        clients.push({
          id: clientDoc.id,
          name: asString(data.name),
          email: asString(data.email),
          phone: asString(data.phone),
          note: asString(data.note),
          goal: asString(data.goal),
          trainerId,
          gymId,
          createdAt: toIsoDate(data.createdAt),
        });
      }
    }

    return NextResponse.json(
      { gymId, trainerId, clients },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (error) {
    console.error("Greska pri dohvatu klijenata:", error);

    return errorResponse(
      "Dohvat klijenata trenutno nije moguc.",
      500
    );
  }
}