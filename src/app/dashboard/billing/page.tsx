"use client";

import Card from "@/components/ui/Card";

export default function Billing() {
  return (
    <div>
      <h1>Billing</h1>

      <Card>
        <h2>Current plan</h2>
        <p style={{ color: "#6b7280" }}>
          Free plan (5 clients limit)
        </p>

        <button className="btn btn-primary">
          Upgrade
        </button>
      </Card>
    </div>
  );
}