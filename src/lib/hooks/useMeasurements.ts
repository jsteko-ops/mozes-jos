"use client";

import { useEffect, useState } from "react";
import { listenMeasurements } from "@/lib/repositories/klijenti.repo";

export function useMeasurements(clientId?: string) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!clientId) return;

    const unsub = listenMeasurements(clientId, (d: any[]) => {
      setData(
        [...d].sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        )
      );
    });

    return () => unsub();
  }, [clientId]);

  return data;
}