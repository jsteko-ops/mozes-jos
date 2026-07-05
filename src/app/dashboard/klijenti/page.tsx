"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { useKlijenti } from "@/lib/hooks/useKlijenti";

export default function KlijentiPage() {
  const { klijenti } = useKlijenti();

  return (
    <div style={{ padding: 30 }}>
      <div style={header}>
        <h1>Clients</h1>

        <Link href="/dashboard/klijenti/novi" style={button}>
          + New client
        </Link>
      </div>

      <div style={{ marginTop: 20 }}>
        {klijenti.map((k) => (
          <Card key={k.id}>
            <Link href={`/dashboard/klijenti/${k.id}`}>
              <strong>{k.name}</strong>
              <p style={{ color: "#6b7280" }}>{k.goal}</p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const button = {
  background: "#111",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
};