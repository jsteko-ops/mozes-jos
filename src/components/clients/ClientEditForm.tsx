"use client";

import {
  useState,
} from "react";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import type {
  ClientGender,
} from "@/lib/createClientForTrainer";


type ClientEditFormProps = {

  client: {

    id: string;

    name?: string;

    email?: string;

    phone?: string;

    note?: string;

    goal?: string;

    gender?: ClientGender;

  };

  onSaved: () => void;

};


export default function ClientEditForm({

  client,

  onSaved,

}: ClientEditFormProps) {


  const [
    name,
    setName,
  ] = useState(
    client.name || ""
  );


  const [
    email,
    setEmail,
  ] = useState(
    client.email || ""
  );


  const [
    phone,
    setPhone,
  ] = useState(
    client.phone || ""
  );


  const [
    note,
    setNote,
  ] = useState(
    client.note || ""
  );


  const [
    goal,
    setGoal,
  ] = useState(
    client.goal || ""
  );


  const [
    gender,
    setGender,
  ] = useState<ClientGender | "">(
    client.gender || ""
  );


  const [
    loading,
    setLoading,
  ] = useState(false);



  async function save() {


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


    if (!gender) {

      alert(
        "Odaberi spol klijenta."
      );

      return;

    }


    try {


      setLoading(true);


      await updateDoc(

        doc(
          db,
          "clients",
          client.id
        ),

        {
          name:
            name.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          note:
            note.trim(),

          goal:
            goal.trim(),

          gender,
        }

      );


      alert(
        "Klijent ažuriran ✅"
      );


      onSaved();


    } catch (error: unknown) {


      console.error(
        "Greška kod spremanja klijenta:",
        error
      );


      alert(
        "Greška kod spremanja klijenta."
      );


    } finally {


      setLoading(false);


    }

  }



  return (

    <div className="space-y-4 rounded-xl border bg-white p-5">


      <h2 className="text-xl font-bold">

        Uredi klijenta

      </h2>


      <div>

        <label className="mb-2 block font-medium">

          Ime

        </label>


        <input

          className="
            w-full
            rounded-lg
            border
            p-2
          "

          placeholder="Ime"

          value={name}

          onChange={(event) =>
            setName(
              event.target.value
            )
          }

        />

      </div>


      <div>

        <label className="mb-2 block font-medium">

          Email

        </label>


        <input

          type="email"

          className="
            w-full
            rounded-lg
            border
            p-2
          "

          placeholder="Email"

          value={email}

          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }

        />

      </div>


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
            p-2
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


      <div>

        <label className="mb-2 block font-medium">

          Telefon

        </label>


        <input

          className="
            w-full
            rounded-lg
            border
            p-2
          "

          placeholder="Telefon"

          value={phone}

          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }

        />

      </div>


      <div>

        <label className="mb-2 block font-medium">

          Napomena

        </label>


        <textarea

          className="
            min-h-24
            w-full
            rounded-lg
            border
            p-2
          "

          placeholder="Napomena"

          value={note}

          onChange={(event) =>
            setNote(
              event.target.value
            )
          }

        />

      </div>


      <div>

        <label className="mb-2 block font-medium">

          Cilj

        </label>


        <input

          className="
            w-full
            rounded-lg
            border
            p-2
          "

          placeholder="Cilj"

          value={goal}

          onChange={(event) =>
            setGoal(
              event.target.value
            )
          }

        />

      </div>


      <button

        type="button"

        onClick={save}

        disabled={loading}

        className="
          rounded-lg
          bg-black
          px-5
          py-2
          text-white
          hover:bg-gray-800
          disabled:opacity-50
        "

      >

        {
          loading
            ? "Spremanje..."
            : "Spremi promjene"
        }

      </button>


    </div>

  );

}