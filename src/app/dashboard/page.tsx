"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>❌ Not logged in</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard</h1>

      <div style={{ marginTop: 20 }}>
        <p>👤 User: {user.email}</p>
        <p>🆔 UID: {user.uid}</p>
      </div>
    </div>
  );
}