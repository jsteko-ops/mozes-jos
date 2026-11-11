import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ clientId: string }> };

const reply = (body: object, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

function validId(value: string) {
  return value.length > 0 && value.length <= 128 &&
    value !== "." && value !== ".." && !value.includes("/");
}

export async function PATCH(request: Request, context: Context) {
  const { clientId } = await context.params;

  if (!validId(clientId)) {
    return reply({ error: "Neispravan ID klijenta." }, 400);
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) return reply({ error: "Prijava je potrebna." }, 401);

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(token, true)).uid;
  } catch {
    return reply({ error: "Prijava nije valjana." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "Neispravan zahtjev." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply({ error: "Neispravan zahtjev." }, 400);
  }

  const rawTrainerId = (body as Record<string, unknown>).trainerId;
  if (
    rawTrainerId !== null &&
    typeof rawTrainerId !== "string"
  ) {
    return reply({ error: "Odabrani trener nije valjan." }, 400);
  }

  const trainerId =
    typeof rawTrainerId === "string" ? rawTrainerId.trim() : "";

  if (trainerId && !validId(trainerId)) {
    return reply({ error: "Odabrani trener nije valjan." }, 400);
  }

  try {
    const [ownerSnap, gymSnap, clientSnap, memberSnap] = await Promise.all([
      adminDb.collection("users").doc(uid).get(),
      adminDb.collection("gyms").get(),
      adminDb.collection("clients").doc(clientId).get(),
      Promise.resolve(null),
    ]);

    const owner = ownerSnap.data() ?? {};
    if (!ownerSnap.exists || owner.role !== "gym_owner") {
      return reply({ error: "Samo vlasnik teretane može dodijeliti trenera." }, 403);
    }

    const gymId = typeof owner.gymId === "string" ? owner.gymId.trim() : "";
    if (!validId(gymId)) {
      return reply({ error: "Vlasnički račun nije povezan s teretanom." }, 403);
    }

    const gymRef = adminDb.collection("gyms").doc(gymId);
    const memberRef = adminDb
      .collection("gymMembers")
      .doc(gymId)
      .collection("members")
      .doc(clientId);
    const [gym, member] = await Promise.all([gymRef.get(), memberRef.get()]);
    const gymData = gym.data() ?? {};
    const memberData = member.data() ?? {};
    const memberRole = memberData.gymRole ?? memberData.role;
    const client = clientSnap.data() ?? {};

    if (
      !gym.exists ||
      gymData.ownerId !== uid ||
      !clientSnap.exists ||
      client.gymId !== gymId ||
      !member.exists ||
      memberRole !== "client" ||
      memberData.gymId !== gymId
    ) {
      return reply({ error: "Klijent nije član tvoje teretane." }, 403);
    }

    if (trainerId) {
      const trainerRef = adminDb.collection("users").doc(trainerId);
      const trainerMemberRef = adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(trainerId);
      const [trainerSnap, trainerMemberSnap] = await Promise.all([
        trainerRef.get(),
        trainerMemberRef.get(),
      ]);
      const trainer = trainerSnap.data() ?? {};
      const trainerMember = trainerMemberSnap.data() ?? {};
      const trainerRole = trainerMember.gymRole ?? trainerMember.role;

      if (
        !trainerSnap.exists ||
        trainer.role !== "trainer" ||
        !trainerMemberSnap.exists ||
        trainerRole !== "trainer" ||
        trainerMember.gymId !== gymId
      ) {
        return reply({ error: "Odabrani trener nije član tvoje teretane." }, 400);
      }
    }

    const updatedAt = FieldValue.serverTimestamp();
    const batch = adminDb.batch();
    batch.set(memberRef, { trainerId: trainerId || null, updatedAt }, { merge: true });
    batch.set(
      adminDb.collection("clients").doc(clientId),
      { trainerId: trainerId || null, updatedAt },
      { merge: true }
    );

    const clientUserRef = adminDb.collection("users").doc(clientId);
    const clientUserSnap = await clientUserRef.get();
    if (clientUserSnap.exists) {
      const clientUser = clientUserSnap.data() ?? {};
      if (clientUser.role !== "client" || clientUser.gymId !== gymId) {
        return reply({ error: "Korisnički profil klijenta nije valjan." }, 403);
      }
      batch.set(clientUserRef, { trainerId: trainerId || null, updatedAt }, { merge: true });
    }

    await batch.commit();
    return reply({ ok: true, clientId, trainerId: trainerId || null });
  } catch (error) {
    console.error("Dodjela trenera klijentu nije uspjela:", error);
    return reply({ error: "Trenera trenutačno nije moguće dodijeliti." }, 500);
  }
}
