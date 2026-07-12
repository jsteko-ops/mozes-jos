import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { findUserByEmail } from "@/lib/findUserByEmail";

export async function addGymMember({
  gymId,
  email,
  role,
  addedBy,
}: {
  gymId: string;
  email: string;
  role: "trainer" | "client";
  addedBy: string;
}) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Korisnik nije pronađen.");
  }

  if (user.role !== role) {
    throw new Error(
      `Korisnik nije ${role}.`
    );
  }

  // 1. dodaj člana u teretanu
  await setDoc(
    doc(
      db,
      "gymMembers",
      gymId,
      "members",
      user.uid
    ),
    {
      role,
      email: user.email,
      name: user.name,
      addedBy,
      createdAt: serverTimestamp(),
    }
  );

  // 2. poveži korisnika s teretanom
  await updateDoc(
    doc(db, "users", user.uid),
    {
      gymId,
    }
  );

  console.log(
    "Member added to gym:",
    user.uid
  );

  return user;
}