import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess, validDocumentId } from "@/lib/server/nutritionAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string; planId: string }> };

function reply(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { clientId, planId } = await context.params;
    if (!validDocumentId(planId)) return reply({ error: "Neispravan plan." }, 400);
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);

    const data: unknown = await request.json().catch(() => null);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return reply({ error: "Neispravan zahtjev." }, 400);
    }
    const body = data as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const meals = typeof body.meals === "string" ? body.meals.trim() : "";
    if (!title || title.length > 120 || !meals || meals.length > 30000) {
      return reply({ error: "Neispravan naziv ili sadržaj plana." }, 400);
    }

    const ref = adminDb.collection("clients").doc(clientId).collection("nutrition").doc(planId);
    const existing = await ref.get();
    if (!existing.exists) return reply({ error: "Plan nije pronađen." }, 404);

    const notification = adminDb.collection("notifications").doc();
    const batch = adminDb.batch();
    batch.update(ref, { title, meals, updatedAt: FieldValue.serverTimestamp() });
    batch.create(notification, {
      userId: clientId,
      title: "Plan prehrane je ažuriran",
      message: `Trener je izmijenio tvoj plan prehrane: ${title}.`,
      type: "nutrition",
      link: `/dashboard/nutrition?plan=${planId}`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return reply({ ok: true });
  } catch (error) {
    console.error("Nutrition PATCH error:", error);
    return reply({ error: "Plan nije moguće ažurirati." }, 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { clientId, planId } = await context.params;
    if (!validDocumentId(planId)) return reply({ error: "Neispravan plan." }, 400);
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);

    const ref = adminDb.collection("clients").doc(clientId).collection("nutrition").doc(planId);
    const existing = await ref.get();
    if (!existing.exists) return reply({ error: "Plan nije pronađen." }, 404);
    await ref.delete();
    return reply({ ok: true });
  } catch (error) {
    console.error("Nutrition DELETE error:", error);
    return reply({ error: "Plan nije moguće obrisati." }, 500);
  }
}
