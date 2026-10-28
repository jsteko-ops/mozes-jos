import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { authorizeExistingChat } from "@/lib/server/chatAccess";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ chatId: string }> };
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
export async function POST(request: Request, context: Context) {
  try {
    const { chatId } = await context.params;
    const access = await authorizeExistingChat(request, chatId);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const body = await request.json().catch(() => null);
    const action = body?.action;
    const chatRef = adminDb.collection("chats").doc(chatId);
    if (action === "read") {
      await chatRef.update(access.role === "trainer" ? { unreadForTrainer: false } : { unreadForClient: false });
      return reply({ ok: true });
    }
    if (action !== "send") return reply({ error: "Nepoznata radnja." }, 400);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 4000) return reply({ error: "Poruka mora imati od 1 do 4000 znakova." }, 400);
    const receiverId = access.role === "trainer" ? access.clientId : access.trainerId;
    const msgRef = chatRef.collection("messages").doc();
    const notifyRef = adminDb.collection("notifications").doc();
    const batch = adminDb.batch();
    batch.create(msgRef, { senderId: access.uid, text, createdAt: FieldValue.serverTimestamp() });
    batch.update(chatRef, { lastMessage: text, lastSenderId: access.uid, updatedAt: FieldValue.serverTimestamp(), unreadForTrainer: access.role === "client", unreadForClient: access.role === "trainer" });
    batch.create(notifyRef, { userId: receiverId, title: "Nova poruka 💬", message: text.slice(0, 240), type: "chat", link: "/dashboard/chat", read: false, createdAt: FieldValue.serverTimestamp() });
    await batch.commit();
    return reply({ ok: true, messageId: msgRef.id }, 201);
  } catch (error) {
    console.error("Chat action POST:", error);
    return reply({ error: "Radnja na razgovoru nije uspjela." }, 500);
  }
}

export async function GET(request: Request, context: Context) {
  try {
    const { chatId } = await context.params;
    const access = await authorizeExistingChat(request, chatId);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const snap = await adminDb.collection("chats").doc(chatId).collection("messages")
      .orderBy("createdAt", "desc").limit(250).get();
    const messages = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId === access.trainerId || data.senderId === access.clientId ? data.senderId : "",
        text: typeof data.text === "string" ? data.text : "",
        createdAt: data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate().toISOString() : null,
      };
    }).reverse();
    return reply({ messages });
  } catch (error) {
    console.error("Chat messages GET:", error);
    return reply({ error: "Poruke nije moguće učitati." }, 500);
  }
}
