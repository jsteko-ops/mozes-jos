"use client";

import { useState } from "react";
import { useUser } from "@/lib/hooks/useUser";

export default function UpgradeButton({
  plan,
}: {
  plan: "pro" | "business";
}) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        plan,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={upgrade}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? "Redirecting..." : `Upgrade to ${plan}`}
    </button>
  );
}