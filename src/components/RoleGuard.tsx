"use client";

import { useRole } from "@/hooks/useRole";

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const { role, loading } = useRole();

  if (loading) return <p>Loading...</p>;
  if (!role) return <p>No access</p>;

  if (!allowedRoles.includes(role)) {
    return <p>Access denied</p>;
  }

  return <>{children}</>;
}