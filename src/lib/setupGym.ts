import { createGym } from "@/lib/createGym";
import { assignUserToGym } from "@/lib/assignUserToGym";

export async function setupGym({
  gymId,
  name,
  ownerId,
}: {
  gymId: string;
  name: string;
  ownerId: string;
}) {
  await createGym({ gymId, name, ownerId });

  await assignUserToGym(ownerId, gymId);

  console.log("Gym setup complete");
}