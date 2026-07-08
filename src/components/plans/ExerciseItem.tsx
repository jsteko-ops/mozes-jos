"use client";

import Card from "@/components/ui/Card";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest?: number;
};


export default function ExerciseItem({
  exercise,
}: {
  exercise: Exercise;
}) {
  return (
    <Card>

      <div className="space-y-2">

        <h3 className="font-semibold text-lg">
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

    </Card>
  );
}