import { auth } from "@/lib/firebase";
type Chat = { id: string; trainerId: string; clientId: string; clientName?: string; lastMessage?: string; updatedAt?: string | null; unreadForTrainer?: boolean; unreadForClient?: boolean };
async function request(url: string, method: "GET" | "POST", body?: object): Promise<any> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Razgovor nije dostupan.");
  return result;
}
function poll<T>(loader: () => Promise<T>, callback: (items: T) => void): () => void {
  let stopped = false, busy = false;
  async function refresh() {
    if (stopped || busy) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    busy = true;
    try { const result = await loader(); if (!stopped) callback(result); }
    catch (error) { if (!stopped) console.error("Chat dohvat:", error); }
    finally { busy = false; }
  }
  void refresh();
  const interval = setInterval(() => void refresh(), 120000);
  const manual = () => void refresh();
  if (typeof window !== "undefined") window.addEventListener("mj-chat-changed", manual);
  return () => {
    stopped = true; clearInterval(interval);
    if (typeof window !== "undefined") window.removeEventListener("mj-chat-changed", manual);
  };
}
function changed() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mj-chat-changed"));
}
export async function getOrCreateChat(trainerId: string, clientId: string): Promise<string> {
  const result = await request("/api/chat/session", "POST", { trainerId, clientId });
  if (typeof result.chatId !== "string") throw new Error("Neispravan razgovor.");
  changed();
  return result.chatId;
}
export async function sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
  if (auth.currentUser?.uid !== senderId) throw new Error("Prijava nije valjana.");
  await request(`/api/chat/${encodeURIComponent(chatId)}`, "POST", { action: "send", text });
  changed();
}
export async function getMessages(chatId: string): Promise<any[]> {
  const result = await request(`/api/chat/${encodeURIComponent(chatId)}`, "GET");
  if (!Array.isArray(result.messages)) throw new Error("Neispravan odgovor za poruke.");
  // Firestore Timestamp compatibility for the existing ChatMessages component.
  return result.messages.map((message: any) => {
    if (typeof message.createdAt !== "string") return message;
    const parsed = new Date(message.createdAt);
    if (!Number.isFinite(parsed.getTime())) return { ...message, createdAt: null };
    const seconds = Math.floor(parsed.getTime() / 1000);
    return { ...message, createdAt: {
      seconds, nanoseconds: parsed.getMilliseconds() * 1000000,
      toDate: () => new Date(parsed.getTime()),
      toMillis: () => parsed.getTime(),
    } };
  });
}
export function listenMessages(chatId: string, callback: (messages: any[]) => void) {
  return poll(() => getMessages(chatId), callback);
}
async function myChats(): Promise<Chat[]> {
  const result = await request("/api/chat/list", "GET");
  if (!Array.isArray(result.chats)) throw new Error("Neispravan popis razgovora.");
  return result.chats;
}
export async function getTrainerChats(trainerId: string) {
  if (auth.currentUser?.uid !== trainerId) throw new Error("Pristup nije dopušten.");
  return (await myChats()).filter((chat) => chat.trainerId === trainerId);
}
export function listenTrainerChats(trainerId: string, callback: (chats: Chat[]) => void) {
  return poll(() => getTrainerChats(trainerId), callback);
}
export function listenClientChats(clientId: string, callback: (chats: Chat[]) => void) {
  return poll(async () => {
    if (auth.currentUser?.uid !== clientId) throw new Error("Pristup nije dopušten.");
    return (await myChats()).filter((chat) => chat.clientId === clientId);
  }, callback);
}
export async function markChatRead(chatId: string, userType: "trainer" | "client"): Promise<void> {
  if (userType !== "trainer" && userType !== "client") throw new Error("Neispravan tip korisnika.");
  await request(`/api/chat/${encodeURIComponent(chatId)}`, "POST", { action: "read" });
  changed();
}
