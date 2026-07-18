"use client";

import {
  useEffect,
  useState,
} from "react";


import {
  getNutritionPlans,
} from "@/lib/services/klijentiService";



type Plan = {

  id:string;

  title:string;

  meals:string;

};




type Props = {

  clientId:string;

};





export default function ClientNutrition({

  clientId,

}:Props){


  const [plans,setPlans] =
    useState<Plan[]>([]);




  async function load(){


    const data =
      await getNutritionPlans(
        clientId
      );


    setPlans(
      data as Plan[]
    );

  }





  useEffect(()=>{

    load();

  },[clientId]);






  return (

    <div className="border rounded-xl bg-white p-5 space-y-5">


      <h2 className="text-xl font-bold">

        🥗 Moja prehrana

      </h2>




      {
        plans.length===0

        ?

        <p>
          Trener još nije dodao plan prehrane.
        </p>


        :


        plans.map((plan)=>(


          <div

            key={plan.id}

            className="border rounded-xl p-4"

          >

            <h3 className="font-bold text-lg">

              🥗 {plan.title}

            </h3>


            <p className="whitespace-pre-line mt-3">

              {plan.meals}

            </p>


          </div>


        ))


      }


    </div>

  );


}