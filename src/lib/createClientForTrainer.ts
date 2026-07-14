import { auth, db } from "@/lib/firebase";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";


export async function createClientForTrainer({

  name,
  email,
  password,
  goal,
  trainerId,
  gymId,

}: {

  name: string;
  email: string;
  password: string;
  goal: string;
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


  const uid = result.user.uid;



  // 2. users dokument

  await setDoc(

    doc(
      db,
      "users",
      uid
    ),

    {

      uid,

      name: name.trim(),

      email: email.trim(),

      role: "client",

      gymId,

      trainerId,

      isPremium: false,

      subscriptionStatus: "inactive",

      createdAt: serverTimestamp(),

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

      name: name.trim(),

      email: email.trim(),

      goal,

      gymId,

      trainerId,

      createdAt: serverTimestamp(),

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

      role: "client",

      name: name.trim(),

      email: email.trim(),

      gymId,

      trainerId,

      createdAt: serverTimestamp(),

    }

  );



  return uid;

}