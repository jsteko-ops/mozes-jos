import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserRole } from "@/types/roles";

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return snap.data().role as UserRole;
}