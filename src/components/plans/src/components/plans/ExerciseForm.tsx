"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";


export default function ExerciseForm({
  clientId,
  planId,
  onCreated,
}: {
  clientId: string;
  planId: string;
  onCreated: () => void;
}) {

  const { user } = useAuth();


  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [rest, setRest] = useState("");

  const [loading, setLoading] = useState(false);



  const addExercise = async () => {
    if (!user) return;

    try {
      setLoading(true);


      const ref = collection(
        db,
        "users",
        user.uid,
        "clients",
        clientId,
        "plans",
        planId,
        "exercises"
      );


      await addDoc(ref, {
        name,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        rest: Number(rest),
        createdAt: serverTimestamp(),
      });


      setName("");
      setSets("");
      setReps("");
      setWeight("");
      setRest("");

      onCreated();


    } catch (error) {
      console.error(
        "Greška kod dodavanja vježbe:",
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
          Nova vježba
        </h2>


        <Input
          label="Naziv vježbe"
          placeholder="Bench press"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />


        <Input
          label="Serije"
          placeholder="3"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />


        <Input
          label="Ponavljanja"
          placeholder="10"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />


        <Input
          label="Težina (kg)"
          placeholder="80"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />


        <Input
          label="Odmor (sek)"
          placeholder="90"
          value={rest}
          onChange={(e) => setRest(e.target.value)}
        />


        <Button
          onClick={addExercise}
          loading={loading}
          fullWidth
        >
          Dodaj vježbu
        </Button>


      </div>

    </Card>
  );
}