import { auth } from "@/lib/firebase";

export type ClientViaApi = {
  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  goal: string;
  trainerId: string;
  gymId: string;
};

type ClientResponse = {
  error?: string;
  client?: ClientViaApi;
};

export async function getClient(
  clientId: string
): Promise<ClientViaApi> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Prijava je potrebna.");
  }

  const token = await user.getIdToken();

  const response = await fetch(
    `/api/clients/${encodeURIComponent(clientId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as ClientResponse;

  if (!response.ok) {
    throw new Error(
      data.error || "Dohvat profila nije uspio."
    );
  }

  if (!data.client || data.client.id !== clientId) {
    throw new Error("Neispravan odgovor API-ja.");
  }

  return data.client;
}