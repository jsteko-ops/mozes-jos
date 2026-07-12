"use client";

import { useUser } from "@/lib/hooks/useUser";
import { canAccessFeature } from "@/lib/auth/checkPremium";

export default function ReportsPage() {
  const { user } = useUser();

  if (!user) {
    return <p>Loading...</p>;
  }

  if (!canAccessFeature(user, "reports")) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔒 Reports locked</h2>
        <p>Upgrade to Pro to unlock reports.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📄 Reports</h1>
      <p>Premium izvještaji za napredak klijenata.</p>
    </div>
  );
}