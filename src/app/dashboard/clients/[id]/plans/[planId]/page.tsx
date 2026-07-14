"use client";

import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import Card from "@/components/ui/Card";

import ExerciseForm from "@/components/plans/ExerciseForm";
import ExerciseItem from "@/components/plans/ExerciseItem";



type Plan = {
  id: string;
  name: string;
  description?: string;
};



type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest?: number;
};





export default function PlanDetailPage() {


  const { user, loading } = useAuth();

  const params = useParams();


  const clientId = params.id as string;

  const planId = params.planId as string;



  const [plan, setPlan] =
    useState<Plan | null>(null);


  const [exercises, setExercises] =
    useState<Exercise[]>([]);





  const fetchData = async () => {


    if (!clientId || !planId) return;



    // PLAN

   const planRef = doc(
  db,
  "clients",
  clientId,
  "workouts",
  planId
);



    const planSnap = await getDoc(planRef);



    if (planSnap.exists()) {


      setPlan({

        id: planSnap.id,

        ...planSnap.data(),

      } as Plan);


    }





    // VJEŽBE

   const exerciseRef = collection(
  db,
  "clients",
  clientId,
  "workouts",
  planId,
  "exercises"
);



    const exerciseSnap =
      await getDocs(exerciseRef);



    setExercises(

      exerciseSnap.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      })) as Exercise[]

    );


  };






  useEffect(() => {


    if (!loading && user) {

      fetchData();

    }


  }, [
    user,
    loading,
    clientId,
    planId
  ]);






  if (loading) {

    return (
      <p>
        Loading...
      </p>
    );

  }





  if (!plan) {

    return (
      <p>
        Plan ne postoji
      </p>
    );

  }





  return (

    <div className="space-y-6">


      <Card>

        <h1 className="text-2xl font-bold">
          {plan.name}
        </h1>


        <p className="text-gray-600 mt-2">
          {plan.description || "Bez opisa"}
        </p>


      </Card>





      <ExerciseForm

        clientId={clientId}

        planId={planId}

        onCreated={fetchData}

      />






      <div className="space-y-4">


        <h2 className="text-xl font-semibold">
          Vježbe
        </h2>




        {exercises.length === 0 ? (


          <Card>

            <p className="text-gray-500">
              Nema dodanih vježbi.
            </p>


          </Card>



        ) : (


          exercises.map((exercise) => (


            <ExerciseItem

              key={exercise.id}

              exercise={exercise}

            />


          ))


        )}




      </div>



    </div>

  );

}