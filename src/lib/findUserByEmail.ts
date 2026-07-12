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

  const userDoc = snap.docs[0];

  const data = userDoc.data();

  return {
    uid: userDoc.id,
    email: data.email,
    name: data.name,
    role: data.role,
    gymId: data.gymId ?? null,
    isPremium: data.isPremium ?? false,
    subscriptionStatus:
      data.subscriptionStatus ?? "inactive",
  };
}