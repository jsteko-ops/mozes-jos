"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { canAccessFeature } from "@/lib/auth/checkPremium";

import {
  getClients,
} from "@/lib/services/klijentiService";

import ClientReport from "@/components/reports/ClientReport";



type Client = {

  id:string;
  name:string;
  email:string;

};



export default function ReportsPage() {


  const {
    user,
    userProfile,
    loading,
  } = useAuth();



  const [clients,setClients] =
    useState<Client[]>([]);



  const [loadingClients,setLoadingClients] =
    useState(true);





  useEffect(()=>{


    async function load(){


      if(
        !user ||
        !userProfile
      ){

        return;

      }



      if(
        userProfile.role === "trainer"
      ){


        const data =
          await getClients(
            user.uid
          );


        setClients(
          data as Client[]
        );


      }



      setLoadingClients(false);


    }



    load();


  },[
    user,
    userProfile
  ]);







  if(loading){

    return <p>Loading...</p>;

  }



  if(!userProfile){

    return <p>Nema korisnika.</p>;

  }



  if(
    !canAccessFeature(
      userProfile,
      "reports"
    )
  ){

    return (

      <div className="p-6">

        <h2 className="text-xl font-bold">

          🔒 Reports locked

        </h2>


        <p>

          Upgrade to Pro to unlock reports.

        </p>


      </div>

    );

  }







  return (

    <div className="p-6 space-y-6">



      <h1 className="text-3xl font-bold">

        📄 Reports

      </h1>



      <p>

        Premium izvještaji za napredak klijenata.

      </p>




      {
        loadingClients

        ?

        <p>

          Učitavanje klijenata...

        </p>


        :


        clients.length === 0

        ?

        <p>

          Nema klijenata.

        </p>


        :


        <div className="space-y-4">


          {
            clients.map((client)=>(


              <div

                key={client.id}

                className="
                border
                rounded-xl
                bg-white
                p-5
                flex
                justify-between
                items-center
                "

              >


                <div>


                  <h2 className="font-bold text-lg">

                    {client.name}

                  </h2>


                  <p className="text-gray-500">

                    {client.email}

                  </p>


                </div>




                <ClientReport

                  clientId={
                    client.id
                  }

                />


              </div>


            ))

          }


        </div>


      }



    </div>

  );


}