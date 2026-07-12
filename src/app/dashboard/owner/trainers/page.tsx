"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";

import { getGymMembers } from "@/lib/getGymMembers";


export default function OwnerTrainersPage() {

  const [trainers, setTrainers] = useState<any[]>([]);



  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) return;


        const snap = await getDoc(
          doc(db, "users", user.uid)
        );


        const data = snap.data();


        if (data?.gymId) {

          const members =
            await getGymMembers(data.gymId);



          const onlyTrainers =
            members.filter(
              (m) => m.gymRole === "trainer"
            );


          setTrainers(onlyTrainers);

        }

      }
    );


    return () => unsub();


  }, []);




  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>

      <div className="p-6">


        <h1 className="text-3xl font-bold mb-6">
          👨‍🏫 Moji treneri
        </h1>




        {trainers.length === 0 && (

          <p>
            Nema dodanih trenera.
          </p>

        )}






        <div className="space-y-3">


          {trainers.map((trainer) => (


            <Link

              key={trainer.uid}

              href={`/dashboard/owner/trainers/${trainer.uid}`}

              className="block border rounded-xl p-4 bg-white hover:bg-gray-50"

            >


              <h2 className="font-bold">

                {trainer.name}

              </h2>



              <p>

                {trainer.email}

              </p>



              <p className="text-sm text-blue-600 mt-2">

                Otvori trenera →

              </p>



            </Link>


          ))}



        </div>



      </div>


    </ProtectedRoute>

  );

}