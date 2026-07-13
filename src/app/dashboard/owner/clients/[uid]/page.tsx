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

      const id = params.uid as string;



      // 1. prvo pokušaj clients kolekciju

      const clientSnap = await getDoc(
        doc(
          db,
          "clients",
          id
        )
      );



      if (clientSnap.exists()) {

        setClient({

          id: clientSnap.id,

          ...clientSnap.data(),

        });


        setLoading(false);

        return;

      }





      // 2. ako nije client, probaj users

      const userSnap = await getDoc(
        doc(
          db,
          "users",
          id
        )
      );



      if (userSnap.exists()) {

        setClient({

          id: userSnap.id,

          ...userSnap.data(),

        });

      }



    } catch (error) {

      console.error(
        "Greška kod učitavanja profila:",
        error
      );

    }



    setLoading(false);

  }





  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>

      <div className="p-6">


        {loading ? (

          <p>
            Učitavanje...
          </p>


        ) : !client ? (

          <p>
            Klijent nije pronađen.
          </p>


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
                  Cilj:
                </span>{" "}
                {client.goal || "-"}
              </div>



              <div>
                <span className="font-semibold">
                  Trener ID:
                </span>{" "}
                {client.trainerId || "-"}
              </div>



              <div>
                <span className="font-semibold">
                  Gym ID:
                </span>{" "}
                {client.gymId || "-"}
              </div>



              <div>
                <span className="font-semibold">
                  Client ID:
                </span>{" "}
                {client.id}
              </div>



            </div>


          </>

        )}


      </div>


    </ProtectedRoute>

  );

}