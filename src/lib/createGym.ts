import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createGym({
  gymId,
  name,
  ownerId,
}: {
  gymId: string;
  name: string;
  ownerId: string;
}) {
  await setDoc(doc(db, "gyms", gymId), {
    name,
    ownerId,
    createdAt: serverTimestamp(),
  });

  console.log("Gym created:", gymId);
}