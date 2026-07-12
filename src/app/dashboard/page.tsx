"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !userProfile) return;

    switch (userProfile.role) {
      case "trainer":
        router.replace("/dashboard/trainer");
        break;

      case "gym_owner":
        router.replace("/dashboard/owner");
        break;

      case "admin":
        router.replace("/dashboard");
        break;

      case "client":
        router.replace("/dashboard/client");
        break;

      default:
        router.replace("/login");
    }
  }, [loading, userProfile, router]);

  return (
    <div className="p-6">
      Učitavanje dashboarda...
    </div>
  );
}