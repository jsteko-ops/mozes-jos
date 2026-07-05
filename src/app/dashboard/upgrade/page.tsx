"use client";

import UpgradeButton from "@/components/UpgradeButton";

export default function UpgradePage() {
  return (
    <div style={page}>
      <h1>Upgrade your plan</h1>
      <p style={{ color: "#6b7280" }}>
        Choose the plan that fits your business
      </p>

      <div style={grid}>
        <div style={card}>
          <h2>Pro</h2>
          <p>9.99€ / month</p>
          <UpgradeButton plan="pro" />
        </div>

        <div style={card}>
          <h2>Business</h2>
          <p>19.99€ / month</p>
          <UpgradeButton plan="business" />
        </div>
      </div>
    </div>
  );
}

const page = { padding: 30 };

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20,
};

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
};