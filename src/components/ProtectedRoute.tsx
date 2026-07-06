"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/getUserRole";

export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

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

      if (allowedRoles.includes(role)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [allowedRoles]);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  if (!allowed) {
    return (
      <div style={{ padding: 20 }}>
        <h2>⛔ Access denied</h2>
        <p>You don’t have permission for this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}