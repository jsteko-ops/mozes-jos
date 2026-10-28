import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess, validDocumentId } from "@/lib/server/nutritionAccess";
import { parseMeasurementInput } from "@/lib/server/measurementValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string; measurementId: string }> };

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { clientId, measurementId } = await context.params;
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    if (!validDocumentId(measurementId)) return reply({ error: "Neispravan ID mjerenja." }, 400);

    const input = parseMeasurementInput(await request.json().catch(() => null), false);
    if (input.ok === false) return reply({ error: input.error }, 400);
    const ref = adminDb.collection("clients").doc(clientId).collection("measurements").doc(measurementId);
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return false;
      tx.update(ref, { ...input.data, updatedAt: FieldValue.serverTimestamp() });
      return true;
    });
    if (!result) return reply({ error: "Mjerenje nije pronađeno." }, 404);
    return reply({ ok: true });
  } catch (error) {
    console.error("Measurements PATCH error:", error);
    return reply({ error: "Mjerenje nije moguće izmijeniti." }, 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { clientId, measurementId } = await context.params;
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    if (!validDocumentId(measurementId)) return reply({ error: "Neispravan ID mjerenja." }, 400);

    const ref = adminDb.collection("clients").doc(clientId).collection("measurements").doc(measurementId);
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return false;
      tx.delete(ref);
      return true;
    });
    if (!result) return reply({ error: "Mjerenje nije pronađeno." }, 404);
    return reply({ ok: true });
  } catch (error) {
    console.error("Measurements DELETE error:", error);
    return reply({ error: "Mjerenje nije moguće obrisati." }, 500);
  }
}
