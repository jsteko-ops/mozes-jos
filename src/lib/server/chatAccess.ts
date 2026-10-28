import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type ChatAccessResult =
  | { ok: false; error: string; status: number }
  | { ok: true; uid: string; role: "trainer" | "client"; gymId: string; trainerId: string; clientId: string };

const fail = (error: string, status: number): ChatAccessResult => ({ ok: false, error, status });
const str = (value: unknown): string => typeof value === "string" ? value.trim() : "";
export function validChatId(value: string): boolean {
  return value.length > 0 && value.length <= 128 && value !== "." && value !== ".." && !value.includes("/") && !value.includes("\\");
}

export async function authorizeChatPair(request: Request, trainerId: string, clientId: string): Promise<ChatAccessResult> {
  if (!validChatId(trainerId) || !validChatId(clientId) || trainerId === clientId) {
    return fail("Neispravni sudionici razgovora.", 400);
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return fail("Prijava je potrebna.", 401);
  let uid: string;
  try { uid = (await adminAuth.verifyIdToken(token, true)).uid; }
  catch { return fail("Prijava nije valjana.", 401); }
  if (!validChatId(uid) || (uid !== trainerId && uid !== clientId)) {
    return fail("Pristup nije dopušten.", 403);
  }
  const userRef = adminDb.collection("users");
  const [self, trainer, clientUser, client] = await Promise.all([
    userRef.doc(uid).get(),
    userRef.doc(trainerId).get(),
    userRef.doc(clientId).get(),
    adminDb.collection("clients").doc(clientId).get(),
  ]);
  const selfData = self.data(); const trainerData = trainer.data();
  const clientUserData = clientUser.data(); const clientData = client.data();
  const gymId = str(clientData?.gymId);
  if (!gymId || !validChatId(gymId) || !self.exists || !trainer.exists || !clientUser.exists || !client.exists ||
      str(trainerData?.role) !== "trainer" || str(clientUserData?.role) !== "client" ||
      str(trainerData?.gymId) !== gymId || str(clientUserData?.gymId) !== gymId ||
      str(clientData?.trainerId) !== trainerId || str(selfData?.gymId) !== gymId ||
      (uid === trainerId && str(selfData?.role) !== "trainer") ||
      (uid === clientId && str(selfData?.role) !== "client")) {
    return fail("Pristup nije dopušten.", 403);
  }
  const [gym, memberTrainer, memberClient] = await Promise.all([
    adminDb.collection("gyms").doc(gymId).get(),
    adminDb.collection("gymMembers").doc(gymId).collection("members").doc(trainerId).get(),
    adminDb.collection("gymMembers").doc(gymId).collection("members").doc(clientId).get(),
  ]);
  const tm = memberTrainer.data(), cm = memberClient.data();
  if (!gym.exists || !validChatId(str(gym.data()?.ownerId)) || !memberTrainer.exists || !memberClient.exists ||
      (tm?.gymRole ?? tm?.role) !== "trainer" || str(tm?.gymId) !== gymId ||
      (cm?.gymRole ?? cm?.role) !== "client" || str(cm?.gymId) !== gymId || str(cm?.trainerId) !== trainerId) {
    return fail("Pristup nije dopušten.", 403);
  }
  return { ok: true, uid, role: uid === trainerId ? "trainer" : "client", gymId, trainerId, clientId };
}

export async function authorizeExistingChat(request: Request, chatId: string): Promise<ChatAccessResult> {
  if (!validChatId(chatId)) return fail("Neispravan razgovor.", 400);
  const chat = await adminDb.collection("chats").doc(chatId).get();
  if (!chat.exists) return fail("Razgovor nije pronađen.", 404);
  const trainerId = str(chat.data()?.trainerId);
  const clientId = str(chat.data()?.clientId);
  if (chatId !== `${trainerId}_${clientId}`) return fail("Neispravan razgovor.", 403);
  const access = await authorizeChatPair(request, trainerId, clientId);
  if (access.ok === true && chat.data()?.gymId && chat.data()?.gymId !== access.gymId) {
    return fail("Pristup nije dopušten.", 403);
  }
  return access;
}
