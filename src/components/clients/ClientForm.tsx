"use client";

import {
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  ClientGender,
  createClientForTrainer,
} from "@/lib/createClientForTrainer";


export default function ClientForm({
  onCreatedAction,
}: {
  onCreatedAction: () => void;
}) {


  const {
    user,
  } = useAuth();


  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    goal,
    setGoal,
  ] = useState("");


  const [
    gender,
    setGender,
  ] = useState<ClientGender | "">("");


  const [
    loading,
    setLoading,
  ] = useState(false);



  async function addClient() {


    if (!user) {

      return;

    }


    if (!name.trim()) {

      alert(
        "Upiši ime klijenta."
      );

      return;

    }


    if (!email.trim()) {

      alert(
        "Upiši email klijenta."
      );

      return;

    }


    if (!password) {

      alert(
        "Upiši privremenu lozinku."
      );

      return;

    }


    if (!gender) {

      alert(
        "Odaberi spol klijenta."
      );

      return;

    }


    try {


      setLoading(true);



      // Dohvati podatke trenera

      const trainerSnap =
        await getDoc(

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


      const trainerData =
        trainerSnap.data();


      const gymId =
        trainerData.gymId;


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

        gender,

        trainerId:
          user.uid,

        gymId,

      });



      // Čišćenje forme

      setName("");

      setEmail("");

      setPassword("");

      setGoal("");

      setGender("");


      onCreatedAction();


      alert(
        "Klijent uspješno dodan ✅"
      );


    } catch (error: unknown) {


      console.error(
        "Greška kod dodavanja klijenta:",
        error
      );


      const message =
        error instanceof Error
          ? error.message
          : "Greška kod dodavanja klijenta";


      alert(
        message
      );


    } finally {


      setLoading(false);


    }

  }



  return (

    <div className="space-y-4 rounded-xl border bg-white p-4">


      <Input

        label="Ime"

        placeholder="Ime klijenta"

        value={name}

        onChange={(event) =>
          setName(
            event.target.value
          )
        }

      />


      <Input

        label="Email"

        placeholder="Email klijenta"

        value={email}

        onChange={(event) =>
          setEmail(
            event.target.value
          )
        }

      />


      <Input

        label="Privremena lozinka"

        placeholder="Lozinka za prijavu"

        value={password}

        onChange={(event) =>
          setPassword(
            event.target.value
          )
        }

      />


      <div>

        <label className="mb-2 block font-medium">

          Spol

        </label>


        <select

          value={gender}

          onChange={(event) =>
            setGender(
              event.target.value as
                ClientGender | ""
            )
          }

          className="
            w-full
            rounded-lg
            border
            bg-white
            px-3
            py-2
          "

        >

          <option value="">

            Odaberi spol

          </option>


          <option value="male">

            Muški

          </option>


          <option value="female">

            Ženski

          </option>


          <option value="prefer_not_to_say">

            Ne želim se izjasniti

          </option>

        </select>

      </div>


      <Input

        label="Cilj"

        placeholder="npr. mršavljenje, masa, kondicija"

        value={goal}

        onChange={(event) =>
          setGoal(
            event.target.value
          )
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