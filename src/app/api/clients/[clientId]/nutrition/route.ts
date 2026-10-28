import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess } from "@/lib/server/nutritionAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string }> };

function reply(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function iso(value: unknown): string | null {
  if (!value) return null;
  const date =
    value instanceof Date ? value :
    typeof value === "object" && "toDate" in value && typeof value.toDate === "function"
      ? (value.toDate() as Date)
      : typeof value === "string" ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export async function GET(request: Request, context: Context) {
  try {
    const { clientId } = await context.params;
    const access = await nutritionAccess(request, clientId, false);
    if (access.ok === false) return reply({ error: access.error }, access.status);

    const snapshot = await adminDb.collection("clients").doc(clientId)
      .collection("nutrition").get();
    const plans = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: typeof data.title === "string" ? data.title : "",
        meals: typeof data.meals === "string" ? data.meals : "",
        createdAt: iso(data.createdAt),
        updatedAt: iso(data.updatedAt),
      };
    });
    plans.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return reply({ plans });
  } catch (error) {
    console.error("Nutrition GET error:", error);
    return reply({ error: "Planove prehrane nije moguće učitati." }, 500);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { clientId } = await context.params;
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

    const ref = adminDb.collection("clients").doc(clientId).collection("nutrition").doc();
    const notification = adminDb.collection("notifications").doc();
    const batch = adminDb.batch();
    batch.create(ref, { title, meals, createdAt: FieldValue.serverTimestamp() });
    batch.create(notification, {
      userId: clientId,
      title: "Novi plan prehrane",
      message: `Trener ti je dodao plan prehrane: ${title}.`,
      type: "nutrition",
      link: `/dashboard/nutrition?plan=${ref.id}`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return reply({ ok: true, id: ref.id }, 201);
  } catch (error) {
    console.error("Nutrition POST error:", error);
    return reply({ error: "Plan prehrane nije moguće spremiti." }, 500);
  }
}
