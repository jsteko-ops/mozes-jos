"use client";

type Message = {
  id?: string;
  senderId: string;
  text: string;
  createdAt?: any;
};


type Props = {
  messages: Message[];
  currentUserId: string;
};


export default function ChatMessages({

  messages,

  currentUserId,

}: Props) {


  return (

    <div className="border rounded-xl bg-white p-4 h-[500px] overflow-y-auto space-y-3">


      {messages.length === 0 && (

        <p className="text-gray-500 text-center">

          Nema poruka.

        </p>

      )}



      {messages.map((message)=>(


        <div

          key={message.id}

          className={

            message.senderId === currentUserId

            ?

            "flex justify-end"

            :

            "flex justify-start"

          }

        >


          <div

            className={

              message.senderId === currentUserId

              ?

              "bg-black text-white rounded-xl px-4 py-2 max-w-[70%]"

              :

              "bg-gray-200 rounded-xl px-4 py-2 max-w-[70%]"

            }

          >

            {message.text}


          </div>


        </div>


      ))}


    </div>

  );

}