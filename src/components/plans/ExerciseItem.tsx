"use client";

import { useState } from "react";
import {
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
  onChanged: () => void;
};

export default function ExerciseItem({
  exercise,
  clientId,
  planId,
  onChanged,
}: ExerciseItemProps) {
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(String(exercise.reps));
  const [weight, setWeight] = useState(
    exercise.weight !== undefined
      ? String(exercise.weight)
      : ""
  );
  const [rest, setRest] = useState(
    exercise.rest !== undefined
      ? String(exercise.rest)
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exerciseRef = doc(
    db,
    "clients",
    clientId,
    "workouts",
    planId,
    "exercises",
    exercise.id
  );

  const saveExercise = async () => {
    if (!name.trim()) {
      alert("Unesi naziv vježbe.");
      return;
    }

    const setsNumber = Number(sets);
    const repsNumber = Number(reps);
    const weightNumber = weight
      ? Number(weight.replace(",", "."))
      : 0;
    const restNumber = rest
      ? Number(rest.replace(",", "."))
      : 0;

    if (
      !Number.isFinite(setsNumber) ||
      setsNumber <= 0
    ) {
      alert("Broj serija mora biti veći od 0.");
      return;
    }

    if (
      !Number.isFinite(repsNumber) ||
      repsNumber <= 0
    ) {
      alert("Broj ponavljanja mora biti veći od 0.");
      return;
    }

    if (
      !Number.isFinite(weightNumber) ||
      weightNumber < 0
    ) {
      alert("Težina nije ispravna.");
      return;
    }

    if (
      !Number.isFinite(restNumber) ||
      restNumber < 0
    ) {
      alert("Vrijeme odmora nije ispravno.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(exerciseRef, {
        name: name.trim(),
        sets: setsNumber,
        reps: repsNumber,
        weight: weightNumber,
        rest: restNumber,
      });

      setEditing(false);

      onChanged();
    } catch (error) {
      console.error(
        "Greška kod uređivanja vježbe:",
        error
      );

      alert("Vježba se nije mogla spremiti.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setName(exercise.name);
    setSets(String(exercise.sets));
    setReps(String(exercise.reps));
    setWeight(
      exercise.weight !== undefined
        ? String(exercise.weight)
        : ""
    );
    setRest(
      exercise.rest !== undefined
        ? String(exercise.rest)
        : ""
    );

    setEditing(false);
  };

  const deleteExercise = async () => {
    const confirmed = window.confirm(
      `Želiš li sigurno izbrisati vježbu "${exercise.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteDoc(exerciseRef);

      onChanged();
    } catch (error) {
      console.error(
        "Greška kod brisanja vježbe:",
        error
      );

      alert("Vježba se nije mogla izbrisati.");
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Uredi vježbu
          </h3>

          <Input
            label="Naziv vježbe"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Input
            label="Serije"
            value={sets}
            onChange={(e) =>
              setSets(e.target.value)
            }
          />

          <Input
            label="Ponavljanja"
            value={reps}
            onChange={(e) =>
              setReps(e.target.value)
            }
          />

          <Input
            label="Težina (kg)"
            value={weight}
            onChange={(e) =>
              setWeight(e.target.value)
            }
          />

          <Input
            label="Odmor (sek)"
            value={rest}
            onChange={(e) =>
              setRest(e.target.value)
            }
          />

          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={saveExercise}
              loading={saving}
            >
              Spremi
            </Button>

            <Button
              variant="secondary"
              onClick={cancelEditing}
              disabled={saving}
            >
              Odustani
            </Button>
          </div>
        </div>
      </Card>
    );
  }

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

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setEditing(true)}
          >
            Uredi
          </Button>

          <Button
            variant="danger"
            onClick={deleteExercise}
            loading={deleting}
          >
            Izbriši vježbu
          </Button>
        </div>
      </div>
    </Card>
  );
}