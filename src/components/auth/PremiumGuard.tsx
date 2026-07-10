"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";


interface PremiumGuardProps {
  children: React.ReactNode;
}


export default function PremiumGuard({
  children,
}: PremiumGuardProps) {


  const { user } = useAuth();


  const [loading, setLoading] =
    useState(true);


  const [premium, setPremium] =
    useState(false);



  useEffect(() => {


    async function checkPremium() {


      if (!user) {

        setLoading(false);
        return;

      }



      try {


        const snap =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );



        if (snap.exists()) {


          const data =
            snap.data();



          const isPremium =
            data.isPremium === true;



          const active =
            data.subscriptionStatus === "active";



          setPremium(
            isPremium && active
          );


        }



      } catch (error) {


        console.error(
          "Premium check error:",
          error
        );


        setPremium(false);


      }



      setLoading(false);


    }



    checkPremium();



  }, [user]);






  if (loading) {


    return (

      <div className="p-6">

        Učitavanje Pro statusa...

      </div>

    );

  }






  if (!premium) {


    return (

      <div className="p-6">

        <div className="border rounded-xl bg-white shadow-sm p-6">


          <h2 className="text-xl font-bold">

            🔒 Možeš Još Pro

          </h2>



          <p className="mt-3 text-gray-600">

            Ova funkcija je dostupna samo Pro korisnicima.

          </p>



          <a

            href="/dashboard/trainer/naplata"

            className="inline-block mt-5 bg-black text-white px-5 py-3 rounded-lg"

          >

            Aktiviraj Pro plan

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