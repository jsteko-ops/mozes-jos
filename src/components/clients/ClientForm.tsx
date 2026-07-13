"use client";

import { useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";


export default function ClientForm({
  onCreatedAction,
}: {
  onCreatedAction: () => void;
}) {

  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");

  const [loading, setLoading] = useState(false);


  const addClient = async () => {

    if (!user) return;


    try {

      setLoading(true);


      // Dohvati trenera
      const trainerSnap = await getDoc(
        doc(db, "users", user.uid)
      );


      if (!trainerSnap.exists()) {
        throw new Error(
          "Trener nije pronađen."
        );
      }


      const trainerData = trainerSnap.data();


      const gymId = trainerData.gymId;


      if (!gymId) {
        throw new Error(
          "Trener nema povezanu teretanu."
        );
      }



      // 1. Glavni client dokument

      const clientRef = await addDoc(
        collection(db, "clients"),
        {
          name,
          email,
          goal,

          trainerId: user.uid,
          gymId,

          createdAt: serverTimestamp(),
        }
      );



      // 2. Dodaj u gymMembers

      await setDoc(
        doc(
          db,
          "gymMembers",
          gymId,
          "members",
          clientRef.id
        ),
        {
          role: "client",

          name,
          email,

          trainerId: user.uid,

          createdAt: serverTimestamp(),
        }
      );



      // 3. Stari zapis radi kompatibilnosti

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "clients",
          clientRef.id
        ),
        {
          name,
          email,
          goal,

          trainerId: user.uid,

          clientId: clientRef.id,

          createdAt: serverTimestamp(),
        }
      );



      setName("");
      setEmail("");
      setGoal("");


      onCreatedAction();



    } catch (error) {

      console.error(
        "Greška kod dodavanja klijenta:",
        error
      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="bg-white p-4 border rounded-xl space-y-4">


      <Input
        label="Ime"
        placeholder="Ime klijenta"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />


      <Input
        label="Email"
        placeholder="Email klijenta"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />


      <Input
        label="Cilj"
        placeholder="npr. mršavljenje, masa, kondicija"
        value={goal}
        onChange={(e) =>
          setGoal(e.target.value)
        }
      />


      <Button
        onClick={addClient}
        loading={loading}
        fullWidth
      >
        Dodaj klijenta
      </Button>


    </div>

  );
}