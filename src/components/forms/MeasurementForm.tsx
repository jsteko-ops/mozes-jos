"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MeasurementForm({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [weight, setWeight] = useState("");

  const save = async () => {
    if (!clientId) return;
    if (!weight) return;

    await addDoc(collection(db, "klijenti", clientId, "measurements"), {
      weight: parseFloat(weight),
      createdAt: serverTimestamp(),
    });

    onSaved();
    onClose();
  };

  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
      <h3>➕ Add Measurement</h3>

      <input
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={save}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}