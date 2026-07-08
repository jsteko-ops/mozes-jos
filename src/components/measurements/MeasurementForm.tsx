"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function MeasurementForm({
  clientId,
  onCreated,
}: {
  clientId: string;
  onCreated: () => void;
}) {
  const { user } = useAuth();

  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");

  const addMeasurement = async () => {
    if (!user) return;

    const ref = collection(
      db,
      "users",
      user.uid,
      "clients",
      clientId,
      "measurements"
    );

    await addDoc(ref, {
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : null,
      notes,
      createdAt: serverTimestamp(),
    });

    setWeight("");
    setBodyFat("");
    setNotes("");

    onCreated();
  };

  return (
    <div className="bg-white border p-4 rounded-xl space-y-3">
      <input
        placeholder="Težina (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <input
        placeholder="Body fat % (opcionalno)"
        value={bodyFat}
        onChange={(e) => setBodyFat(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <textarea
        placeholder="Bilješke"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <button
        onClick={addMeasurement}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Dodaj mjerenje
      </button>
    </div>
  );
}