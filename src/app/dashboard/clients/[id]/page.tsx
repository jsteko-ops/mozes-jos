"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import ClientTabs from "@/components/clients/ClientTabs";
import Card from "@/components/ui/Card";

type Client = {
  id: string;
  name: string;
  email?: string;
  goal?: string;
};

export default function ClientProfilePage() {
  const { user, loading } = useAuth();

  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);

  const fetchClient = async () => {
    if (!user || !clientId) return;

    const ref = doc(
      db,
      "users",
      user.uid,
      "clients",
      clientId
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      console.log("CLIENT DATA:", data);

      setClient({
        id: snap.id,
        ...data,
      } as Client);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchClient();
    }
  }, [user, loading, clientId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!client) {
    return <p>Klijent ne postoji</p>;
  }

  return (
    <div className="space-y-6">

      <Card>
        <div className="space-y-2">

          <h1 className="text-2xl font-bold">
            {client.name}
          </h1>

          <p className="text-gray-600">
            {client.email || "Email nije dodan"}
          </p>

          <p className="text-sm text-gray-500">
            Cilj: {client.goal || "Nije postavljen"}
          </p>

        </div>
      </Card>

      <ClientTabs client={client} />

    </div>
  );
}