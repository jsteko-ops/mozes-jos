"use client";

import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";


export default function ClientPlans({
  clientId,
}: {
  clientId: string;
}) {

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadPlans();

  }, [clientId]);



  async function loadPlans() {

    try {

      const q = query(

        collection(
          db,
          "clients",
          clientId,
          "plans"
        ),

        orderBy(
          "createdAt",
          "desc"
        )

      );


      const snap = await getDocs(q);


      setPlans(

        snap.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }))

      );


    } catch(error) {

      console.error(
        "Greška planovi:",
        error
      );

    }


    setLoading(false);

  }



  if (loading) {

    return (
      <p>
        Učitavanje planova...
      </p>
    );

  }



  return (

    <div className="mt-6 rounded-xl border bg-white p-6">


      <h2 className="text-xl font-bold mb-4">
        🏋️ Trening planovi
      </h2>



      {
        plans.length === 0 ? (

          <p>
            Nema trening planova.
          </p>


        ) : (


          <div className="space-y-3">


            {plans.map((plan) => (

              <div
                key={plan.id}
                className="border rounded-lg p-4"
              >

                <h3 className="font-bold">
                  {plan.name}
                </h3>


                <p className="text-gray-600">
                  {plan.description || "-"}
                </p>


              </div>

            ))}


          </div>


        )
      }


    </div>

  );

}