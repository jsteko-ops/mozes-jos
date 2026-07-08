"use client";

import RoleGuard from "@/components/auth/RoleGuard";

export default function TrainerPage() {
  return (
    <RoleGuard allowedRoles={["trainer"]}>
      <div>
        <h1 className="text-2xl font-bold">
          Trainer Dashboard 🏋️
        </h1>

        <p>
          Ovdje će trener upravljati klijentima.
        </p>
      </div>
    </RoleGuard>
  );
}