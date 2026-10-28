import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { nutritionAccess } from "@/lib/server/nutritionAccess";
import { parseMeasurementInput } from "@/lib/server/measurementValidation";

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
      ? (value.toDate() as Date) :
    typeof value === "string" ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export async function GET(request: Request, context: Context) {
  try {
    const { clientId } = await context.params;
    const access = await nutritionAccess(request, clientId, false);
    if (access.ok === false) return reply({ error: access.error }, access.status);

    const snap = await adminDb.collection("clients").doc(clientId)
      .collection("measurements").get();
    const measurements = snap.docs.map((item) => {
      const d = item.data();
      return {
        id: item.id,
        weight: typeof d.weight === "number" ? d.weight : null,
        bodyFat: typeof d.bodyFat === "number" ? d.bodyFat : null,
        height: typeof d.height === "number" ? d.height : null,
        waist: typeof d.waist === "number" ? d.waist : null,
        chest: typeof d.chest === "number" ? d.chest : null,
        arm: typeof d.arm === "number" ? d.arm : null,
        notes: typeof d.notes === "string" ? d.notes : "",
        createdAt: iso(d.createdAt),
        updatedAt: iso(d.updatedAt),
      };
    });
    measurements.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return reply({ measurements });
  } catch (error) {
    console.error("Measurements GET error:", error);
    return reply({ error: "Mjerenja nije moguće učitati." }, 500);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { clientId } = await context.params;
    const access = await nutritionAccess(request, clientId, true);
    if (access.ok === false) return reply({ error: access.error }, access.status);

    const parsed = parseMeasurementInput(await request.json().catch(() => null), true);
    if (parsed.ok === false) return reply({ error: parsed.error }, 400);

    // Pravilo: prvo mjerenje besplatno, dodatna zahtijevaju aktivnu Pro pretplatu.
    // Provjera je na serveru, a ne u podacima koje šalje preglednik.
    const collectionRef = adminDb.collection("clients").doc(clientId).collection("measurements");
    const billingUserRef = adminDb.collection("users").doc(access.uid);
    const id = collectionRef.doc();
    const outcome = await adminDb.runTransaction(async (tx) => {
      const [billing, anyMeasurement] = await Promise.all([
        tx.get(billingUserRef),
        tx.get(collectionRef.limit(1)),
      ]);
      const profile = billing.data();
      const pro = profile?.isPremium === true && profile?.subscriptionStatus === "active";
      if (!pro && !anyMeasurement.empty) return "PRO_REQUIRED";
      tx.create(id, {
        ...parsed.data,
        trainerId: access.role === "trainer" ? access.uid : null,
        createdBy: access.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return "OK";
    });
    if (outcome === "PRO_REQUIRED") {
      return reply({ error: "Prvo mjerenje je besplatno. Za dodatna mjerenja potreban je Možeš JoŠ Pro." }, 403);
    }
    return reply({ ok: true, id: id.id }, 201);
  } catch (error) {
    console.error("Measurements POST error:", error);
    return reply({ error: "Mjerenje nije moguće spremiti." }, 500);
  }
}
