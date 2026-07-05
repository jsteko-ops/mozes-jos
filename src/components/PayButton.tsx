"use client";

import { auth } from "@/lib/firebase";

export default function PayButton() {
  const handlePay = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid, // 🔥 SINGLE SOURCE OF TRUTH
      }),
    });

    const data = await res.json();

    window.location.href = data.url;
  };

  return <button onClick={handlePay}>💳 Plati</button>;
}