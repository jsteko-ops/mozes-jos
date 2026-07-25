"use client";

import { useEffect, useRef, useState } from "react";

import { saveClientReply } from "@/lib/services/klijentiService";


interface Checkin {

  id: string;

  weight?: number;

  energy?: number;

  sleep?: number;

  hunger?: number;

  water?: string;

  comment?: string;

  trainerComment?: string;

  clientReply?: string;

  createdAt?: any;

  reviewed?: boolean;

}



interface Props {

  checkins: Checkin[];

  selectedCheckin?: string | null;

  clientId?: string | null;

}




function formatDate(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleString("hr-HR");

}





export default function ClientCheckins({

  checkins,

  selectedCheckin,

  clientId

}: Props) {



  const selectedRef =
    useRef<HTMLDivElement | null>(null);



  const [replies,setReplies] =
    useState<Record<string,string>>({});



  const [savingReply,setSavingReply] =
    useState<string | null>(null);





  useEffect(()=>{


    if(
      selectedCheckin &&
      selectedRef.current
    ){

      selectedRef.current.scrollIntoView({

        behavior:"smooth",

        block:"center",

      });

    }


  },[selectedCheckin]);






  async function handleReply(
    checkinId:string
  ){


    if(!clientId) return;



    setSavingReply(checkinId);



    await saveClientReply(

      clientId,

      checkinId,

      replies[checkinId] || ""

    );



    setSavingReply(null);


  }






  if(checkins.length===0){

    return (

      <div className="border rounded-xl bg-white p-5">

        Nema poslanih check-inova.

      </div>

    );

  }






  return (

    <div className="space-y-5">


      <h2 className="text-xl font-bold">

        ✅ Moji Check-inovi

      </h2>





      {checkins.map((checkin)=>(



        <div


          key={checkin.id}


          ref={
            selectedCheckin === checkin.id
              ? selectedRef
              : null
          }


          className={`
            border rounded-xl bg-white p-5 space-y-4
            ${
              selectedCheckin === checkin.id
                ? "ring-4 ring-blue-400"
                : ""
            }
          `}


        >




          <p className="font-bold">

            📅 {formatDate(checkin.createdAt)}

          </p>





          <p>

            ⚖️ Težina:

            {" "}

            <b>

              {checkin.weight} kg

            </b>

          </p>





          <p>

            😊 Energija:

            {" "}

            {checkin.energy}/5

          </p>





          <p>

            😴 San:

            {" "}

            {checkin.sleep}/5

          </p>





          {checkin.comment && (

            <div className="bg-gray-50 rounded p-3">

              <b>
                Moj komentar:
              </b>

              <br />

              {checkin.comment}

            </div>

          )}






          {checkin.trainerComment && (

            <div className="border rounded p-3 bg-blue-50">


              <b>
                💬 Komentar trenera:
              </b>


              <br />


              {checkin.trainerComment}



            </div>

          )}






          {checkin.trainerComment && !checkin.clientReply && (

            <div className="space-y-2">


              <textarea

                className="w-full border rounded p-3"

                rows={3}

                placeholder="Odgovori treneru..."

                value={
                  replies[checkin.id] || ""
                }


                onChange={(e)=>


                  setReplies({

                    ...replies,

                    [checkin.id]:
                      e.target.value

                  })


                }

              />



              <button

                onClick={()=>
                  handleReply(checkin.id)
                }


                disabled={
                  savingReply === checkin.id
                }


                className="bg-blue-600 text-white px-4 py-2 rounded"


              >

                {
                  savingReply === checkin.id

                  ?

                  "Šaljem..."

                  :

                  "📨 Pošalji treneru"

                }


              </button>


            </div>

          )}







          {checkin.clientReply && (

            <div className="border rounded p-3 bg-green-50">


              <b>
                👤 Moj odgovor:
              </b>


              <br />


              {checkin.clientReply}


            </div>

          )}




          {!checkin.trainerComment && (

            <p className="text-orange-600">

              ⏳ Trener još nije odgovorio

            </p>

          )}




        </div>



      ))}



    </div>

  );

}