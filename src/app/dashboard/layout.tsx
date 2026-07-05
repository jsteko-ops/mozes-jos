"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPremium } = useUser();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: 240,
          background: "#111",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>⚡ SaaS App</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/dashboard" style={{ color: "white" }}>
            🏠 Dashboard
          </Link>

          <Link href="/dashboard/klijenti" style={{ color: "white" }}>
            👥 Klijenti
          </Link>

          <Link href="/dashboard/billing" style={{ color: "white" }}>
            💳 Billing
          </Link>

          <Link href="/dashboard/settings" style={{ color: "white" }}>
            ⚙️ Settings
          </Link>
        </nav>

        <div style={{ marginTop: 30, fontSize: 12 }}>
          Status:
          <div
            style={{
              marginTop: 5,
              color: isPremium ? "lightgreen" : "orange",
              fontWeight: "bold",
            }}
          >
            {isPremium ? "⭐ Premium" : "Free plan"}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: 20 }}>{children}</div>
    </div>
  );
}