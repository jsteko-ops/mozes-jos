"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // simulacija prvog logina (možeš kasnije spojiti s Firebase)
    const firstLogin = false;

    if (firstLogin) {
      router.push("/dashboard/onboarding");
    }
  }, [router]);

  return (
    <div style={wrap}>
      <h1>Dashboard</h1>
      <p style={{ color: "#6b7280" }}>
        Welcome back 👋
      </p>

      <div style={cardGrid}>
        <div style={card}>👥 Klijenti</div>
        <div style={card}>📊 Reports</div>
        <div style={card}>💳 Billing</div>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  padding: 20,
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
  marginTop: 20,
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
};