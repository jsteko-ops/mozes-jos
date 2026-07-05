"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: 240,
          background: "#111",
          color: "white",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h2>⚡ Mozeš Jos</h2>

        <Link href="/dashboard" style={{ color: "white" }}>
          🏠 Dashboard
        </Link>

        <Link href="/dashboard/klijenti" style={{ color: "white" }}>
          👥 Klijenti
        </Link>

        <Link href="/dashboard/billing" style={{ color: "white" }}>
          💳 Billing
        </Link>

        <hr style={{ width: "100%", opacity: 0.3 }} />

        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            background: "red",
            color: "white",
            border: "none",
            padding: 10,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: 20 }}>{children}</div>
    </div>
  );
}