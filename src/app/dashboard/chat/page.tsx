"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import ChatWindow from "@/components/chat/ChatWindow";


import ChatInbox from "@/components/chat/ChatInbox";
import ClientChatInbox from "@/components/chat/ClientChatInbox";

import {
  getClientByUserId,
} from "@/lib/services/klijentiService";


export default function ChatPage() {


  const {
    user,
    userProfile,
  } = useAuth();







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

  <ChatInbox

    trainerId={user.uid}

    onSelectChat={(id)=>{

      setClientId(id);

    }}

  />

)}

{userProfile?.role === "client" && clientId && (

  <ClientChatInbox

    clientId={clientId}

    onSelectChat={(id)=>{

      setTrainerId(id);

    }}

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