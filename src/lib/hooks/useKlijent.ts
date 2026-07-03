"use client";

import { useEffect, useState } from "react";
import { getKlijentById } from "@/lib/repositories/klijenti.repo";

export function useKlijent(id?: string) {
  const [klijent, setKlijent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function load(clientId: string) {
      const data = await getKlijentById(clientId);
      setKlijent(data);
      setLoading(false);
    }

    load(id);
  }, [id]);

  return { klijent, loading };
}