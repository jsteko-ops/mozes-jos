import { auth } from "@/lib/firebase";

type Action = "review" | "comment";

type ApiResponse = {
  success?: boolean;
  action?: Action;
  changed?: boolean;
  error?: string;
};

async function patchCheckin(
  clientId: string,
  checkinId: string,
  action: Action,
  trainerComment?: string
): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Prijava je potrebna.");
  }

  if (
    !clientId ||
    !checkinId ||
    clientId.includes("/") ||
    checkinId.includes("/")
  ) {
    throw new Error("Neispravan ID.");
  }

  const token = await user.getIdToken();

  const payload =
    action === "comment"
      ? { action, trainerComment: trainerComment ?? "" }
      : { action };

  const response = await fetch(
    `/api/clients/${encodeURIComponent(clientId)}/checkins/${encodeURIComponent(checkinId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  let data: ApiResponse | null = null;

  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    throw new Error("Posluzitelj nije vratio valjan odgovor.");
  }

  if (!response.ok) {
    throw new Error(
      data.error ?? "Spremanje promjene nije uspjelo."
    );
  }

  if (
    data.success !== true ||
    data.action !== action ||
    typeof data.changed !== "boolean"
  ) {
    throw new Error("Neispravan odgovor API-ja.");
  }
}

export async function markCheckinReviewed(
  clientId: string,
  checkinId: string
): Promise<void> {
  await patchCheckin(clientId, checkinId, "review");
}

export async function saveTrainerComment(
  clientId: string,
  checkinId: string,
  trainerComment: string
): Promise<void> {
  await patchCheckin(
    clientId,
    checkinId,
    "comment",
    trainerComment
  );
}