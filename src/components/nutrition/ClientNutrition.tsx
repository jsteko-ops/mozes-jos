"use client";

import NutritionForm from "./NutritionForm";
import NutritionList from "./NutritionList";

import { useState } from "react";


type Props = {
  clientId:string;
};


export default function ClientNutrition({

  clientId,

}:Props){


  const [refresh,setRefresh] =
    useState(false);



  return (

    <div className="space-y-6">


      <NutritionForm

        clientId={clientId}

        onSave={()=>{

          setRefresh(
            !refresh
          );

        }}

      />



      <NutritionList

        clientId={clientId}

        refresh={refresh}

      />


    </div>

  );

}