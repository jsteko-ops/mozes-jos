"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MeasurementForm({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const [weight, setWeight] = useState("");

  const save = async () => {
    if (!clientId) return;

    await addDoc(
      collection(db, "klijenti", clientId, "measurements"),
      {
        weight: parseFloat(weight),
        createdAt: new Date(),
      }
    );

    onClose();
  };

  return (
    <div style={{ padding: 20, background: "white" }}>
      <h3>➕ Add Measurement</h3>

      <input
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <button onClick={save}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}