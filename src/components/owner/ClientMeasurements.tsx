"use client";

import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";


export default function ClientMeasurements({
  clientId,
}: {
  clientId: string;
}) {


  const [measurements, setMeasurements] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadMeasurements();

  }, [clientId]);



  async function loadMeasurements() {

    try {


      const q = query(

        collection(
          db,
          "clients",
          clientId,
          "measurements"
        ),

        orderBy(
          "createdAt",
          "desc"
        )

      );



      const snap = await getDocs(q);



      setMeasurements(

        snap.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }))

      );


    } catch(error) {


      console.error(
        "Greška mjerenja:",
        error
      );


    }


    setLoading(false);

  }



  if (loading) {

    return (
      <p>
        Učitavanje mjerenja...
      </p>
    );

  }



  return (

    <div className="mt-6 rounded-xl border bg-white p-6">


      <h2 className="text-xl font-bold mb-4">
        📏 Mjerenja
      </h2>



      {measurements.length === 0 ? (

        <p>
          Nema mjerenja.
        </p>


      ) : (


        <div className="space-y-3">


          {measurements.map((m) => (

            <div
              key={m.id}
              className="border rounded-lg p-4"
            >

              <p>
                Težina: {m.weight || "-"} kg
              </p>

              <p>
                Visina: {m.height || "-"} cm
              </p>

              <p>
                Struk: {m.waist || "-"} cm
              </p>

              <p>
                Prsa: {m.chest || "-"} cm
              </p>

              <p>
                Ruka: {m.arm || "-"} cm
              </p>

            </div>

          ))}


        </div>


      )}


    </div>

  );

}