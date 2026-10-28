import { auth } from "@/lib/firebase";

export type NewCheckinData = {
  weight: number;
  energy: string;
  sleep: string;
  hunger: string;
  water: string;
  comment: string;
};

type ApiResponse = {
  success?: boolean;
  clientId?: string;
  checkinId?: string;
  notified?: boolean;
  error?: string;
};

export async function createCheckinViaApi(
  clientId: string,
  data: NewCheckinData
): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Prijava je potrebna.");
  }

  if (
    !clientId ||
    clientId.length > 128 ||
    clientId.includes("/")
  ) {
    throw new Error("Neispravan klijent.");
  }

  const token = await user.getIdToken();

  const response = await fetch(
    `/api/clients/${encodeURIComponent(clientId)}/checkins`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  let result: ApiResponse;

  try {
    result = (await response.json()) as ApiResponse;
  } catch {
    throw new Error("Posluzitelj nije vratio valjan odgovor.");
  }

  if (!response.ok) {
    throw new Error(
      result.error || "Check-in nije moguce spremiti."
    );
  }

  if (
    result.success !== true ||
    result.clientId !== clientId ||
    !result.checkinId ||
    typeof result.checkinId !== "string"
  ) {
    throw new Error("Neispravan odgovor API-ja.");
  }

  return result.checkinId;
}