"use client";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

type Role =
  | "admin"
  | "trainer"
  | "gym_owner"
  | "gym_staff"
  | "client";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: Role[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    userProfile,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (!userProfile) {
    return null;
  }

  if (
    !allowedRoles.includes(
      userProfile.role
    )
  ) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-5
          text-sm
          font-semibold
          text-red-700
        "
      >
        Nemate dozvolu za pristup ovoj stranici.
      </div>
    );
  }

  return <>{children}</>;
}