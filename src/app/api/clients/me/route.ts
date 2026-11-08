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

    if (
      !gymSnap.exists ||
      !memberSnap.exists ||
      membership?.role !== "client" ||
      membership?.gymId !== gymId
    ) {
      return NextResponse.json(
        { error: "Klijentski profil nije dostupan." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        client: {
          id: uid,
          name: typeof client?.name === "string" ? client.name : "",
          email: typeof client?.email === "string" ? client.email : "",
          phone: typeof client?.phone === "string" ? client.phone : "",
          goal: typeof client?.goal === "string" ? client.goal : "",
          trainerId: typeof client?.trainerId === "string" ? client.trainerId : "",
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
