"use client";

import { useState } from "react";

import {
  addNutritionPlan,
} from "@/lib/services/klijentiService";



type Props = {

  clientId:string;

  onSave?:()=>void;

};




export default function NutritionForm({

  clientId,

  onSave,

}:Props){



  const [title,setTitle] =
    useState("");

  const [meals,setMeals] =
    useState("");




  async function save(){


    if(!title || !meals){

      alert(
        "Upiši naziv plana i obroke"
      );

      return;

    }




    await addNutritionPlan(

      clientId,

      {
        title,
        meals,
      }

    );




    setTitle("");

    setMeals("");



    alert(
      "Plan prehrane spremljen ✅"
    );



    onSave?.();


  }







  return (

    <div className="border rounded-xl bg-white p-6 space-y-4">


      <h2 className="text-xl font-bold">

        🥗 Dodaj plan prehrane

      </h2>




      <input

        className="border p-2 rounded w-full"

        placeholder="Naziv plana (npr. Masa, Definicija)"

        value={title}

        onChange={(e)=>
          setTitle(e.target.value)
        }

      />





      <textarea

        className="border p-2 rounded w-full min-h-40"

        placeholder="Obroci..."

        value={meals}

        onChange={(e)=>
          setMeals(e.target.value)
        }

      />





      <button

        className="bg-black text-white px-5 py-2 rounded"

        onClick={save}

      >

        Spremi prehranu

      </button>



    </div>

  );

}