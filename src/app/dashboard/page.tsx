"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/lib/getUserRole";

export default function DashboardRouter() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const role = await getUserRole(user.uid);

      if (!role) {
        window.location.href = "/login";
        return;
      }

      // 🔥 ROLE REDIRECT LOGIKA
      switch (role) {
        case "trainer":
          window.location.href = "/dashboard/trainer";
          break;

        case "gym_owner":
          window.location.href = "/dashboard/owner";
          break;

        case "client":
          window.location.href = "/dashboard/client";
          break;

        case "admin":
          window.location.href = "/dashboard/admin";
          break;

        default:
          window.location.href = "/login";
      }
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <p>Loading dashboard...</p>
    </div>
  );
}