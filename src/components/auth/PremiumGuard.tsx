"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";


export default function PremiumGuard({
  children,
}: {
  children: React.ReactNode;
}) {


  const { user } = useAuth();


  const [loading, setLoading] =
    useState(true);


  const [premium, setPremium] =
    useState(false);



  useEffect(() => {


    async function checkPremium(){


      if(!user){
        setLoading(false);
        return;
      }


      const ref =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(ref);



      if(snap.exists()){


        const data =
          snap.data();



        setPremium(
          data.isPremium === true &&
          data.subscriptionStatus === "active"
        );


      }


      setLoading(false);


    }



    checkPremium();


  },[user]);





  if(loading){

    return (
      <p className="p-6">
        Provjera pretplate...
      </p>
    );

  }





  if(!premium){

    return (

      <div className="p-6">


        <div className="border rounded-xl p-6 bg-yellow-50">


          <h2 className="text-xl font-bold">
            🔒 Možeš Još Pro funkcija
          </h2>


          <p className="mt-2">
            Ova funkcija je dostupna samo Pro korisnicima.
          </p>


          <a
          href="/dashboard/trainer/naplata"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-black text-white"
          >

            Aktiviraj Pro

          </a>


        </div>


      </div>

    );

  }




  return (
    <>
      {children}
    </>
  );


}