import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";

type ApiCheckin = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  reviewedAt: string | null;
  trainerCommentAt: string | null;
  [key: string]: unknown;
};
function timestamp(value: string | null) {
  if (!value) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) ? Timestamp.fromMillis(millis) : null;
}
export async function getCheckins(clientId: string) {
  const current = auth.currentUser;
  if (!current) throw new Error("Prijava je potrebna.");
  const token = await current.getIdToken();
  const response = await fetch(
    `/api/clients/${encodeURIComponent(clientId)}/checkins/owner`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const result = await response.json().catch(() => null) as {
    error?: string; clientId?: string; checkins?: ApiCheckin[]
  } | null;
  if (!response.ok) throw new Error(result?.error || "Check-inove nije moguće učitati.");
  if (result?.clientId !== clientId || !Array.isArray(result?.checkins) ||
      !result.checkins.every(checkin => checkin && typeof checkin.id === "string")) {
    throw new Error("Neispravan odgovor servera.");
  }
  return result.checkins.map(item => ({
    ...item,
    createdAt: timestamp(item.createdAt), updatedAt: timestamp(item.updatedAt),
    reviewedAt: timestamp(item.reviewedAt), trainerCommentAt: timestamp(item.trainerCommentAt),
  }));
}
