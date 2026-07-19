"use client";

import { useEffect, useState } from "react";

import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import {
  getOrCreateChat,
  sendMessage,
  listenMessages,
} from "@/lib/services/chat/chatService";


type Props = {
  trainerId: string;
  clientId: string;
  currentUserId: string;
};


export default function ChatWindow({

  trainerId,
  clientId,
  currentUserId,

}: Props) {


  const [chatId, setChatId] =
    useState("");

  const [messages, setMessages] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);



  useEffect(()=>{


    let unsubscribe: any;



    async function loadChat(){


      const id =
        await getOrCreateChat(

          trainerId,

          clientId

        );


      setChatId(id);



      unsubscribe =
        listenMessages(

          id,

          (data)=>{


            setMessages(data);

            setLoading(false);


          }

        );


    }



    loadChat();



    return ()=>{


      if(unsubscribe){

        unsubscribe();

      }


    };


  },[
    trainerId,
    clientId
  ]);





  async function handleSend(

    text:string

  ){


    if(!chatId) return;



    await sendMessage(

      chatId,

      currentUserId,

      text

    );


  }






  if(loading){


    return (

      <div className="border rounded-xl bg-white p-6">

        Učitavanje razgovora...

      </div>

    );


  }







  return (

    <div className="space-y-4">


      <ChatMessages

        messages={messages}

        currentUserId={currentUserId}

      />



      <ChatInput

        onSendAction={handleSend}

      />


    </div>

  );


}