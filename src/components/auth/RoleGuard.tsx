"use client";

import { useAuth } from "./AuthProvider";

type Role =
  | "admin"
  | "trainer"
  | "gymOwner"
  | "client";

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        Učitavanje...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-6">
        Nema korisničkog profila.
      </div>
    );
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return (
      <div className="p-6">
        Nemaš dozvolu za ovu stranicu.
      </div>
    );
  }

  return <>{children}</>;
}