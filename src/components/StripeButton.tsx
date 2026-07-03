"use client";

import { useState } from "react";

export default function StripeButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 🔴 PRIVREMENO (kasnije Firebase user)
      const userId = "test-user-123";

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await res.json();

      console.log("🧾 CHECKOUT RESPONSE:", data);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("❌ No URL returned:", data);
      }
    } catch (err) {
      console.error("Checkout error:", err);
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
      {loading ? "Processing..." : "Subscribe"}
    </button>
  );
}