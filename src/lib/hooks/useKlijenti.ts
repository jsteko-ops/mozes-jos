import { useEffect, useState } from "react";
import { listenKlijenti } from "@/lib/repositories/klijenti.repo";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useKlijenti() {
  const [klijenti, setKlijenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // provjera premium statusa
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setIsPremium(!!snap.data().isPremium);
      }

      // slušanje klijenata
      const unsub = listenKlijenti((data: any[]) => {
        setKlijenti(data);
        setLoading(false);
      });

      return () => unsub();
    });

    return () => unsubAuth();
  }, []);

  return {
    klijenti,
    loading,
    isPremium,
    count: klijenti.length,
  };
}