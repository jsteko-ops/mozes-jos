"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const ref = doc(db, "users", u.uid);

      const unsubDb = onSnapshot(ref, (snap) => {
        const data = snap.data();

        setIsPremium(data?.isPremium || false);
        setLoading(false);
      });

      return () => unsubDb();
    });

    return () => unsubAuth();
  }, []);

  return { user, isPremium, loading };
}