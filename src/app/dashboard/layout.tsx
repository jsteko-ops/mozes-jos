"use client";

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={wrap}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <div style={logo}>⚡ Moje SaaS</div>

        <nav style={nav}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/klijenti">Klijenti</Link>
          <Link href="/dashboard/reports">Reports</Link>
          <Link href="/dashboard/billing">Billing</Link>
          <Link href="/dashboard/upgrade">Upgrade</Link>
        </nav>
      </aside>

      {/* CONTENT */}
      <main style={content}>{children}</main>
    </div>
  );
}

const wrap = {
  display: "flex",
  minHeight: "100vh",
  background: "#f7f7f8",
};

const sidebar = {
  width: 240,
  background: "white",
  borderRight: "1px solid #e5e7eb",
  padding: 20,
};

const logo = {
  fontWeight: 700,
  marginBottom: 20,
};

const nav = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const content = {
  flex: 1,
  padding: 30,
};