"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


type Measurement = {

  id:string;

  weight:number;

  height:number;

  waist:number;

  chest:number;

  arm:number;

  createdAt?:any;

};



export default function ClientMeasurementsView({

  clientId,

}:{

  clientId:string;

}){


  const [measurements,setMeasurements] =
    useState<Measurement[]>([]);



useEffect(()=>{


  const unsubscribe =
    onSnapshot(

      collection(
        db,
        "clients",
        clientId,
        "measurements"
      ),

      (snap)=>{


        const data =
          snap.docs.map(item=>({


            id:item.id,

            ...item.data(),


          })) as Measurement[];



        setMeasurements(data);


      }

    );


  return () => unsubscribe();


},[clientId]);




  return (

    <div className="border rounded-xl bg-white p-6">


      <h2 className="text-xl font-bold mb-4">
        📏 Moja mjerenja
      </h2>


      {
        measurements.length === 0

        ?

        <p>
          Nema spremljenih mjerenja.
        </p>

        :

        measurements.map((m)=>(

          <div
            key={m.id}
            className="border rounded-lg p-4 mb-3"
          >

            <p>
              ⚖️ Težina: {m.weight} kg
            </p>

            <p>
              📏 Visina: {m.height} cm
            </p>

            <p>
              📐 Struk: {m.waist} cm
            </p>

            <p>
              🫁 Prsa: {m.chest} cm
            </p>

            <p>
              💪 Ruka: {m.arm} cm
            </p>


          </div>

        ))

      }


    </div>

  );

}