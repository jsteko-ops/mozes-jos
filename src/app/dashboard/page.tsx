"use client";

import Card from "@/components/ui/Card";

export default function Dashboard() {
  return (
    <div style={page}>
      <h1 style={h1}>Dashboard</h1>
      <p style={muted}>Welcome back 👋</p>

      <div style={grid}>
        <Card>
          <h3>👥 Clients</h3>
          <p style={muted}>Manage your clients</p>
        </Card>

        <Card>
          <h3>📊 Analytics</h3>
          <p style={muted}>Track progress</p>
        </Card>

        <Card>
          <h3>💳 Billing</h3>
          <p style={muted}>Subscription status</p>
        </Card>
      </div>
    </div>
  );
}

const page = {
  padding: 30,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
  marginTop: 20,
};

const h1 = {
  fontSize: 28,
  marginBottom: 5,
};

const muted = {
  color: "#6b7280",
};