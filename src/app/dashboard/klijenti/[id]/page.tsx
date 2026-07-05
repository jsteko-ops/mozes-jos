"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMeasurements } from "@/lib/hooks/useMeasurements";
import ClientProgressChart from "@/components/charts/ClientProgressChart";

export default function KlijentPage() {
  const { id } = useParams<{ id: string }>();

  const [klijent, setKlijent] = useState<any>(null);
  const { data: measurements } = useMeasurements(id);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "klijenti", id));
      setKlijent({ id: snap.id, ...snap.data() });
    };

    if (id) load();
  }, [id]);

  if (!klijent) {
    return <p style={{ padding: 20 }}>Loading client...</p>;
  }

  // 📊 format chart data
  const chartData = measurements.map((m: any) => ({
    date: new Date(m.createdAt?.seconds * 1000 || Date.now())
      .toLocaleDateString("en-GB"),
    value: m.value || 0,
  }));

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 {klijent.name}</h1>
      <p>🎯 Goal: {klijent.goal}</p>

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