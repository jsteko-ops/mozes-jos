import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
function validId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 128 && v !== "." && v !== ".." && !v.includes("/");
}
export async function POST(request: Request) {
  try {
    const header = request.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return reply({ error: "Prijava je potrebna." }, 401);
    let uid: string;
    try { uid = (await adminAuth.verifyIdToken(token, true)).uid; }
    catch { return reply({ error: "Prijava nije valjana." }, 401); }
    if (!validId(uid)) return reply({ error: "Pristup nije dopušten." }, 403);
    const body = await request.json().catch(() => null);
    const action = body?.action;
    if (action === "read" || action === "delete") {
      const id = body?.id;
      if (!validId(id)) return reply({ error: "Neispravan ID obavijesti." }, 400);
      const ref = adminDb.collection("notifications").doc(id);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.userId !== uid) return reply({ error: "Pristup nije dopušten." }, 403);
      if (action === "read") await ref.update({ read: true });
      else await ref.delete();
      return reply({ ok: true });
    }
    if (action !== "read-all" && action !== "delete-read") return reply({ error: "Nepoznata radnja." }, 400);
    const snapshot = await adminDb.collection("notifications").where("userId", "==", uid).get();
    const selected = snapshot.docs.filter((d) => action === "read-all" ? d.data().read !== true : d.data().read === true);
    // Batch limit: 500 Firestore writes. Keep batches <=400.
    for (let i=0; i<selected.length; i+=400) {
      const batch = adminDb.batch();
      for (const item of selected.slice(i, i+400)) {
        if (action === "read-all") batch.update(item.ref, { read: true });
        else batch.delete(item.ref);
      }
      await batch.commit();
    }
    return reply({ ok: true, count: selected.length });
  } catch (error) {
    console.error("Notification action:", error);
    return reply({ error: "Obavijest nije moguće ažurirati." }, 500);
  }
}
