"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  getClient,
  updateClient,
  addMeasurement,
  getMeasurements,
  addWorkout,
  getWorkouts,
} from "@/lib/services/klijentiService";


type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;
};


type Measurement = {
  id: string;
  weight: number;
  height: number;
  waist: number;
  chest: number;
  arm: number;
  createdAt?: any;
};


type Workout = {
  id: string;
  title: string;
  exercises: string;
};



export default function KlijentProfilPage() {


  const params = useParams();

  const id = params.id as string;



  const [client, setClient] =
    useState<Client | null>(null);


  const [measurements, setMeasurements] =
    useState<Measurement[]>([]);


  const [workouts, setWorkouts] =
    useState<Workout[]>([]);



  const [loading, setLoading] =
    useState(true);



  // EDIT KLIJENT

  const [editingClient,setEditingClient] =
    useState(false);


  const [editName,setEditName] =
    useState("");

  const [editEmail,setEditEmail] =
    useState("");

  const [editPhone,setEditPhone] =
    useState("");

  const [editNote,setEditNote] =
    useState("");




  // MJERENJA

  const [weight,setWeight] = useState("");
  const [height,setHeight] = useState("");
  const [waist,setWaist] = useState("");
  const [chest,setChest] = useState("");
  const [arm,setArm] = useState("");




  // TRENING

  const [workoutTitle,setWorkoutTitle] =
    useState("");

  const [exercises,setExercises] =
    useState("");





  async function loadData(){

    if(!id) return;


    const clientData =
      await getClient(id);


    setClient(
      clientData as Client
    );


    const measurementData =
      await getMeasurements(id);


    setMeasurements(
      measurementData as Measurement[]
    );


    const workoutData =
      await getWorkouts(id);


    setWorkouts(
      workoutData as Workout[]
    );


    setLoading(false);

  }




  useEffect(()=>{

    loadData();

  },[id]);







  async function saveClientChanges(){


    await updateClient(

      id,

      {
        name:editName,
        email:editEmail,
        phone:editPhone,
        note:editNote,
      }

    );


    setEditingClient(false);


    await loadData();


    alert("Podaci spremljeni ✅");

  }








  async function saveMeasurement(){


    await addMeasurement(

      id,

      {
        weight:Number(weight),
        height:Number(height),
        waist:Number(waist),
        chest:Number(chest),
        arm:Number(arm),
      }

    );


    setWeight("");
    setHeight("");
    setWaist("");
    setChest("");
    setArm("");


    await loadData();


    alert("Mjerenje spremljeno ✅");

  }







  async function saveWorkout(){


    await addWorkout(

      id,

      {
        title:workoutTitle,
        exercises,
      }

    );


    setWorkoutTitle("");
    setExercises("");


    await loadData();


    alert("Trening spremljen ✅");

  }








  return (

    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">



        <h1 className="text-3xl font-bold">
          Profil klijenta
        </h1>





        {loading && (

          <p>
            Učitavanje...
          </p>

        )}






        {client && (

          <>





<div className="border rounded-xl p-5">



{!editingClient && (

<>


<h2 className="text-2xl font-bold">
👤 {client.name}
</h2>


<p>
Email: {client.email}
</p>


<p>
Telefon: {client.phone}
</p>


<p>
Napomena: {client.note}
</p>



<button

onClick={()=>{

setEditName(client.name);
setEditEmail(client.email);
setEditPhone(client.phone);
setEditNote(client.note);

setEditingClient(true);

}}

className="mt-4 bg-black text-white px-4 py-2 rounded"

>
✏️ Uredi podatke
</button>



</>

)}





{editingClient && (

<div className="space-y-3">


<input
className="border p-2 w-full"
value={editName}
onChange={(e)=>setEditName(e.target.value)}
/>


<input
className="border p-2 w-full"
value={editEmail}
onChange={(e)=>setEditEmail(e.target.value)}
/>


<input
className="border p-2 w-full"
value={editPhone}
onChange={(e)=>setEditPhone(e.target.value)}
/>


<textarea
className="border p-2 w-full"
value={editNote}
onChange={(e)=>setEditNote(e.target.value)}
/>



<button

onClick={saveClientChanges}

className="bg-black text-white px-5 py-2 rounded"

>
Spremi promjene
</button>


</div>

)}



</div>








<div className="border rounded-xl p-5">

<h2 className="text-xl font-bold">
⚖️ Dodaj mjerenje
</h2>


<input className="border p-2 w-full mt-2"
placeholder="Težina"
value={weight}
onChange={(e)=>setWeight(e.target.value)}
/>


<input className="border p-2 w-full mt-2"
placeholder="Visina"
value={height}
onChange={(e)=>setHeight(e.target.value)}
/>


<input className="border p-2 w-full mt-2"
placeholder="Struk"
value={waist}
onChange={(e)=>setWaist(e.target.value)}
/>


<input className="border p-2 w-full mt-2"
placeholder="Prsa"
value={chest}
onChange={(e)=>setChest(e.target.value)}
/>


<input className="border p-2 w-full mt-2"
placeholder="Ruka"
value={arm}
onChange={(e)=>setArm(e.target.value)}
/>



<button
onClick={saveMeasurement}
className="bg-black text-white px-5 py-2 mt-3 rounded"
>
Spremi mjerenje
</button>


</div>









<div className="border rounded-xl p-5">

<h2 className="text-xl font-bold">
📋 Povijest mjerenja
</h2>


{measurements.map((m)=>(

<div
key={m.id}
className="border p-3 mt-3 rounded"
>

<p>
⚖️ {m.weight} kg
</p>

<p>
📏 {m.height} cm
</p>

</div>

))}


</div>









<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
🏋️ Dodaj trening plan
</h2>



<input
className="border p-2 w-full mt-2"
placeholder="Naziv plana"
value={workoutTitle}
onChange={(e)=>setWorkoutTitle(e.target.value)}
/>



<textarea
className="border p-2 w-full mt-2"
placeholder="Vježbe"
value={exercises}
onChange={(e)=>setExercises(e.target.value)}
/>



<button
onClick={saveWorkout}
className="bg-black text-white px-5 py-2 mt-3 rounded"
>
Spremi trening
</button>


</div>








<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
📋 Trening planovi
</h2>



{workouts.map((w)=>(

<div
key={w.id}
className="border p-3 mt-3 rounded"
>

<h3 className="font-bold">
{w.title}
</h3>


<p>
{w.exercises}
</p>


</div>

))}


</div>





          </>

        )}



      </div>


    </RoleGuard>

  );

}