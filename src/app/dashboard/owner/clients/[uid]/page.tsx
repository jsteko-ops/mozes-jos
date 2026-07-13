"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import ClientMeasurements from "@/components/owner/ClientMeasurements";
import ClientPlans from "@/components/owner/ClientPlans";

import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";


type Client = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  goal?: string;
  trainerId?: string;
  gymId?: string;
};



export default function OwnerClientProfile() {

  const params = useParams();


  const [client, setClient] =
    useState<Client | null>(null);


  const [trainer, setTrainer] =
    useState<any>(null);


  const [gym, setGym] =
    useState<any>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    loadClient();

  }, []);



  async function loadClient() {

    try {


      const id = params.uid as string;



      // =====================
      // KLIJENT
      // =====================

      const clientSnap = await getDoc(
        doc(
          db,
          "clients",
          id
        )
      );



      if (!clientSnap.exists()) {

        setLoading(false);
        return;

      }



      const clientData = {

        id: clientSnap.id,

        ...clientSnap.data(),

      } as Client;



      setClient(clientData);




      // =====================
      // TRENER
      // =====================

      if (clientData.trainerId) {


        const trainerSnap = await getDoc(
          doc(
            db,
            "users",
            clientData.trainerId
          )
        );


        if (trainerSnap.exists()) {

          setTrainer(
            trainerSnap.data()
          );

        }

      }




      // =====================
      // TERETANA
      // =====================

      if (clientData.gymId) {


        const gymSnap = await getDoc(
          doc(
            db,
            "gyms",
            clientData.gymId
          )
        );


        if (gymSnap.exists()) {

          setGym(
            gymSnap.data()
          );

        }

      }



    } catch(error) {


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
                <b>Ime:</b>{" "}
                {client.name || "-"}
              </div>



              <div>
                <b>Email:</b>{" "}
                {client.email || "-"}
              </div>



              <div>
                <b>Telefon:</b>{" "}
                {client.phone || "-"}
              </div>



              <div>
                <b>Napomena:</b>{" "}
                {client.note || "-"}
              </div>



              <div>
                <b>Cilj:</b>{" "}
                {client.goal || "-"}
              </div>




              <hr />



              <div>
                <b>Trener:</b>{" "}
                {
                  trainer?.name ||
                  trainer?.email ||
                  "-"
                }
              </div>




              <div>
                <b>Teretana:</b>{" "}
                {
                  gym?.name ||
                  "-"
                }
              </div>




              <div>
                <b>Client ID:</b>{" "}
                <span className="text-xs break-all">
                  {client.id}
                </span>
              </div>



            </div>




            <ClientMeasurements
              clientId={client.id}
            />




            <ClientPlans
              clientId={client.id}
            />



          </>

        )}


      </div>


    </ProtectedRoute>

  );

}