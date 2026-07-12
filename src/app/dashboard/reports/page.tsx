"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { canAccessFeature } from "@/lib/auth/checkPremium";

export default function ReportsPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userProfile) {
    return <p>Nema korisnika.</p>;
  }

  if (!canAccessFeature(userProfile, "reports")) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔒 Reports locked</h2>
        <p>
          Upgrade to Pro to unlock reports.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📄 Reports</h1>
      <p>
        Premium izvještaji za napredak klijenata.
      </p>
    </div>
  );
}