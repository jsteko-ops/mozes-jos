"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMeasurements } from "@/lib/hooks/useMeasurements";
import ClientProgressChart from "@/components/charts/ClientProgressChart";

export default function KlijentPage() {
  const { id } = useParams<{ id: string }>();

  const [klijent, setKlijent] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [value, setValue] = useState("");

  const { data: measurements } = useMeasurements(id);

  // 📥 load client
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const snap = await getDoc(doc(db, "klijenti", id));
      if (snap.exists()) {
        setKlijent({ id: snap.id, ...snap.data() });
      }
    };

    load();
  }, [id]);

  // ➕ add measurement
  const handleAddMeasurement = async () => {
    if (!value || !id) return;

    await addDoc(collection(db, "klijenti", id, "measurements"), {
      value: Number(value),
      createdAt: serverTimestamp(),
    });

    setValue("");
    setShowForm(false);
  };

  if (!klijent) {
    return <p style={{ padding: 20 }}>Loading client...</p>;
  }

  // 📊 chart format
  const chartData = measurements.map((m: any) => ({
    date: new Date(m.createdAt?.seconds * 1000 || Date.now())
      .toLocaleDateString("en-GB"),
    value: m.value || 0,
  }));

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 {klijent.name}</h1>
      <p>🎯 Goal: {klijent.goal}</p>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginTop: 10,
          padding: 10,
          background: "black",
          color: "white",
          border: "none",
          borderRadius: 6,
        }}
      >
        ➕ Add Measurement
      </button>

      {/* FORM */}
      {showForm && (
        <div style={{ marginTop: 20 }}>
          <h3>➕ New Measurement</h3>

          <input
            placeholder="Weight (kg)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              padding: 8,
              marginRight: 10,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handleAddMeasurement}
            style={{
              padding: 8,
              background: "green",
              color: "white",
              border: "none",
            }}
          >
            Save
          </button>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>📈 Progress</h3>

      {chartData.length === 0 ? (
        <p>Nema mjerenja još</p>
      ) : (
        <ClientProgressChart data={chartData} />
      )}
    </div>
  );
}