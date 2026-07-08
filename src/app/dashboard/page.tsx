"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile) {
      switch (userProfile.role) {
        case "trainer":
          router.replace("/dashboard/trainer");
          break;

        case "gymOwner":
          router.replace("/dashboard/gym-owner");
          break;

        case "admin":
          router.replace("/dashboard/admin");
          break;

        case "client":
        default:
          router.replace("/dashboard/client");
          break;
      }
    }
  }, [userProfile, loading, router]);

  return (
    <div className="p-6">
      Učitavanje dashboarda...
    </div>
  );
}