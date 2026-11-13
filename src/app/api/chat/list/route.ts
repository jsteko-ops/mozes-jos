import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { authorizeChatPair } from "@/lib/server/chatAccess";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const id = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 128 && !/[\\/]/.test(v) && v !== "." && v !== "..";
const date = (v: any): string | null => v && typeof v.toDate === "function" ? v.toDate().toISOString() : null;
export async function GET(request: Request) {
  try {
    const header = request.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return reply({ error: "Prijava je potrebna." }, 401);
    let uid: string;
    try { uid = (await adminAuth.verifyIdToken(token, true)).uid; }
    catch { return reply({ error: "Prijava nije valjana." }, 401); }
    if (!id(uid)) return reply({ error: "Pristup nije dopušten." }, 403);
    const self = await adminDb.collection("users").doc(uid).get();
    const role = self.data()?.role;
    if (role !== "client" && role !== "trainer" && role !== "gym_owner") {
      return reply({ error: "Pristup nije dopušten." }, 403);
    }
    const isTrainer = role === "trainer" || role === "gym_owner";
    const field = isTrainer ? "trainerId" : "clientId";
    const snap = await adminDb.collection("chats").where(field, "==", uid).orderBy("updatedAt", "desc").limit(60).get();
    const chats = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      const trainerId = data.trainerId; const clientId = data.clientId;
      if (!id(trainerId) || !id(clientId) || doc.id !== `${trainerId}_${clientId}`) return null;
      const access = await authorizeChatPair(request, trainerId, clientId);
      if (access.ok === false || data.gymId && data.gymId !== access.gymId) return null;
      const client = isTrainer ? await adminDb.collection("clients").doc(clientId).get() : null;
      return {
        id: doc.id, trainerId, clientId, lastMessage: typeof data.lastMessage === "string" ? data.lastMessage : "",
        updatedAt: date(data.updatedAt), unreadForTrainer: data.unreadForTrainer === true,
        unreadForClient: data.unreadForClient === true,
        clientName: typeof client?.data()?.name === "string" ? client.data()?.name : "Klijent"
      };
    }));
    return reply({ chats: chats.filter((chat) => chat !== null) });
  } catch (error) {
    console.error("Chat list GET:", error);
    return reply({ error: "Razgovore nije moguće učitati." }, 500);
  }
}
