import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(request: Request) {
  try {
    const header = request.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return reply({ error: "Prijava je potrebna." }, 401);
    let uid: string;
    try { uid = (await adminAuth.verifyIdToken(token, true)).uid; }
    catch { return reply({ error: "Prijava nije valjana." }, 401); }
    if (!uid || uid.length > 128 || /[\\/]/.test(uid)) return reply({ error: "Pristup nije dopušten." }, 403);
    const snap = await adminDb.collection("notifications").where("userId", "==", uid)
      .orderBy("createdAt", "desc").limit(300).get();
    const notifications = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, title: typeof data.title === "string" ? data.title : "",
        message: typeof data.message === "string" ? data.message : "",
        read: data.read === true, type: typeof data.type === "string" ? data.type : "",
        link: typeof data.link === "string" && data.link.startsWith("/dashboard/") && !data.link.startsWith("//") ? data.link : null,
        createdAt: data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate().toISOString() : null,
      };
    });
    return reply({ notifications });
  } catch (error) {
    console.error("Notifications list GET:", error);
    return reply({ error: "Obavijesti nije moguće učitati." }, 500);
  }
}
