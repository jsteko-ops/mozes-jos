"use client";

import StripeButton from "@/components/StripeButton";

export default function SettingsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Settings</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h2>Subscription</h2>
        <p>Upgrade your account</p>

        <StripeButton />
      </div>
    </div>
  );
}