"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientCheckins from "@/components/client/ClientCheckins";

import { auth, db } from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  getCheckins,
  getClientByEmail,
} from "@/lib/services/klijentiService";

import ClientNutrition from "@/components/client/ClientNutrition";



export default function ClientDashboard() {


const searchParams = useSearchParams();

const openCheckin =
  searchParams.get("tab") === "checkin";

const selectedCheckin =
  searchParams.get("checkin");

  const [checkins,setCheckins] =
    useState<any[]>([]);


  const [loading,setLoading] =
    useState(true);

const [clientId,setClientId] =
  useState<string | null>(null);

  useEffect(()=>{


    const unsub =
      onAuthStateChanged(
        auth,
        async(user)=>{


          if(!user){

            setLoading(false);

            return;

          }

const client =
  await getClientByEmail(
    user.email || ""
  );


if(client){

  setClientId(
    client.id
  );

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


const hasTrainerReply =
  checkins.some(
    (item)=>
      item.trainerComment
  );



  return (

    <RoleGuard allowedRoles={["client"]}>


      <div className="space-y-6">



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
  hasTrainerReply

  ?

  "🟢 Trener je odgovorio"

  :

  "🟠 Čeka odgovor"

}

            </p>

          </div>


        </div>






       <Link

  href="/dashboard/checkins"

className="
  inline-block
  bg-blue-600
  text-white
  font-bold
  px-6
  py-3
  rounded-xl
  shadow-lg
  hover:bg-blue-700
  transition
"

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

  selectedCheckin={selectedCheckin}

  clientId={clientId}

/>


          )

        }



        {
          clientId && (

            <ClientNutrition

              clientId={clientId}

            />

          )
        }




      </div>


    </RoleGuard>

  );

}