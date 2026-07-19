"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import ChatWindow from "@/components/chat/ChatWindow";
import ChatClientSelect from "@/components/chat/ChatClientSelect";

import {
  getClients,
  getClientByUserId,
} from "@/lib/services/klijentiService";


export default function ChatPage() {


  const {
    user,
    userProfile,
  } = useAuth();



  const [clients,setClients] =
    useState<any[]>([]);



  const [clientId,setClientId] =
    useState("");



  const [trainerId,setTrainerId] =
    useState("");



  const [loading,setLoading] =
    useState(true);




  useEffect(()=>{


    async function load(){


      if(!user || !userProfile)
        return;



      // ===================
      // TRAINER
      // ===================

      if(userProfile.role === "trainer"){


        const data =
          await getClients(
            user.uid
          );


        setClients(data);


        setTrainerId(
          user.uid
        );


      }



      // ===================
      // CLIENT
      // ===================

      if(userProfile.role === "client"){


const client: any =
         await getClientByUserId(
            user.uid
          );



  if(client){

 


  setClientId(
    client.id
  );


  setTrainerId(
    client.trainerId
  );

}

      }



      setLoading(false);


    }


    load();


  },[user,userProfile]);






  return (

    <RoleGuard allowedRoles={[
      "trainer",
      "client"
    ]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">

          💬 Chat

        </h1>




        {loading && (

          <p>
            Učitavanje...
          </p>

        )}






        {userProfile?.role === "trainer" && (

          <ChatClientSelect

            clients={clients}

            value={clientId}

            onChange={setClientId}

          />

        )}






        {clientId && trainerId && user && (

          <ChatWindow

            trainerId={trainerId}

            clientId={clientId}

            currentUserId={user.uid}

          />

        )}




      </div>


    </RoleGuard>

  );

}