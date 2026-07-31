import {
  auth,
  db,
} from "@/lib/firebase";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";


export type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


export async function createClientForTrainer({

  name,
  email,
  password,
  goal,
  gender,
  trainerId,
  gymId,

}: {

  name: string;
  email: string;
  password: string;
  goal: string;
  gender: ClientGender;
  trainerId: string;
  gymId: string;

}) {


  // 1. Kreiranje Firebase Auth korisnika

  const result =
    await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );


  const uid =
    result.user.uid;



  // 2. users dokument

  await setDoc(

    doc(
      db,
      "users",
      uid
    ),

    {
      uid,

      name:
        name.trim(),

      email:
        email.trim(),

      role:
        "client",

      gender,

      gymId,

      trainerId,

      isPremium:
        false,

      subscriptionStatus:
        "inactive",

      createdAt:
        serverTimestamp(),
    }

  );



  // 3. clients dokument

  await setDoc(

    doc(
      db,
      "clients",
      uid
    ),

    {
      uid,

      name:
        name.trim(),

      email:
        email.trim(),

      goal:
        goal.trim(),

      gender,

      gymId,

      trainerId,

      createdAt:
        serverTimestamp(),
    }

  );



  // 4. gymMembers veza

  await setDoc(

    doc(
      db,
      "gymMembers",
      gymId,
      "members",
      uid
    ),

    {
      uid,

      role:
        "client",

      name:
        name.trim(),

      email:
        email.trim(),

      gender,

      gymId,

      trainerId,

      createdAt:
        serverTimestamp(),
    }

  );


  return uid;

}
