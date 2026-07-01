"use client";

import { useEffect, useState } from "react";
import { getKlijentById } from "@/lib/repositories/klijenti.repo";

export function useKlijent(id?: string) {
  const [klijent, setKlijent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const data = await getKlijentById(id);
      setKlijent(data);
      setLoading(false);
    }

    load();
  }, [id]);

  return { klijent, loading };
}