"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div style={{ padding: 20 }}>
        <h1>🧍 Client Dashboard</h1>
        <p>Samo klijent vidi ovo.</p>
      </div>
    </ProtectedRoute>
  );
}