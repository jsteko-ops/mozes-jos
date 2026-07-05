"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUserId(user.uid);

      const userSnap = await getDoc(doc(db, "users", user.uid));
      setIsPremium(!!userSnap.data()?.isPremium);

      const klijentiSnap = await getDocs(collection(db, "klijenti"));
      setCount(klijentiSnap.size);

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Stripe error");
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading billing...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>💳 Billing</h1>

      {isPremium ? (
        <h2 style={{ color: "green" }}>⭐ Premium aktivan</h2>
      ) : (
        <h2 style={{ color: "gray" }}>🆓 Free plan</h2>
      )}

      <p>👥 Klijenti: {count}</p>

      {!isPremium && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Upgrade na Premium</h3>
          <p>Neograničeni klijenti, izvještaji i više.</p>
          <p><b>9.99€ / month</b></p>

          <button onClick={handleUpgrade}>
            🚀 Upgrade now
          </button>
        </div>
      )}
    </div>
  );
}