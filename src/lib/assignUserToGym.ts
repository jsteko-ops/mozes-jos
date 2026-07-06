import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function assignUserToGym(
  uid: string,
  gymId: string
) {
  await updateDoc(doc(db, "users", uid), {
    gymId,
  });

  console.log("User assigned to gym:", uid, gymId);
}