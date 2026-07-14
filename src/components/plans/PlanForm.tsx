"use client";

import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";


export default function PlanForm({
  clientId,
  onCreated,
}: {
  clientId: string;
  onCreated: () => void;
}) {


  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);



  const addPlan = async () => {


    if (!clientId) return;



    try {


      setLoading(true);



    const ref = collection(
  db,
  "clients",
  clientId,
  "workouts"
);



      await addDoc(
        ref,
        {
          name,
          description,
          createdAt: serverTimestamp(),
        }
      );



      setName("");

      setDescription("");



      onCreated();



    } catch(error) {


      console.error(
        "Greška kod dodavanja plana:",
        error
      );


    } finally {


      setLoading(false);


    }

  };




  return (

    <Card>

      <div className="space-y-4">


        <h2 className="text-lg font-semibold">
          Novi plan treninga
        </h2>



        <Input
          label="Naziv plana"
          placeholder="npr. Full Body 3x tjedno"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />



        <Input
          label="Opis"
          placeholder="Kratki opis plana"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />



        <Button
          onClick={addPlan}
          loading={loading}
          fullWidth
        >
          Dodaj plan
        </Button>


      </div>

    </Card>

  );

}