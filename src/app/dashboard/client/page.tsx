"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientCheckins from "@/components/client/ClientCheckins";

import { auth, db } from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  getCheckins,
} from "@/lib/services/klijentiService";



export default function ClientDashboard() {


  const [checkins,setCheckins] =
    useState<any[]>([]);


  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{


    const unsub =
      onAuthStateChanged(
        auth,
        async(user)=>{


          if(!user){

            setLoading(false);

            return;

          }



          try{


            const data =
              await getCheckins(
                user.uid
              );


            setCheckins(data);



          }catch(error){


            console.error(
              "Client checkins error:",
              error
            );


          }



          setLoading(false);


        }
      );



    return ()=>unsub();


  },[]);





  const latest =
    checkins[0];



  return (

    <RoleGuard allowedRoles={["client"]}>


      <div className="p-6 space-y-6">



        <h1 className="text-3xl font-bold">

          👤 Moj napredak

        </h1>



        <p className="text-gray-600">

          Ovdje pratiš svoje check-inove,
          napredak i komunikaciju s trenerom.

        </p>
                <div className="grid md:grid-cols-3 gap-4">


          <div className="border rounded-xl bg-white p-5">

            <p className="text-gray-500">
              Ukupno check-inova
            </p>

            <p className="text-3xl font-bold">
              {checkins.length}
            </p>

          </div>




          <div className="border rounded-xl bg-white p-5">

            <p className="text-gray-500">
              Zadnja težina
            </p>

            <p className="text-3xl font-bold">

              {latest?.weight ?? "-"}

              {latest?.weight && " kg"}

            </p>

          </div>




          <div className="border rounded-xl bg-white p-5">

            <p className="text-gray-500">
              Status
            </p>

            <p className="text-xl font-bold">

              {
                latest?.trainerComment

                ?

                "🟢 Odgovoreno"

                :

                "🟠 Čeka odgovor"

              }

            </p>

          </div>


        </div>






        <Link

          href="/dashboard/checkins"

          className="inline-block bg-black text-white px-5 py-3 rounded-xl"

        >

          ➕ Novi Check-in

        </Link>






        {
          loading

          ?

          (

            <p>
              Učitavanje...
            </p>

          )

          :

          (

            <ClientCheckins

              checkins={checkins}

            />

          )

        }




      </div>


    </RoleGuard>

  );

}