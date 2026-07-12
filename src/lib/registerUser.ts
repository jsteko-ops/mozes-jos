import { auth, db } from "@/lib/firebase";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { createGym } from "@/lib/createGym";

type Role =
  | "client"
  | "trainer"
  | "gym_owner";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export async function registerUser({
  name,
  email,
  password,
  role,
}: RegisterUserData) {
  const result =
    await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  const uid = result.user.uid;

  let gymId: string | null = null;

  if (role === "gym_owner") {
    gymId = `gym_${uid}`;

    await createGym({
      gymId,
      name: `${name}'s Gym`,
      ownerId: uid,
    });
  }

  await setDoc(doc(db, "users", uid), {
    uid,

    name: name.trim(),

    email: result.user.email,

    role,

    gymId,

    isPremium: false,

    subscriptionStatus: "inactive",

    createdAt: serverTimestamp(),
  });

  return result.user;
}