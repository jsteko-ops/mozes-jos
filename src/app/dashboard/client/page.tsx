"use client";

import RoleGuard from "@/components/auth/RoleGuard";

export default function ClientDashboard() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <div>
        <h1 className="text-2xl font-bold">
          Client Dashboard 👤
        </h1>

        <p>
          Ovdje će klijent pratiti treninge, prehranu i napredak.
        </p>
      </div>
    </RoleGuard>
  );
}