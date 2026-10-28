import { auth } from "@/lib/firebase";
export type SafeNotification = {
  id: string; title: string; message: string; read: boolean;
  link?: string | null; type?: string; createdAt?: string | null;
};
export async function getMyNotifications(): Promise<SafeNotification[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const response = await fetch("/api/notifications/list", {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Obavijesti nisu dostupne.");
  if (!Array.isArray(data?.notifications)) throw new Error("Neispravan odgovor za obavijesti.");
  return data.notifications as SafeNotification[];
}
export function listenMyNotifications(
  userId: string, callback: (items: SafeNotification[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  let stopped = false, busy = false;
  async function refresh() {
    if (stopped || busy) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    if (auth.currentUser?.uid !== userId) return;
    busy = true;
    try { const items = await getMyNotifications(); if (!stopped) callback(items); }
    catch (error) { if (!stopped) (onError ?? console.error)(error); }
    finally { busy = false; }
  }
  void refresh();
  const interval = setInterval(() => void refresh(), 180000);
  const manual = () => void refresh();
  if (typeof window !== "undefined") window.addEventListener("mj-notifications-changed", manual);
  return () => {
    stopped = true; clearInterval(interval);
    if (typeof window !== "undefined") window.removeEventListener("mj-notifications-changed", manual);
  };
}
