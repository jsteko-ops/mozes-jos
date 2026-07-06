"use client";

import { handleUpgrade } from "@/lib/checkout";

export default function UpgradePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Upgrade plan</h1>

      <button
        onClick={() => handleUpgrade("pro")}
        style={{ padding: 10, background: "black", color: "white" }}
      >
        Upgrade to Pro
      </button>

      <button
        onClick={() => handleUpgrade("business")}
        style={{ padding: 10, marginLeft: 10 }}
      >
        Upgrade to Business
      </button>
    </div>
  );
}