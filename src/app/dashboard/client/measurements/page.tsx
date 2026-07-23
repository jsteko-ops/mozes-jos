"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientMeasurementsView from "@/components/client/ClientMeasurementsView";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";


export default function ClientMeasurementsPage() {


  const [clientId,setClientId] =
    useState<string | null>(null);


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


          const snap =
            await getDoc(
              doc(
                db,
                "clients",
                user.uid
              )
            );


          if(snap.exists()){

            setClientId(
              user.uid
            );

          }


          setLoading(false);


        }
      );


    return ()=>unsub();


  },[]);





  return (

    <RoleGuard allowedRoles={["client"]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">
          📏 Moja mjerenja
        </h1>



        {
          loading

          ?

          <p>
            Učitavanje...
          </p>


          :

          clientId

          ?

          <ClientMeasurementsView
            clientId={clientId}
          />


          :

          <p>
            Klijent nije pronađen.
          </p>

        }


      </div>


    </RoleGuard>

  );

}