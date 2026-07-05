import { useEffect, useState } from "react";
import { listenMeasurements } from "@/lib/repositories/klijenti.repo";

export function useMeasurements(clientId: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const unsub = listenMeasurements(clientId, (items: any[]) => {
      setData(items);
      setLoading(false);
    });

    return () => unsub();
  }, [clientId]);

  return { data, loading };
}