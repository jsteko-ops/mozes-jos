"use client";

import { useEffect, useState } from "react";

import {
  getNutritionPlans,
  deleteNutritionPlan,
} from "@/lib/services/klijentiService";



type NutritionPlan = {

  id:string;

  title:string;

  meals:string;

  createdAt?:any;

};



type Props = {

  clientId:string;

  refresh?:boolean;

};




function formatDate(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleDateString("hr-HR");

}





export default function NutritionList({

  clientId,

  refresh,

}:Props){



  const [plans,setPlans] =
    useState<NutritionPlan[]>([]);



  async function load(){


    const data =
      await getNutritionPlans(
        clientId
      );


    setPlans(
      data as NutritionPlan[]
    );

  }




  useEffect(()=>{

    load();

  },[
    clientId,
    refresh
  ]);






  async function remove(
    id:string
  ){


    if(
      !confirm(
        "Obrisati plan prehrane?"
      )
    ){

      return;

    }



    await deleteNutritionPlan(

      clientId,

      id

    );



    load();


  }







  return (

    <div className="border rounded-xl bg-white p-6 space-y-5">


      <h2 className="text-xl font-bold">

        📋 Planovi prehrane

      </h2>




      {
        plans.length === 0

        ?

        <p>
          Nema spremljenih planova prehrane.
        </p>


        :


        plans.map((plan)=>(


          <div

            key={plan.id}

            className="border rounded-xl p-5 space-y-3"

          >


            <div className="flex justify-between">

              <h3 className="font-bold text-lg">

                🥗 {plan.title}

              </h3>


              <span className="text-sm text-gray-500">

                {formatDate(plan.createdAt)}

              </span>


            </div>




            <div className="whitespace-pre-line">

              {plan.meals}

            </div>





            <button

              className="bg-red-600 text-white px-4 py-2 rounded"

              onClick={()=>
                remove(plan.id)
              }

            >

              🗑 Obriši

            </button>



          </div>


        ))


      }


    </div>

  );

}