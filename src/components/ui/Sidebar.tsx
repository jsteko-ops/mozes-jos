"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div
      style={{
        width: 220,
        height: "100vh",
        background: "#111",
        color: "white",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <h2>📊 SaaS</h2>

      <Link href="/dashboard" style={{ color: "white" }}>
        🏠 Dashboard
      </Link>

      <Link href="/dashboard/klijenti" style={{ color: "white" }}>
        👥 Klijenti
      </Link>

      <Link href="/dashboard/settings" style={{ color: "white" }}>
        ⚙️ Settings
      </Link>

      <button
        onClick={logout}
        style={{
          marginTop: "auto",
          padding: 10,
          background: "red",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}