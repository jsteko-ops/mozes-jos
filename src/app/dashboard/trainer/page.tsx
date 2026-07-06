"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function TrainerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["trainer"]}>
      <div style={{ padding: 20 }}>
        <h1>🏋️ Trainer Dashboard</h1>
        <p>Samo treneri vide ovu stranicu.</p>
      </div>
    </ProtectedRoute>
  );
}