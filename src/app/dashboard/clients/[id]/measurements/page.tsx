"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";

import MeasurementForm from "@/components/measurements/MeasurementForm";
import MeasurementList from "@/components/measurements/MeasurementList";


export default function MeasurementsPage() {


  const params = useParams();

  const clientId =
    params.id as string;


  const [measurements,setMeasurements] =
    useState<any[]>([]);



  async function fetchMeasurements(){


    const snap =
      await getDocs(

        collection(
          db,
          "clients",
          clientId,
          "measurements"
        )

      );


    setMeasurements(

      snap.docs.map((d)=>({

        id:d.id,

        ...d.data(),

      }))

    );


  }




  useEffect(()=>{

    if(clientId){

      fetchMeasurements();

    }

  },[clientId]);




  return (

    <div className="space-y-6">


      <h1 className="text-2xl font-bold">
        📏 Mjerenja klijenta
      </h1>



      <MeasurementForm

        clientId={clientId}

        onCreated={fetchMeasurements}

      />



      <MeasurementList

        measurements={measurements}

      />



    </div>

  );

}