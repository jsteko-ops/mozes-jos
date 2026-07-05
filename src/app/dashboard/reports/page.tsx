"use client";

import { useUser } from "@/lib/hooks/useUser";
import { canAccessFeature } from "@/lib/auth/checkPremium";

export default function ReportsPage() {
  const { user, loading } = useUser();

  if (loading) return <p>Loading...</p>;

  if (!canAccessFeature(user, "analytics")) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔒 Analytics locked</h2>
        <p>Upgrade to Pro to unlock analytics.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Analytics</h1>
      <p>Full dashboard content here...</p>
    </div>
  );
}