import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ clientId: string }>;
};

function deny(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
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

export async function GET(
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

  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  const { clientId } = await context.params;

  if (!validId(clientId)) {
    return deny("Neispravan ID klijenta.", 400);
  }

  try {
    const trainerSnapshot = await adminDb
      .collection("users")
      .doc(uid)
      .get();

    const trainer = trainerSnapshot.data();
    const gymId = str(trainer?.gymId);

    if (
      !trainerSnapshot.exists ||
      trainer?.role !== "trainer" ||
      !validId(gymId)
    ) {
      return deny("Pristup nije dopusten.", 403);
    }

    const [
      gymSnapshot,
      trainerMemberSnapshot,
      clientSnapshot,
      clientMemberSnapshot,
    ] = await Promise.all([
      adminDb.collection("gyms").doc(gymId).get(),

      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(uid)
        .get(),

      adminDb.collection("clients").doc(clientId).get(),

      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(clientId)
        .get(),
    ]);

    const gym = gymSnapshot.data();
    const trainerMember = trainerMemberSnapshot.data();
    const client = clientSnapshot.data();
    const clientMember = clientMemberSnapshot.data();

    const trainerRole =
      trainerMember?.gymRole ?? trainerMember?.role;

    const clientRole =
      clientMember?.gymRole ?? clientMember?.role;

    if (
      !gymSnapshot.exists ||
      !str(gym?.ownerId) ||
      !trainerMemberSnapshot.exists ||
      trainerRole !== "trainer" ||
      trainerMember?.gymId !== gymId ||
      !clientSnapshot.exists ||
      !clientMemberSnapshot.exists ||
      clientRole !== "client" ||
      client?.gymId !== gymId ||
      clientMember?.gymId !== gymId ||
      client?.trainerId !== uid ||
      clientMember?.trainerId !== uid
    ) {
      return deny("Klijent nije dostupan.", 403);
    }

    return NextResponse.json(
      {
        client: {
          id: clientSnapshot.id,
          name: str(client.name),
          email: str(client.email),
          phone: str(client.phone),
          note: str(client.note),
          goal: str(client.goal),
          trainerId: uid,
          gymId,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Greska pri dohvatu profila:", error);

    return deny(
      "Profil trenutno nije moguce ucitati.",
      500
    );
  }
}