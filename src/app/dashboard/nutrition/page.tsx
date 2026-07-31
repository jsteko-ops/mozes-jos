"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientNutrition from "@/components/client/ClientNutrition";

import {
  auth,
} from "@/lib/firebase";

import {
  getClientByEmail,
} from "@/lib/services/klijentiService";


export default function NutritionPage() {

  const [
    clientId,
    setClientId,
  ] = useState<string | null>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(

        auth,

        async (user) => {

          if (!user) {

            setError(
              "Korisnik nije prijavljen."
            );

            setLoading(false);

            return;

          }


          try {

            const client =
              await getClientByEmail(
                user.email || ""
              );


            if (!client) {

              setError(
                "Klijentski profil nije pronađen."
              );

              setLoading(false);

              return;

            }


            setClientId(
              client.id
            );

          } catch (error) {

            console.error(
              "Greška kod učitavanja prehrane:",
              error
            );

            setError(
              "Nije moguće učitati plan prehrane."
            );

          } finally {

            setLoading(false);

          }

        }

      );


    return () => {

      unsubscribe();

    };

  }, []);


  return (

    <RoleGuard allowedRoles={["client"]}>

      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold">

            🥗 Moja prehrana

          </h1>

          <p className="mt-2 text-gray-600">

            Ovdje možeš pregledati planove prehrane
            koje ti je dodao trener.

          </p>

        </div>


        {loading && (

          <p>
            Učitavanje plana prehrane...
          </p>

        )}


        {!loading && error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

            {error}

          </div>

        )}


        {!loading && clientId && (

          <ClientNutrition
            clientId={clientId}
          />

        )}

      </div>

    </RoleGuard>

  );

}