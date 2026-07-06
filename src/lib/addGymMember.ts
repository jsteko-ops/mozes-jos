import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function addGymMember({
  gymId,
  userId,
  role,
  addedBy,
}: {
  gymId: string;
  userId: string;
  role: "trainer" | "client";
  addedBy: string;
}) {
  // 1. dodaj u gymMembers kolekciju
  await setDoc(doc(db, "gymMembers", gymId, "members", userId), {
    role,
    addedBy,
    createdAt: serverTimestamp(),
  });

  // 2. update user (link na gym)
  await updateDoc(doc(db, "users", userId), {
    gymId,
    role,
  });

  console.log("Member added to gym:", userId);
}