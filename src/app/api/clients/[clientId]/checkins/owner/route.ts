import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { gymClientAccess, str } from "@/lib/server/gymClientAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string }> };
const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});
function iso(value: unknown): string | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as Date;
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return null;
}
export async function GET(request: Request, context: Context) {
  const { clientId } = await context.params;
  try {
    const access = await gymClientAccess(request, clientId, ["gym_owner"]);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const snapshot = await adminDb.collection("clients").doc(clientId).collection("checkins").get();
    const checkins = snapshot.docs.map(item => {
      const data = item.data();
      return {
        id: item.id,
        weight: typeof data.weight === "number" ? data.weight : null,
        energy: data.energy ?? null,
        sleep: data.sleep ?? null,
        hunger: data.hunger ?? null,
        water: str(data.water), comment: str(data.comment),
        photos: Array.isArray(data.photos) ? data.photos.filter((photo: unknown) => typeof photo === "string") : [],
        reviewed: data.reviewed === true,
        trainerComment: str(data.trainerComment), clientReply: str(data.clientReply),
        createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt),
        reviewedAt: iso(data.reviewedAt), trainerCommentAt: iso(data.trainerCommentAt),
      };
    });
    checkins.sort((a,b) => (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0));
    return reply({ clientId, checkins });
  } catch (error) {
    console.error("Povijest check-inova nije dostupna:", error);
    return reply({ error: "Povijest check-inova nije dostupna." }, 500);
  }
}
