import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess } from "@/lib/server/nutritionAccess";
import { parseWorkoutBody } from "@/lib/server/workoutValidation";

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
  const date = value instanceof Date ? value :
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
      .collection("workouts").get();
    const workouts = snapshot.docs.map((entry) => {
      const data = entry.data();
      return {
        id: entry.id,
        title: typeof data.title === "string" ? data.title : "",
        exercises: typeof data.exercises === "string" ? data.exercises : "",
        createdAt: iso(data.createdAt),
        updatedAt: iso(data.updatedAt),
      };
    });
    workouts.sort((a, b) => (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""));
    return reply({ workouts });
  } catch (error) {
    console.error("Workout GET error:", error);
    return reply({ error: "Trening planove nije moguće učitati." }, 500);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { clientId } = await context.params;
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const parsed = parseWorkoutBody(await request.json().catch(() => null));
    if (parsed.ok === false) return reply({ error: parsed.error }, 400);

    const ref = adminDb.collection("clients").doc(clientId).collection("workouts").doc();

    // Primatelj je iskljucivo klijent kojemu zaista pripada ova teretana.
    // Ako jos nema korisnicki racun, plan se ipak sprema, bez obavijesti.
    const userSnap = await adminDb.collection("users").doc(clientId).get();
    const recipient = userSnap.data();
    const notified = userSnap.exists && recipient?.role === "client" &&
      recipient?.gymId === access.gymId;

    const batch = adminDb.batch();
    batch.create(ref, {
      ...parsed.data,
      createdBy: access.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (notified) {
      const notification = adminDb.collection("notifications").doc();
      batch.create(notification, {
        userId: clientId,
        title: "Novi trening plan",
        message: `Dodan ti je novi trening plan: ${parsed.data.title}.`,
        type: "workout",
        link: `/dashboard/client/workouts#plan-${encodeURIComponent(ref.id)}`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
    return reply({ ok: true, id: ref.id, notified }, 201);
  } catch (error) {
    console.error("Workout POST error:", error);
    return reply({ error: "Trening plan nije moguće spremiti." }, 500);
  }
}
