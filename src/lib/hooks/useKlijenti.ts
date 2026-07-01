"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function useKlijenti() {
  const [klijenti, setKlijenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubAuth: any;
    let unsubData: any;

    unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setKlijenti([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "klijenti"),
        where("userId", "==", user.uid)
      );

      unsubData = onSnapshot(q, (snap) => {
        setKlijenti(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );

        setLoading(false);
      });
    });

    return () => {
      unsubAuth?.();
      unsubData?.();
    };
  }, []);

  return { klijenti, loading };
}