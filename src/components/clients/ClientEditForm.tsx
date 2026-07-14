"use client";

import { useState } from "react";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


type ClientEditFormProps = {
  client: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    note?: string;
    goal?: string;
  };

  onSaved: () => void;
};



export default function ClientEditForm({
  client,
  onSaved,
}: ClientEditFormProps) {


  const [name, setName] =
    useState(client.name || "");

  const [email, setEmail] =
    useState(client.email || "");

  const [phone, setPhone] =
    useState(client.phone || "");

  const [note, setNote] =
    useState(client.note || "");

  const [goal, setGoal] =
    useState(client.goal || "");


  const [loading, setLoading] =
    useState(false);



  async function save() {

    try {

      setLoading(true);


      await updateDoc(
        doc(
          db,
          "clients",
          client.id
        ),
        {
          name,
          email,
          phone,
          note,
          goal,
        }
      );


      alert("Klijent ažuriran ✅");


      onSaved();


    } catch(error) {

      console.error(
        "Greška kod spremanja klijenta:",
        error
      );

      alert(
        "Greška kod spremanja"
      );


    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="border rounded-xl bg-white p-5 space-y-3">


      <h2 className="text-xl font-bold">
        Uredi klijenta
      </h2>


      <input
        className="border p-2 w-full rounded"
        placeholder="Ime"
        value={name}
        onChange={(e)=>
          setName(e.target.value)
        }
      />


      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={email}
        onChange={(e)=>
          setEmail(e.target.value)
        }
      />


      <input
        className="border p-2 w-full rounded"
        placeholder="Telefon"
        value={phone}
        onChange={(e)=>
          setPhone(e.target.value)
        }
      />


      <textarea
        className="border p-2 w-full rounded"
        placeholder="Napomena"
        value={note}
        onChange={(e)=>
          setNote(e.target.value)
        }
      />


      <input
        className="border p-2 w-full rounded"
        placeholder="Cilj"
        value={goal}
        onChange={(e)=>
          setGoal(e.target.value)
        }
      />



      <button
        onClick={save}
        disabled={loading}
        className="bg-black text-white px-5 py-2 rounded"
      >

        {loading
          ? "Spremanje..."
          : "Spremi promjene"
        }

      </button>


    </div>

  );

}