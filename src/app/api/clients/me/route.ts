import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(authorization.slice(7).trim(), true)).uid;
  } catch {
    return NextResponse.json({ error: "Prijava nije valjana." }, { status: 401 });
  }

  try {
    const [userSnap, clientSnap] = await Promise.all([
      adminDb.collection("users").doc(uid).get(),
      adminDb.collection("clients").doc(uid).get(),
    ]);

    const user = userSnap.data();
    const client = clientSnap.data();
    const gymId = typeof client?.gymId === "string" ? client.gymId.trim() : "";

    if (
      !userSnap.exists ||
      !clientSnap.exists ||
      user?.role !== "client" ||
      !gymId ||
      user?.gymId !== gymId ||
      (client?.role != null && client.role !== "client")
    ) {
      return NextResponse.json(
        { error: "Klijentski profil nije dostupan." },
        { status: 403 }
      );
    }

    const [gymSnap, memberSnap] = await Promise.all([
      adminDb.collection("gyms").doc(gymId).get(),
      adminDb.collection("gymMembers").doc(gymId).collection("members").doc(uid).get(),
    ]);
    const membership = memberSnap.data();
    const memberRole = membership?.gymRole ?? membership?.role;

    if (
      !gymSnap.exists ||
      !memberSnap.exists ||
      memberRole !== "client" ||
      membership?.gymId !== gymId
    ) {
      return NextResponse.json(
        { error: "Klijentski profil nije dostupan." },
        { status: 403 }
      );
    }

    const trainerId =
      typeof client?.trainerId === "string" ? client.trainerId.trim() : "";
    let trainer: { name: string; isOwner: boolean } | null = null;

    if (trainerId) {
      const trainerMemberRef = adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(trainerId);
      const [trainerMemberSnap, trainerUserSnap] = await Promise.all([
        trainerMemberRef.get(),
        adminDb.collection("users").doc(trainerId).get(),
      ]);
      const trainerMember = trainerMemberSnap.data() ?? {};
      const trainerUser = trainerUserSnap.data() ?? {};
      const trainerRole = trainerMember.gymRole ?? trainerMember.role;
      const isOwner =
        trainerId === gymSnap.data()?.ownerId &&
        trainerUser.role === "gym_owner" &&
        trainerUser.gymId === gymId;
      const isTeamTrainer =
        trainerMemberSnap.exists &&
        trainerRole === "trainer" &&
        trainerMember.gymId === gymId &&
        trainerUser.role === "trainer" &&
        trainerUser.gymId === gymId;

      if (!isOwner && !isTeamTrainer) {
        return NextResponse.json(
          { error: "Dodjela trenera nije valjana." },
          { status: 403 }
        );
      }

      const fullName = [trainerUser.firstName, trainerUser.lastName]
        .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
        .join(" ");
      const nameCandidates = [
        trainerMember.name,
        trainerMember.displayName,
        trainerUser.displayName,
        trainerUser.name,
        fullName,
      ];
      const name = nameCandidates.find(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      );

      trainer = {
        name: name?.trim() || (isOwner ? "Vlasnik teretane" : "Trener"),
        isOwner,
      };
    }

    return NextResponse.json(
      {
        client: {
          id: uid,
          name: typeof client?.name === "string" ? client.name : "",
          email: typeof client?.email === "string" ? client.email : "",
          phone: typeof client?.phone === "string" ? client.phone : "",
          goal: typeof client?.goal === "string" ? client.goal : "",
          trainerId,
          trainer,
          gymId,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Client self GET error:", error);
    return NextResponse.json(
      { error: "Profil nije moguće učitati." },
      { status: 500 }
    );
  }
}
