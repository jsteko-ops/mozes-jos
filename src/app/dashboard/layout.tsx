"use client";

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: "#111827",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>🏋️ Trainer SaaS</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/dashboard" style={linkStyle}>📊 Dashboard</Link>
          <Link href="/dashboard/klijenti" style={linkStyle}>👥 Klijenti</Link>
          <Link href="/dashboard/checkins" style={linkStyle}>📅 Check-ins</Link>
          <Link href="/dashboard/reports" style={linkStyle}>📄 Reports</Link>
          <Link href="/dashboard/settings" style={linkStyle}>⚙️ Settings</Link>
        </nav>
      </aside>

      {/* CONTENT */}
      <main
        style={{
          flex: 1,
          padding: 24,
          background: "#f9fafb",
          color: "#111",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
};