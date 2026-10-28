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

type ApiResponse = {
  error?: string;
  clientId?: string;
  checkins?: ApiCheckin[];
};

function toTimestamp(value: string | null): Timestamp | null {
  if (!value) return null;

  const millis = Date.parse(value);

  return Number.isFinite(millis)
    ? Timestamp.fromMillis(millis)
    : null;
}

export async function getOwnCheckinsViaApi() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Prijava je potrebna.");
  }

  const token = await user.getIdToken();

  const response = await fetch("/api/checkins/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error || "Check-inove nije moguce ucitati."
    );
  }

  if (
    data.clientId !== user.uid ||
    !Array.isArray(data.checkins) ||
    !data.checkins.every(
      (item) => item && typeof item.id === "string"
    )
  ) {
    throw new Error("Neispravan odgovor check-in API-ja.");
  }

  return {
    clientId: data.clientId,
    checkins: data.checkins.map((item) => ({
      ...item,
      createdAt: toTimestamp(item.createdAt),
      updatedAt: toTimestamp(item.updatedAt),
      reviewedAt: toTimestamp(item.reviewedAt),
      trainerCommentAt: toTimestamp(item.trainerCommentAt),
    })),
  };
}