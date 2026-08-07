"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";



type Plan = {

  id: string;

  title: string;

  exercises: string;

  createdAt?: any;

};





export default function ClientPlans({

  clientId,

}: {

  clientId: string;

}) {



  const [plans, setPlans] =
    useState<Plan[]>([]);



  const [title, setTitle] =
    useState("");



  const [exercises, setExercises] =
    useState("");



  const [loading, setLoading] =
    useState(false);




const [editingPlanId, setEditingPlanId] =
  useState<string | null>(null);



  useEffect(() => {

    loadPlans();

  }, [clientId]);









  async function loadPlans() {


    const snap =
      await getDocs(

        collection(

          db,

          "clients",

          clientId,

          "workouts"

        )

      );




    const data =
      snap.docs.map((item)=>({


        id:item.id,


        ...item.data(),


      })) as Plan[];




    setPlans(data);


  }




async function savePlan() {
  if (!title.trim()) {
    alert("Upiši naziv plana");
    return;
  }

  try {
    setLoading(true);

    if (editingPlanId) {
      await updateDoc(
        doc(
          db,
          "clients",
          clientId,
          "workouts",
          editingPlanId
        ),
        {
          title: title.trim(),
          exercises,
          updatedAt: serverTimestamp(),
        }
      );

      setEditingPlanId(null);
    } else {
      await addDoc(
        collection(
          db,
          "clients",
          clientId,
          "workouts"
        ),
        {
          title: title.trim(),
          exercises,
          createdAt: serverTimestamp(),
        }
      );
    }

    setTitle("");
    setExercises("");

    await loadPlans();

    alert("Trening plan spremljen ✅");
  } catch (error) {
    console.error(
      "Greška kod spremanja plana:",
      error
    );

    alert("Plan se nije mogao spremiti.");
  } finally {
    setLoading(false);
  }
}


function editPlan(plan: Plan) {
  setEditingPlanId(plan.id);
  setTitle(plan.title);
  setExercises(plan.exercises);
}



  async function removePlan(

    id:string

  ) {



    await deleteDoc(

      doc(

        db,

        "clients",

        clientId,

        "workouts",

        id

      )

    );



    await loadPlans();


  }









  return (

    <div className="mt-6 rounded-xl border bg-white p-6">


      <h2 className="text-xl font-bold mb-4">

        🏋️ Trening planovi

      </h2>





      <div className="space-y-3">


        <input

          className="border p-2 w-full rounded"

          placeholder="Naziv plana (npr. Masa, Definicija)"

          value={title}

          onChange={(e)=>
            setTitle(e.target.value)
          }

        />




        <textarea

          className="border p-2 w-full rounded"

          placeholder="Vježbe..."

          rows={6}

          value={exercises}

          onChange={(e)=>
            setExercises(e.target.value)
          }

        />




        <button

          onClick={savePlan}

          disabled={loading}

          className="bg-black text-white px-5 py-2 rounded"

        >

       {loading
  ? "Spremanje..."
  : editingPlanId
    ? "Spremi promjene"
    : "Spremi plan"
}


        </button>



      </div>







      <hr className="my-6"/>







      {
        plans.length === 0 ?


        (

          <p>

            Nema trening planova.

          </p>


        )


        :


        (

          <div className="space-y-3">


            {
              plans.map((plan)=>(


                <div

                  key={plan.id}

                  className="border rounded-lg p-4"


                >



                  <h3 className="font-bold text-lg">

                    {plan.title}

                  </h3>




                  <p className="whitespace-pre-line mt-2">

                    {plan.exercises}

                  </p>





               <div className="flex gap-4 mt-3">
  <button
    onClick={() => editPlan(plan)}
    className="text-blue-600"
  >
    ✏️ Uredi
  </button>

  <button
    onClick={() => removePlan(plan.id)}
    className="text-red-600"
  >
    🗑 Obriši
  </button>
</div>




                </div>


              ))

            }


          </div>


        )

      }



    </div>

  );


}