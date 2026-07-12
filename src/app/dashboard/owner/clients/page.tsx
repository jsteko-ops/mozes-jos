"use client";

import { useEffect, useState } from "react";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";

import { getGymMembers } from "@/lib/getGymMembers";


export default function OwnerClientsPage() {

  const [clients, setClients] = useState<any[]>([]);


  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      async(user)=>{

        if(!user) return;


        const snap = await getDoc(
          doc(db,"users",user.uid)
        );


        const data = snap.data();


        if(data?.gymId){

          const members =
            await getGymMembers(data.gymId);


          const onlyClients =
            members.filter(
              (m)=>
              m.gymRole==="client"
            );


          setClients(
            onlyClients
          );

        }

      }
    );


    return ()=>unsub();


  },[]);



  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>

      <div className="p-6">


        <h1 className="text-3xl font-bold mb-6">
          👤 Moji klijenti
        </h1>



        {clients.length === 0 && (

          <p>
            Nema dodanih klijenata.
          </p>

        )}



        <div className="space-y-3">


          {clients.map((client)=>(


            <div
              key={client.uid}
              className="border rounded-xl bg-white p-4"
            >

              <h2 className="font-bold">
                {client.name}
              </h2>


              <p>
                {client.email}
              </p>


            </div>


          ))}



        </div>



      </div>


    </ProtectedRoute>

  );

}