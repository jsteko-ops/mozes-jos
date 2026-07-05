"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import ClientsChart from "@/components/charts/ClientsChart";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUserEmail(user.email);

      const userSnap = await getDoc(doc(db, "users", user.uid));
      setIsPremium(!!userSnap.data()?.isPremium);

      const klijentiSnap = await getDocs(collection(db, "klijenti"));

      const docs = klijentiSnap.docs.map((d) => d.data());

      setClientCount(docs.length);

      // 📊 GROUP BY DATE
      const map: Record<string, number> = {};

      docs.forEach((c: any) => {
        if (!c.createdAt) return;

        const date = new Date(c.createdAt.seconds * 1000)
          .toLocaleDateString("en-GB");

        map[date] = (map[date] || 0) + 1;
      });

      const formatted = Object.keys(map).map((key) => ({
        name: key,
        value: map[key],
      }));

      setChartData(formatted);

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard</h1>

      <p>Welcome 👋</p>
      <p>Email: {userEmail}</p>

      <hr style={{ margin: "20px 0" }} />

      {/* KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <div style={{ padding: 20, background: "#f3f3f3" }}>
          <h3>👥 Klijenti</h3>
          <h2>{clientCount}</h2>
        </div>

        <div style={{ padding: 20, background: "#f3f3f3" }}>
          <h3>💳 Plan</h3>
          <h2 style={{ color: isPremium ? "green" : "gray" }}>
            {isPremium ? "Premium" : "Free"}
          </h2>
        </div>

        <div style={{ padding: 20, background: "#f3f3f3" }}>
          <h3>⚡ Status</h3>
          <h2>{isPremium ? "Growth" : "Limited"}</h2>
        </div>
      </div>

      {/* REAL CHART */}
      <div style={{ marginTop: 30 }}>
        <h3>📈 Real Growth</h3>

        {chartData.length === 0 ? (
          <p>Nema dovoljno podataka za chart</p>
        ) : (
          <ClientsChart data={chartData} />
        )}
      </div>
    </div>
  );
}