import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { authorizeChatPair } from "@/lib/server/chatAccess";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const trainerId = typeof body?.trainerId === "string" ? body.trainerId.trim() : "";
    const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
    const access = await authorizeChatPair(request, trainerId, clientId);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const chatId = `${trainerId}_${clientId}`;
    if (chatId.length > 500) return reply({ error: "Neispravan razgovor." }, 400);
    const ref = adminDb.collection("chats").doc(chatId);
    const existing = await ref.get();
    if (!existing.exists) {
      try {
        await ref.create({ trainerId, clientId, gymId: access.gymId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), unreadForTrainer: false, unreadForClient: false });
      } catch (error) {
        // Dva sudionika mogu pokušati otvoriti isti razgovor istodobno.
        const concurrent = await ref.get();
        if (!concurrent.exists) throw error;
      }
    } else if (existing.data()?.trainerId !== trainerId || existing.data()?.clientId !== clientId ||
               (existing.data()?.gymId && existing.data()?.gymId !== access.gymId)) {
      return reply({ error: "Neispravan razgovor." }, 403);
    }
    return reply({ chatId });
  } catch (error) {
    console.error("Chat session POST:", error);
    return reply({ error: "Razgovor nije moguće otvoriti." }, 500);
  }
}
