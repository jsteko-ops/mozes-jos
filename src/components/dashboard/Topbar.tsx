"use client";

import { User } from "firebase/auth";

export default function Topbar({ user }: { user: User | null }) {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="text-sm text-gray-600">
        {user?.email ?? "Učitavanje korisnika..."}
      </div>

      <div className="text-sm font-medium">
        Možeš Još
      </div>
    </header>
  );
}