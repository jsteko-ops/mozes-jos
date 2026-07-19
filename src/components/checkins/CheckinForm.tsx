"use client";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useState,
} from "react";

import { db } from "@/lib/firebase";

import {
  createNotification,
} from "@/lib/notifications";


type Props = {
  clientId?: string;
  onSaveAction?: () => void | Promise<void>;
};


export default function CheckinForm({
  clientId,
  onSaveAction,
}: Props) {

  const [weight,setWeight] =
    useState("");

  const [energy,setEnergy] =
    useState("");

  const [sleep,setSleep] =
    useState("");

  const [hunger,setHunger] =
    useState("");

  const [water,setWater] =
    useState("");

  const [comment,setComment] =
    useState("");



  function toNumber(value:string){

    return Number(
      value.replace(",", ".")
    );

  }



  async function saveCheckin(){


    if(!clientId){


const weightValue = toNumber(weight);

if (isNaN(weightValue) || weightValue < 20 || weightValue > 400) {
  alert("Težina mora biti između 20 i 400 kg.");
  return;
}

if (!energy || !sleep || !hunger) {
  alert("Odaberi energiju, san i glad.");
  return;
}

      alert(
        "Nema klijenta"
      );

      return;

    }


    const clientSnap =
      await getDoc(
        doc(
          db,
          "clients",
          clientId
        )
      );


    if(!clientSnap.exists()){

      alert(
        "Klijent ne postoji"
      );

      return;

    }


    const client =
      clientSnap.data();

      const weightValue = toNumber(weight);

if (isNaN(weightValue)) {
  alert("Unesi ispravnu težinu.");
  return;
}

if (weightValue < 20 || weightValue > 400) {
  alert("Težina mora biti između 20 i 400 kg.");
  return;
}

if (!energy || !sleep || !hunger) {
  alert("Odaberi energiju, san i glad.");
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
  weightValue,

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
        // OBAVIJEST TRENERU

    if(client.trainerId){

     await createNotification(

  client.trainerId,

  {

    title:
      "Novi check-in",

    message:
      `${client.name || "Klijent"} je poslao novi check-in.`,

    type:
      "checkin",

    link:
  `/dashboard/trainer/klijenti/${clientId}?tab=checkin`,

  }

);

    }



    alert(
      "Check-in spremljen ✅"
    );



    setWeight("");

    setEnergy("");

    setSleep("");

    setHunger("");

    setWater("");

    setComment("");



    await onSaveAction?.();


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




      <select
  className="border p-2 rounded w-full"
  value={energy}
  onChange={(e) => setEnergy(e.target.value)}
>
  <option value="">Odaberi energiju</option>
  <option value="1">1 - Vrlo loše</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5 - Odlično</option>
</select>



<select
  className="border p-2 rounded w-full"
  value={sleep}
  onChange={(e) => setSleep(e.target.value)}
>
  <option value="">Odaberi kvalitetu sna</option>
  <option value="1">1 - Vrlo loše</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5 - Odlično</option>
</select>




     <select
  className="border p-2 rounded w-full"
  value={hunger}
  onChange={(e) => setHunger(e.target.value)}
>
  <option value="">Odaberi razinu gladi</option>
  <option value="1">1 - Nisam gladan</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5 - Jako gladan</option>
</select>




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