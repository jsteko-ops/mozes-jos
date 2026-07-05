"use client";

import { useUser } from "@/lib/hooks/useUser";

export default function BillingPage() {
  const { isPremium } = useUser();

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        userId: "test", // možeš zamijeniti s real user.uid
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div>
      <h1>💳 Billing</h1>

      <div
        style={{
          padding: 15,
          marginTop: 10,
          background: isPremium ? "#e6ffed" : "#fff3cd",
          borderRadius: 10,
        }}
      >
        Status: {isPremium ? "⭐ Premium" : "Free plan"}
      </div>

      {!isPremium && (
        <button
          onClick={handleUpgrade}
          style={{
            marginTop: 20,
            padding: 12,
            background: "black",
            color: "white",
            borderRadius: 8,
          }}
        >
          🚀 Upgrade to Premium
        </button>
      )}
    </div>
  );
}