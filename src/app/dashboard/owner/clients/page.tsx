"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

import ProtectedRoute from "@/components/ProtectedRoute";

import { getGymMembers } from "@/lib/getGymMembers";


export default function OwnerClientsPage() {

  const { userProfile, loading } = useAuth();

  const [clients, setClients] = useState<any[]>([]);

  const router = useRouter();



  useEffect(() => {

    async function loadClients() {

      if (!userProfile) return;


      if (!userProfile.gymId) {
        return;
      }


      const members = await getGymMembers(
        userProfile.gymId
      );


      const onlyClients = members.filter(
        (member) =>
          member.gymRole === "client"
      );


      setClients(onlyClients);

    }


    if (!loading) {
      loadClients();
    }


  }, [
    userProfile,
    loading
  ]);




  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>

      <div className="p-6">


        <h1 className="text-3xl font-bold mb-6">
          👤 Moji klijenti
        </h1>



        {clients.length === 0 && (

          <p>
            Nema dodanih klijenata.
          </p>

        )}



        <div className="space-y-3">


          {clients.map((client) => (


            <div
              key={client.uid}

              onClick={() =>
                router.push(
                  `/dashboard/owner/clients/${client.uid}`
                )
              }

              className="
              border
              rounded-xl
              bg-white
              p-4
              cursor-pointer
              hover:bg-gray-50
              transition
              "
            >


              <h2 className="font-bold text-lg">
                {client.name || "Bez imena"}
              </h2>


              <p className="text-gray-600">
                {client.email}
              </p>


              <p className="text-blue-600 text-sm mt-3">
                Otvori profil →
              </p>


            </div>


          ))}


        </div>


      </div>


    </ProtectedRoute>

  );

}