"use client";

import { useAuth } from "./AuthProvider";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  // samo loading UI (bez routera, bez redirecta)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}