import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess, validDocumentId } from "@/lib/server/nutritionAccess";
import { parseWorkoutBody } from "@/lib/server/workoutValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string; workoutId: string }> };

function reply(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { clientId, workoutId } = await context.params;
    if (!validDocumentId(workoutId)) return reply({ error: "Neispravan ID plana." }, 400);
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const parsed = parseWorkoutBody(await request.json().catch(() => null));
    if (parsed.ok === false) return reply({ error: parsed.error }, 400);

    const ref = adminDb.collection("clients").doc(clientId).collection("workouts").doc(workoutId);
    const existing = await ref.get();
    if (!existing.exists) return reply({ error: "Plan nije pronađen." }, 404);
    await ref.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
    return reply({ ok: true });
  } catch (error) {
    console.error("Workout PATCH error:", error);
    return reply({ error: "Trening plan nije moguće ažurirati." }, 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { clientId, workoutId } = await context.params;
    if (!validDocumentId(workoutId)) return reply({ error: "Neispravan ID plana." }, 400);
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const ref = adminDb.collection("clients").doc(clientId).collection("workouts").doc(workoutId);
    const existing = await ref.get();
    if (!existing.exists) return reply({ error: "Plan nije pronađen." }, 404);
    await ref.delete();
    return reply({ ok: true });
  } catch (error) {
    console.error("Workout DELETE error:", error);
    return reply({ error: "Trening plan nije moguće obrisati." }, 500);
  }
}
