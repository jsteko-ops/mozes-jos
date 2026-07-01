"use client";

import Link from "next/link";
import { useKlijenti } from "@/lib/hooks/useKlijenti";

export default function KlijentiPage() {
  const { klijenti, loading } = useKlijenti();

  if (loading) return <p>Loading clients...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Klijenti</h1>

      {klijenti.length === 0 && <p>Nema klijenata</p>}

      {klijenti.map((k) => (
        <Link
          key={k.id}
          href={`/dashboard/klijenti/${k.id}`}
          style={{
            display: "block",
            padding: 10,
            marginTop: 10,
            background: "#eee",
            borderRadius: 8,
          }}
        >
          👤 {k.name} — 🎯 {k.goal}
        </Link>
      ))}
    </div>
  );
}