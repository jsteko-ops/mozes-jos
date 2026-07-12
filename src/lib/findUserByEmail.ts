import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function findUserByEmail(
  email: string
) {
  const q = query(
    collection(db, "users"),
    where("email", "==", email.trim())
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }

  const user = snap.docs[0];

  return {
    uid: user.id,
    ...user.data(),
  };
}