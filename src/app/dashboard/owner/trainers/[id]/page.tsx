"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";


export default function TrainerDetailsPage() {

  const params = useParams();

  const trainerId =
    params.id as string;


  const [trainer, setTrainer] =
    useState<any>(null);


  const [clients, setClients] =
    useState<any[]>([]);


  const [debug, setDebug] =
    useState("");



  useEffect(() => {

    const loadData = async () => {

      if (!trainerId) return;


      setDebug(
        `TRAŽIM TRENERA: ${trainerId}`
      );



      // DOHVATI TRENERA

      const trainerSnap =
        await getDoc(
          doc(
            db,
            "users",
            trainerId
          )
        );



      if (trainerSnap.exists()) {

        setTrainer({
          uid: trainerSnap.id,
          ...trainerSnap.data(),
        });

      }



      // DOHVATI KLIJENTE OVOG TRENERA
      // klijenti su u users kolekciji

      const q = query(

        collection(
          db,
          "users"
        ),

        where(
          "trainerId",
          "==",
          trainerId
        ),

        where(
          "role",
          "==",
          "client"
        )

      );



      const clientsSnap =
        await getDocs(q);



      const clientList =
        clientsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));



      console.log(
        "CLIENT LIST:",
        clientList
      );



      setClients(clientList);



      setDebug(
        prev =>
          prev +
          "\n\nBROJ KLIJENATA: " +
          clientList.length
      );


    };



    loadData();


  }, [trainerId]);





  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>


      <div className="p-6">


        <h1 className="text-3xl font-bold mb-6">
          👨‍🏫 Trener
        </h1>



        <div className="bg-gray-100 border rounded-xl p-4 mb-6">

          <h3 className="font-bold">
            DEBUG
          </h3>

          <pre className="whitespace-pre-wrap">
            {debug}
          </pre>

        </div>





        {trainer && (

          <div className="bg-white border rounded-xl p-5 mb-6">


            <h2 className="text-xl font-bold">
              {trainer.name}
            </h2>


            <p>
              {trainer.email}
            </p>


          </div>

        )}






        <div className="bg-white border rounded-xl p-5">


          <h2 className="text-xl font-bold mb-4">
            👤 Klijenti
          </h2>




          {clients.length === 0 && (

            <p>
              Nema klijenata kod ovog trenera.
            </p>

          )}






          <div className="space-y-3">


            {clients.map((client) => (

              <div
                key={client.id}
                className="border rounded-lg p-3"
              >

                <p className="font-bold">
                  {client.name}
                </p>


                <p>
                  {client.email}
                </p>


              </div>

            ))}



          </div>


        </div>




      </div>


    </ProtectedRoute>

  );

}