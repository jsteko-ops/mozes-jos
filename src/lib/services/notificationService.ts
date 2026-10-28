import { listenMyNotifications } from "@/lib/services/notificationReads";
export function listenUnreadCheckins(userId: string, callback: (count: number) => void) {
  return listenMyNotifications(userId, (items) => callback(items.filter((n) => n.type === "checkin" && !n.read).length),
    (error) => { console.error("Greška kod brojanja check-in obavijesti:", error); callback(0); });
}
export function listenUnreadNotifications(userId: string, callback: (count: number) => void) {
  return listenMyNotifications(userId, (items) => callback(items.filter((n) => !n.read).length),
    (error) => { console.error("Greška kod brojanja obavijesti:", error); callback(0); });
}
