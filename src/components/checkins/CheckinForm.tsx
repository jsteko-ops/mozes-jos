"use client";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  useState,
} from "react";

import { db } from "@/lib/firebase";


type Props = {
  clientId?: string;
  onSave?: () => void;
};


export default function CheckinForm({
  clientId,
  onSave,
}: Props) {


  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState("");
  const [sleep, setSleep] = useState("");
  const [hunger, setHunger] = useState("");
  const [water, setWater] = useState("");
  const [comment, setComment] = useState("");



  function toNumber(value:string){

    return Number(
      value.replace(",", ".")
    );

  }




  async function saveCheckin(){


    if(!clientId){

      alert("Odaberi klijenta");

      return;

    }



    await addDoc(

      collection(
        db,
        "clients",
        clientId,
        "checkins"
      ),

      {

        weight:
          toNumber(weight),


        energy:
          Number(energy),


        sleep:
          Number(sleep),


        hunger:
          Number(hunger),


        water,


        comment,


        reviewed:false,


        createdAt:
          serverTimestamp(),

      }

    );



    alert(
      "Check-in spremljen ✅"
    );



    setWeight("");
    setEnergy("");
    setSleep("");
    setHunger("");
    setWater("");
    setComment("");



    onSave?.();


  }




  return (

    <div className="border rounded-xl bg-white p-6 space-y-3">


      <h2 className="text-xl font-bold">
        ✅ Novi Check-in
      </h2>




      <input
        className="border p-2 rounded w-full"
        placeholder="Težina kg"
        value={weight}
        onChange={(e)=>
          setWeight(e.target.value)
        }
      />



      <input
        className="border p-2 rounded w-full"
        placeholder="Energija 1-5"
        type="number"
        value={energy}
        onChange={(e)=>
          setEnergy(e.target.value)
        }
      />



      <input
        className="border p-2 rounded w-full"
        placeholder="San 1-5"
        type="number"
        value={sleep}
        onChange={(e)=>
          setSleep(e.target.value)
        }
      />



      <input
        className="border p-2 rounded w-full"
        placeholder="Glad 1-5"
        type="number"
        value={hunger}
        onChange={(e)=>
          setHunger(e.target.value)
        }
      />



      <input
        className="border p-2 rounded w-full"
        placeholder="Voda"
        value={water}
        onChange={(e)=>
          setWater(e.target.value)
        }
      />



      <textarea
        className="border p-2 rounded w-full"
        placeholder="Komentar"
        value={comment}
        onChange={(e)=>
          setComment(e.target.value)
        }
      />



      <button

        className="bg-black text-white px-5 py-2 rounded"

        onClick={saveCheckin}

      >

        Spremi check-in

      </button>



    </div>

  );

}