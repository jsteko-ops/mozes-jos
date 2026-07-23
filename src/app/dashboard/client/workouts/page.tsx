"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";


type Workout = {
  id:string;
  title:string;
  exercises:string;
};



export default function ClientWorkoutsPage(){


  const [clientId,setClientId] =
    useState<string | null>(null);


  const [workouts,setWorkouts] =
    useState<Workout[]>([]);


  const [loading,setLoading] =
    useState(true);



 useEffect(() => {

  const unsub =
    onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) {
          setLoading(false);
          return;
        }


        const clientSnap =
          await getDoc(
            doc(
              db,
              "clients",
              user.uid
            )
          );


        if (clientSnap.exists()) {


          const unsubscribeWorkouts =
            onSnapshot(
              collection(
                db,
                "clients",
                user.uid,
                "workouts"
              ),

              (snap) => {

                const data =
                  snap.docs.map(item => ({

                    id: item.id,
                    ...item.data()

                  })) as Workout[];


                setWorkouts(data);
                setLoading(false);

              }

            );


          return () => unsubscribeWorkouts();

        }


        setLoading(false);

      }
    );


  return () => unsub();


}, []);




  if(loading){

    return (
      <div className="p-6">
        Učitavanje...
      </div>
    );

  }



  return (

    <div className="p-6 space-y-6">


      <h1 className="text-3xl font-bold">
        💪 Moji treninzi
      </h1>



      {
        workouts.length === 0 ?

        (

          <div className="border rounded-xl p-5">

            Trener još nije dodijelio trening plan.

          </div>

        )


        :

        workouts.map((workout)=>(


          <div
            key={workout.id}
            className="border rounded-xl p-5 bg-white"
          >

            <h2 className="text-xl font-bold">
              {workout.title}
            </h2>


            <p className="mt-3 whitespace-pre-line">
              {workout.exercises}
            </p>


          </div>


        ))

      }


    </div>

  );

}