"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import MeasurementForm from "@/components/measurements/MeasurementForm";
import MeasurementList from "@/components/measurements/MeasurementList";

export default function MeasurementsPage() {
  const { user, loading } = useAuth();
  const params = useParams();

  const clientId = params?.id as string;

  const [measurements, setMeasurements] = useState<any[]>([]);

  const fetchMeasurements = async () => {
    if (!user || !clientId) return;

    const ref = collection(
      db,
      "users",
      user.uid,
      "clients",
      clientId,
      "measurements"
    );

    const snap = await getDocs(ref);

    setMeasurements(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  };

  useEffect(() => {
    if (!loading && user && clientId) {
      fetchMeasurements();
    }
  }, [user, loading, clientId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mjerenja</h1>

      <MeasurementForm
        clientId={clientId}
        onCreated={fetchMeasurements}
      />

      <MeasurementList measurements={measurements} />
    </div>
  );
}