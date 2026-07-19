"use client";

import { useEffect, useState } from "react";

import {
  listenClientChats,
  markChatRead,
} from "@/lib/services/chat/chatService";




type Chat = {
  id:string;
  trainerId:string;
  clientId:string;
  lastMessage?:string;
  unreadForClient?:boolean;
};


type Props = {
  clientId:string;
  onSelectChat:(trainerId:string)=>void;
};


export default function ClientChatInbox({

  clientId,
  onSelectChat,

}:Props){


  const [chats,setChats] =
    useState<Chat[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [trainerNames,setTrainerNames] =
    useState<Record<string,string>>({});



  useEffect(()=>{


    const unsubscribe =
      listenClientChats(

        clientId,

        async(data)=>{


          setChats(
            data as Chat[]
          );


          setLoading(false);


        }

      );


    return ()=>{

      unsubscribe();

    };


  },[clientId]);





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



      {chats.map((chat)=>(


        <button

          key={chat.id}

          onClick={async()=>{


            await markChatRead(

              chat.id,

              "client"

            );


            onSelectChat(

              chat.trainerId

            );


          }}


          className="
          w-full
          text-left
          border
          rounded-xl
          p-4
          hover:bg-gray-50
          "


        >


          <div className="font-semibold flex gap-2">


            {
              chat.unreadForClient && (
                <span>
                  🔴
                </span>
              )
            }


            Trener


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