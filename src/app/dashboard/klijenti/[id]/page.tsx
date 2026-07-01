"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function KlijentDetalj() {
  const { id } = useParams();
  const [klijent, setKlijent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const ref = doc(db, "klijenti", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setKlijent({ id: snap.id, ...snap.data() });
      }

      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) return <p>Loading client...</p>;
  if (!klijent) return <p>Client not found</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 {klijent.name}</h1>
      <p>🎯 Goal: {klijent.goal}</p>
    </div>
  );
}