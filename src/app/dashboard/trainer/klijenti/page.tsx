"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  getClients,
} from "@/lib/services/klijentiService";


export default function TrainerClientsPage() {


  const { user } = useAuth();


  const [clients, setClients] =
    useState<any[]>([]);


  const [loading, setLoading] =
    useState(true);




  useEffect(() => {


    async function loadClients() {


      if (!user) return;


      const data =
        await getClients(user.uid);


      setClients(data);


      setLoading(false);


    }


    loadClients();


  }, [user]);






  return (


    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">
          👥 Moji klijenti
        </h1>





        {loading && (

          <p>
            Učitavanje klijenata...
          </p>

        )}






        {!loading && clients.length === 0 && (

          <p>
            Nema dodanih klijenata.
          </p>

        )}







        <div className="grid gap-4">



          {clients.map((client)=>(


            <Link

              key={client.id}

              href={`/dashboard/trainer/klijenti/${client.id}`}

              className="border rounded-xl p-4 bg-white hover:bg-gray-50"

            >


              <h2 className="font-bold text-lg">

                {client.name}

              </h2>



              <p>
                {client.email}
              </p>



            </Link>


          ))}


        </div>



      </div>


    </RoleGuard>


  );


}