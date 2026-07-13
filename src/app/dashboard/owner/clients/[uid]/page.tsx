"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function OwnerClientProfile() {
  const params = useParams();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    try {
      const snap = await getDoc(
        doc(db, "users", params.uid as string)
      );

      if (snap.exists()) {
        setClient({
          uid: snap.id,
          ...snap.data(),
        });
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <ProtectedRoute allowedRoles={["gym_owner"]}>
      <div className="p-6">
        {loading ? (
          <p>Učitavanje...</p>
        ) : !client ? (
          <p>Klijent nije pronađen.</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">
              👤 Profil klijenta
            </h1>

            <div className="rounded-xl border bg-white p-6 space-y-3">

              <div>
                <span className="font-semibold">
                  Ime:
                </span>{" "}
                {client.name || "-"}
              </div>

              <div>
                <span className="font-semibold">
                  Email:
                </span>{" "}
                {client.email || "-"}
              </div>

              <div>
                <span className="font-semibold">
                  Uloga:
                </span>{" "}
                {client.gymRole || "-"}
              </div>

              <div>
                <span className="font-semibold">
                  Trener:
                </span>{" "}
                {client.trainerName || "-"}
              </div>

              <div>
                <span className="font-semibold">
                  Gym:
                </span>{" "}
                {client.gymName || "-"}
              </div>

              <div>
                <span className="font-semibold">
                  UID:
                </span>{" "}
                <span className="text-xs break-all">
                  {client.uid}
                </span>
              </div>

            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}