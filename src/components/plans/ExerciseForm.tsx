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
      console.error(error);
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bench press"
        />

        <Input
          label="Serije"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          placeholder="3"
        />

        <Input
          label="Ponavljanja"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="10"
        />

        <Input
          label="Težina"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="80"
        />

        <Input
          label="Odmor"
          value={rest}
          onChange={(e) => setRest(e.target.value)}
          placeholder="90"
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