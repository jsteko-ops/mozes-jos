"use client";

import { useState } from "react";


type Props = {

  onSendAction:
    (text:string)=>Promise<void>;

};



export default function ChatInput({

  onSendAction,

}: Props) {


  const [text,setText] =
    useState("");



  async function send(){


    if(!text.trim()) return;


    await onSendAction(text);


    setText("");

  }




  return (

    <div className="flex gap-3">


      <input

        className="border rounded-xl p-3 flex-1"

        placeholder="Napiši poruku..."

        value={text}

        onChange={(e)=>
          setText(e.target.value)
        }

        onKeyDown={(e)=>{

          if(e.key==="Enter"){

            send();

          }

        }}

      />


      <button

        className="bg-black text-white px-6 rounded-xl"

        onClick={send}

      >

        Pošalji

      </button>


    </div>

  );

}