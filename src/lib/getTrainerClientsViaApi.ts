import { auth } from "@/lib/firebase";

export type TrainerClient = {
  id: string;
  name: string;
  email?: string;
};

type ApiResponse = {
  error?: string;
  gymId?: string;
  trainerId?: string;
  clients?: TrainerClient[];
};

export async function getClients(
  trainerId: string
): Promise<TrainerClient[]> {
  const user = auth.currentUser;

  if (!user || user.uid !== trainerId) {
    throw new Error("Pristup nije dopusten.");
  }

  const token = await user.getIdToken();

  const response = await fetch(
    `/api/clients/list?trainerId=${encodeURIComponent(trainerId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error || "Klijente nije moguce ucitati."
    );
  }

  if (
    data.trainerId !== trainerId ||
    !data.gymId ||
    !Array.isArray(data.clients) ||
    !data.clients.every(
      (client) =>
        client &&
        typeof client.id === "string" &&
        client.id.length > 0 &&
        typeof client.name === "string"
    )
  ) {
    throw new Error("Neispravan odgovor API-ja.");
  }

  return data.clients.map((client) => ({
    id: client.id,
    name: client.name,
    email:
      typeof client.email === "string"
        ? client.email
        : "",
  }));
}