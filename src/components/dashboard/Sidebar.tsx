"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function Sidebar() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error(error);
      alert("Greška prilikom odjave.");
    }
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-6">
        Možeš Još
      </div>

      <nav className="flex flex-col gap-3 text-sm flex-1">
        <Link href="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>

        <Link href="/dashboard/clients" className="hover:text-blue-600">
          Klijenti
        </Link>

        <Link href="/dashboard/plans" className="hover:text-blue-600">
          Planovi
        </Link>

        <Link href="/dashboard/measurements" className="hover:text-blue-600">
          Mjerenja
        </Link>

        <Link href="/dashboard/chat" className="hover:text-blue-600">
          Chat
        </Link>

        <Link href="/dashboard/settings" className="hover:text-blue-600">
          Postavke
        </Link>
      </nav>

      <button
        onClick={logout}
        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Odjava
      </button>
    </aside>
  );
}