"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const linkClass = (href: string) =>
    `block rounded-lg px-3 py-2 transition ${
      pathname === href
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 min-h-screen border-r bg-white p-5 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Možeš Još
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>

        <Link
          href="/dashboard/clients"
          className={linkClass("/dashboard/clients")}
        >
          Klijenti
        </Link>

        <Link
          href="/dashboard/checkins"
          className={linkClass("/dashboard/checkins")}
        >
          Check-in
        </Link>

        <Link
          href="/dashboard/reports"
          className={linkClass("/dashboard/reports")}
        >
          Izvještaji
        </Link>

        <Link
          href="/dashboard/billing"
          className={linkClass("/dashboard/billing")}
        >
          Naplata
        </Link>

        <Link
          href="/dashboard/settings"
          className={linkClass("/dashboard/settings")}
        >
          Postavke
        </Link>
      </nav>

      <button
        onClick={logout}
        className="mt-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Odjava
      </button>
    </aside>
  );
}