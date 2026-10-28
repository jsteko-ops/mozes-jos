import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { nutritionAccess } from "@/lib/server/nutritionAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers.get("authorization") ?? "";
  if (!token.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });
  }
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(token.slice(7).trim(), true)).uid;
  } catch {
    return NextResponse.json({ error: "Prijava nije valjana." }, { status: 401 });
  }

  try {
    const access = await nutritionAccess(request, uid, false);
    if (access.ok === false) {
      return NextResponse.json(
        { error: "Klijentski profil nije dostupan." },
        { status: access.status }
      );
    }
    if (access.role !== "client") {
      return NextResponse.json(
        { error: "Klijentski profil nije dostupan." },
        { status: 403 }
      );
    }
    const snap = await adminDb.collection("clients").doc(uid).get();
    const data = snap.data();
    return NextResponse.json({
      client: {
        id: uid,
        name: typeof data?.name === "string" ? data.name : "",
        email: typeof data?.email === "string" ? data.email : "",
        phone: typeof data?.phone === "string" ? data.phone : "",
        goal: typeof data?.goal === "string" ? data.goal : "",
        trainerId: typeof data?.trainerId === "string" ? data.trainerId : "",
        gymId: access.gymId,
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Client self GET error:", error);
    return NextResponse.json({ error: "Profil nije moguće učitati." }, { status: 500 });
  }
}
