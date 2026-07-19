"use client";

import { useEffect, useState } from "react";

import {
  getTrainerChats,
} from "@/lib/services/chat/chatService";

import {
  getClient,
} from "@/lib/services/klijentiService";


type Chat = {
  id: string;
  clientId: string;
  trainerId: string;
  lastMessage?: string;
  updatedAt?: any;
};


type Props = {
  trainerId: string;
  onSelectChat: (
    clientId: string
  ) => void;
};


export default function ChatInbox({
  trainerId,
  onSelectChat,
}: Props) {


  const [chats, setChats] =
    useState<Chat[]>([]);

const [clientNames, setClientNames] =
    useState<Record<string,string>>({});


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function loadChats(){


      const data =
        await getTrainerChats(
          trainerId
        );


      setChats(
        data as Chat[]
      );

const names:any = {};


for(const chat of data){

  const client =
    await getClient(
      chat.clientId
    );


  if(client){

    names[chat.clientId] =
      client.name;

  }

}


setClientNames(names);

      setLoading(false);

    }


    loadChats();


  },[trainerId]);




  if(loading){

    return (
      <div className="border rounded-xl p-4">
        Učitavanje poruka...
      </div>
    );

  }





  return (

    <div className="space-y-3">


      <h2 className="text-xl font-bold">
        💬 Poruke
      </h2>



      {chats.length === 0 && (

        <div className="border rounded-xl p-4 text-gray-500">

          Nema razgovora

        </div>

      )}





      {chats.map((chat)=>(


        <button

          key={chat.id}

          onClick={()=>
            onSelectChat(
              chat.clientId
            )
          }

          className="
            w-full
            text-left
            border
            rounded-xl
            p-4
            hover:bg-gray-50
          "

        >


        <div className="font-semibold">

  {clientNames[chat.clientId] ??
    "Klijent"}

</div>


          <div className="text-sm text-gray-600">

            {chat.lastMessage ??
              "Nema poruke"}

          </div>


        </button>


      ))}


    </div>

  );

}