import { auth } from "@/lib/firebase";

export type GymMemberOverview = {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  phone?: string;
  trainerId?: string | null;
  gymRole: string;
  gymId: string;
};

type MembersResponse = {
  error?: string;
  gymId?: string;
  members?: GymMemberOverview[];
};

export async function getGymMembers(
  gymId: string
): Promise<GymMemberOverview[]> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Korisnik nije prijavljen.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch("/api/gym/members", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as MembersResponse;

  if (!response.ok) {
    throw new Error(
      data.error || "Clanove nije moguce dohvatiti."
    );
  }

  if (
    data.gymId !== gymId ||
    !Array.isArray(data.members)
  ) {
    throw new Error("Neispravan odgovor servera.");
  }

  return data.members;
}