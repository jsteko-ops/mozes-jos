"use client";

import { useState } from "react";

export default function StripeButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test1234",
        }),
      });

      const data = await res.json();

      console.log("STRIPE RESPONSE:", data);

      if (data?.url) {
        // 🔥 OVO JE KLJUČ
        window.location.href = data.url;
      } else {
        console.error("No URL returned", data);
      }
    } catch (err) {
      console.error("Stripe error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      style={{
        padding: "10px 16px",
        background: "black",
        color: "white",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {loading ? "Processing..." : "Upgrade (Stripe)"}
    </button>
  );
}