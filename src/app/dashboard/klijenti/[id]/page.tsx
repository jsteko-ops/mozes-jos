"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useMeasurements } from "@/lib/hooks/useMeasurements";
import MeasurementForm from "@/components/forms/MeasurementForm";

export default function KlijentDetalj() {
  const { id } = useParams();

  const [klijent, setKlijent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const { data: measurements } = useMeasurements(id as string);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const ref = doc(db, "klijenti", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setKlijent({ id: snap.id, ...snap.data() });
      } else {
        setKlijent(null);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) return <p>Loading client...</p>;
  if (!klijent) return <p>Client not found</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <h1>👤 {klijent.name}</h1>
      <p>🎯 Goal: {klijent.goal}</p>

      {/* ACTION BUTTON */}
      <button
        onClick={() => setOpen(true)}
        style={{ marginTop: 10, padding: 8 }}
      >
        ➕ Add measurement
      </button>

      {/* MODAL */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#00000066",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MeasurementForm
            clientId={id as string}
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      {/* HISTORY */}
      <h2 style={{ marginTop: 20 }}>📊 Measurements</h2>

      {measurements.length === 0 && <p>No measurements yet</p>}

      {measurements.map((m) => (
        <div
          key={m.id}
          style={{
            padding: 10,
            marginTop: 10,
            background: "#f3f3f3",
            borderRadius: 8,
          }}
        >
          ⚖️ <b>{m.weight} kg</b>
          <br />
          <small>
            {m.createdAt?.seconds
              ? new Date(m.createdAt.seconds * 1000).toLocaleString()
              : ""}
          </small>
        </div>
      ))}
    </div>
  );
}