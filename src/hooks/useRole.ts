"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/getUserRole";
import { UserRole } from "@/types/roles";

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const r = await getUserRole(user.uid);
      setRole(r);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { role, loading };
}