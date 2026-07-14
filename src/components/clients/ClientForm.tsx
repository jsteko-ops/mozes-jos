"use client";

import { useState } from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/components/auth/AuthProvider";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { createClientForTrainer } from "@/lib/createClientForTrainer";


export default function ClientForm({
  onCreatedAction,
}: {
  onCreatedAction: () => void;
}) {


  const { user } = useAuth();


  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [goal, setGoal] = useState("");


  const [loading, setLoading] = useState(false);



  async function addClient() {


    if (!user) return;



    try {


      setLoading(true);



      // Dohvati podatke trenera

      const trainerSnap = await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
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



      // Kreiranje kompletnog klijenta

      await createClientForTrainer({

        name,

        email,

        password,

        goal,

        trainerId: user.uid,

        gymId,

      });



      // čišćenje forme

      setName("");

      setEmail("");

      setPassword("");

      setGoal("");



      onCreatedAction();



      alert(
        "Klijent uspješno dodan ✅"
      );



    } catch (error: any) {


      console.error(
        "Greška kod dodavanja klijenta:",
        error
      );


      alert(
        error.message ||
        "Greška kod dodavanja klijenta"
      );



    } finally {


      setLoading(false);


    }

  }




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

        label="Privremena lozinka"

        placeholder="Lozinka za prijavu"

        value={password}

        onChange={(e) =>
          setPassword(e.target.value)
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