"use client";

import Link from "next/link";
import { useKlijenti } from "@/lib/hooks/useKlijenti";

export default function KlijentiPage() {
  const { klijenti, loading, isPremium, count } = useKlijenti();

  if (loading) return <p>Loading clients...</p>;

  const limitReached = !isPremium && count >= 5;

  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Klijenti</h1>

      {!isPremium && (
        <p style={{ color: "gray" }}>
          Free plan: {count}/5 klijenata
        </p>
      )}

      {limitReached && (
        <div style={{ color: "red", marginBottom: 10 }}>
          🚫 Dosegnuli ste limit besplatnog plana (5 klijenata).
          <br />
          ⭐ Nadogradite na Premium za neograničeno.
        </div>
      )}

      {!limitReached && (
        <Link
          href="/dashboard/klijenti/novi"
          style={{
            display: "inline-block",
            padding: 10,
            marginBottom: 10,
            background: "black",
            color: "white",
            borderRadius: 8,
          }}
        >
          ➕ Novi klijent
        </Link>
      )}

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