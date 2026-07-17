"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


type Measurement = {

  id: string;

  weight: number;

  height: number;

  waist: number;

  chest: number;

  arm: number;

  createdAt?: any;

};



export default function ClientMeasurements({

  clientId,

}: {

  clientId: string;

}) {


  const [measurements, setMeasurements] =
    useState<Measurement[]>([]);



  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [waist, setWaist] =
    useState("");

  const [chest, setChest] =
    useState("");

  const [arm, setArm] =
    useState("");



  const [loading, setLoading] =
    useState(false);






  useEffect(() => {

    loadMeasurements();

  }, [clientId]);







  async function loadMeasurements() {


    const snap =
      await getDocs(
        collection(
          db,
          "clients",
          clientId,
          "measurements"
        )
      );



    const data =
      snap.docs.map((item) => ({

        id: item.id,

        ...item.data(),

      })) as Measurement[];




    setMeasurements(
      data
    );


  }







  function number(value:string) {

    return Number(
      value.replace(",", ".")
    );

  }








  async function saveMeasurement() {


    if (!weight) {

      alert(
        "Upiši težinu"
      );

      return;

    }



    setLoading(true);



    await addDoc(

      collection(
        db,
        "clients",
        clientId,
        "measurements"
      ),

      {

        weight: number(weight),

        height: number(height),

        waist: number(waist),

        chest: number(chest),

        arm: number(arm),

        createdAt:
          serverTimestamp(),

      }

    );




    setWeight("");

    setHeight("");

    setWaist("");

    setChest("");

    setArm("");



    await loadMeasurements();



    setLoading(false);



    alert(
      "Mjerenje spremljeno ✅"
    );


  }








  async function removeMeasurement(

    id:string

  ) {


    await deleteDoc(

      doc(

        db,

        "clients",

        clientId,

        "measurements",

        id

      )

    );



    await loadMeasurements();


  }







  return (

    <div className="mt-6 rounded-xl border bg-white p-6">


      <h2 className="text-xl font-bold mb-4">

        📏 Mjerenja

      </h2>





      <div className="space-y-2">


        <input

          className="border p-2 w-full rounded"

          placeholder="Težina kg"

          value={weight}

          onChange={(e)=>
            setWeight(e.target.value)
          }

        />



        <input

          className="border p-2 w-full rounded"

          placeholder="Visina cm"

          value={height}

          onChange={(e)=>
            setHeight(e.target.value)
          }

        />



        <input

          className="border p-2 w-full rounded"

          placeholder="Struk cm"

          value={waist}

          onChange={(e)=>
            setWaist(e.target.value)
          }

        />



        <input

          className="border p-2 w-full rounded"

          placeholder="Prsa cm"

          value={chest}

          onChange={(e)=>
            setChest(e.target.value)
          }

        />



        <input

          className="border p-2 w-full rounded"

          placeholder="Ruka cm"

          value={arm}

          onChange={(e)=>
            setArm(e.target.value)
          }

        />




        <button

          disabled={loading}

          onClick={saveMeasurement}

          className="bg-black text-white px-5 py-2 rounded"

        >

          {loading
            ? "Spremanje..."
            : "Spremi mjerenje"
          }

        </button>



      </div>







      <hr className="my-6"/>







      {

        measurements.length === 0 ?


        (

          <p>

            Nema mjerenja.

          </p>

        )


        :


        (

          <div className="space-y-3">


            {
              measurements.map((m)=>(


                <div

                  key={m.id}

                  className="border rounded-lg p-4"

                >


                  <p>
                    ⚖️ {m.weight} kg
                  </p>


                  <p>
                    📏 {m.height} cm
                  </p>


                  <p>
                    📐 Struk {m.waist} cm
                  </p>


                  <button

                    onClick={()=>
                      removeMeasurement(m.id)
                    }

                    className="text-red-600 mt-2"

                  >

                    Obriši

                  </button>



                </div>


              ))

            }


          </div>

        )

      }



    </div>

  );


}