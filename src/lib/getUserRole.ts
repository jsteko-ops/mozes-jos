import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getUserRole(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return snap.data().role;
}