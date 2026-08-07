"use client";

import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";

import { db } from "@/lib/firebase";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest?: number;
};

type ExerciseItemProps = {
  exercise: Exercise;
  clientId: string;
  planId: string;
  onDeleted: () => void;
};

export default function ExerciseItem({
  exercise,
  clientId,
  planId,
  onDeleted,
}: ExerciseItemProps) {
  const [deleting, setDeleting] = useState(false);

  const deleteExercise = async () => {
    const confirmed = window.confirm(
      `Želiš li sigurno izbrisati vježbu "${exercise.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const exerciseRef = doc(
        db,
        "clients",
        clientId,
        "workouts",
        planId,
        "exercises",
        exercise.id
      );

      await deleteDoc(exerciseRef);

      onDeleted();
    } catch (error) {
      console.error("Greška kod brisanja vježbe:", error);

      alert("Vježba se nije mogla izbrisati.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {exercise.name}
          </h3>

          <p className="text-gray-600">
            Serije: {exercise.sets}
          </p>

          <p className="text-gray-600">
            Ponavljanja: {exercise.reps}
          </p>

          <p className="text-gray-600">
            Težina: {exercise.weight || 0} kg
          </p>

          <p className="text-gray-600">
            Odmor: {exercise.rest || 0} sek
          </p>
        </div>

        <Button
          variant="danger"
          onClick={deleteExercise}
          loading={deleting}
        >
          Izbriši vježbu
        </Button>
      </div>
    </Card>
  );
}