"use client";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import Input from "@/components/ui/Input";

import {
  ClientGender,
  createClientForTrainer,
} from "@/lib/createClientForTrainer";


export default function ClientForm({

  onCreatedAction,

}: {

  onCreatedAction:
    () => void;

}) {


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
  ] = useState<
    ClientGender | ""
  >("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  async function addClient() {


    if (!name.trim()) {

      alert(
        "Upiši ime klijenta."
      );

      return;

    }


    if (!email.trim()) {

      alert(
        "Upiši e-mail klijenta."
      );

      return;

    }


    if (
      password.length < 6
    ) {

      alert(
        "Privremena lozinka mora imati najmanje 6 znakova."
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


      await createClientForTrainer(
        {
          name,

          email,

          password,

          goal,

          gender,
        }
      );


      setName("");

      setEmail("");

      setPassword("");

      setGoal("");

      setGender("");


      await Promise.resolve(
        onCreatedAction()
      );


      alert(
        "Klijent je uspješno dodan ✅"
      );


    } catch (
      error: unknown
    ) {

      console.error(
        "Greška kod dodavanja klijenta:",
        error
      );


      const message =
        error instanceof Error

          ? error.message

          : "Greška kod dodavanja klijenta.";


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

        label="E-mail"

        placeholder="E-mail klijenta"

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