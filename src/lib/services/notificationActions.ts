import { auth } from "@/lib/firebase";
export type NotificationAction = "read" | "delete" | "read-all" | "delete-read";
export async function notificationAction(action: NotificationAction, id?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const response = await fetch("/api/notifications/actions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, id }),
    cache: "no-store",
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || "Obavijest nije moguće ažurirati.");
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mj-notifications-changed"));
}
