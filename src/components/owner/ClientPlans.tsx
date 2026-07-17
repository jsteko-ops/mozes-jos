"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
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


    if (!title) {


      alert(
        "Upiši naziv plana"
      );


      return;


    }




    setLoading(true);




    await addDoc(

      collection(

        db,

        "clients",

        clientId,

        "workouts"

      ),

      {


        title,


        exercises,


        createdAt:
          serverTimestamp(),


      }

    );





    setTitle("");

    setExercises("");




    await loadPlans();




    setLoading(false);




    alert(
      "Trening plan spremljen ✅"
    );


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





                  <button

                    onClick={()=>
                      removePlan(plan.id)
                    }

                    className="text-red-600 mt-3"

                  >

                    🗑 Obriši

                  </button>




                </div>


              ))

            }


          </div>


        )

      }



    </div>

  );


}