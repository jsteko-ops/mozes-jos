"use client";

import { useAuth } from "./AuthProvider";

type Role =
  | "admin"
  | "trainer"
  | "gym_owner"
  | "client";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: Role[];
};

export default function RoleGuard({
  children,
  allowedRoles,
}: RoleGuardProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!userProfile) {
    return null;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return (
      <div>
        Nemate dozvolu za pristup ovoj stranici.
      </div>
    );
  }

  return <>{children}</>;
}