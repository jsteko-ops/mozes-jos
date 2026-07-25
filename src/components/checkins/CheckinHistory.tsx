"use client";

import { useEffect, useState } from "react";

import {
  markCheckinReviewed,
  saveTrainerComment,
} from "@/lib/services/klijentiService";


interface Checkin {

  id: string;

  weight: number;

  energy: number;

  sleep: number;

  hunger: number;

  water: string;

  comment: string;

  createdAt?: any;

  reviewed?: boolean;

  trainerComment?: string;

  clientReply?: string;

}



interface CheckinHistoryProps {

  checkins: Checkin[];

  clientId: string;

  onReviewed: () => void;
targetCheckinId?: string | null;

}



function formatDate(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);



  return date.toLocaleString(
    "hr-HR",
    {
      day:"2-digit",
      month:"2-digit",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit",
    }
  );

}




export default function CheckinHistory({

  checkins,

  clientId,

  onReviewed,

  targetCheckinId,

}:CheckinHistoryProps){

const [highlightedCheckin, setHighlightedCheckin] =
  useState<string | null>(null);

  const [comments,setComments] =
    useState<Record<string,string>>({});



  const [saving,setSaving] =
    useState<string | null>(null);



  const [editing,setEditing] =
    useState<string | null>(null);




  async function handleReviewed(
    checkinId:string
  ){


    await markCheckinReviewed(
      clientId,
      checkinId
    );


    onReviewed();

  }
  async function handleSaveComment(
    checkinId:string
  ){


    setSaving(checkinId);



    await saveTrainerComment(
      clientId,
      checkinId,
      comments[checkinId] || ""
    );



    setSaving(null);

    setEditing(null);


    onReviewed();


  }


useEffect(()=>{

  if(!targetCheckinId) return;


  const element =
    document.getElementById(targetCheckinId);


  if(element){

    element.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });


    setHighlightedCheckin(targetCheckinId);


    const timer =
      setTimeout(()=>{

        setHighlightedCheckin(null);

      },10000);


    return ()=>clearTimeout(timer);

  }


},[targetCheckinId,checkins]);
  


  const sortedCheckins =
    [...checkins].sort(
      (a:any,b:any)=>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );






  return (

    <div className="border rounded-xl bg-white p-5 space-y-5">



      <div className="flex justify-between items-center">


        <h2 className="text-xl font-bold">

          📋 Povijest Check-inova

        </h2>



        <span className="text-sm text-gray-500">

          Ukupno: {checkins.length}

        </span>


      </div>





      {checkins.length === 0 && (

        <p>
          Nema spremljenih check-inova.
        </p>

      )}






      <div className="space-y-4">


       {sortedCheckins.map((checkin)=>(


 <div

 id={checkin.id}
  key={checkin.id}



  className={`
    border
    rounded-xl
    p-5
    space-y-4
    transition-all
    duration-500

    ${
  highlightedCheckin === checkin.id
  ?
  "bg-yellow-100 ring-2 ring-yellow-400"
  :
  !checkin.reviewed
  ?
  "bg-orange-50 border-orange-300"
  :
  ""
}
  `}

>





            <div className="flex justify-between items-start">


              <b>

                📅 {formatDate(checkin.createdAt)}

              </b>




              {checkin.reviewed ? (

                <span className="text-green-600 font-bold">

                  ✅ Pregledano

                </span>


              ) : (


                <span className="text-orange-600 font-bold">

                  ⏳ Čeka pregled

                </span>


              )}



            </div>







            <div className="grid md:grid-cols-2 gap-3">


              <p>

                ⚖️ Težina:

                {" "}

                <b>

                  {String(checkin.weight).replace(".", ",")} kg

                </b>

              </p>





              <p>

                ⚡ Energija:

                {" "}

                <b>

                  {checkin.energy}/5

                </b>

              </p>





              <p>

                😴 San:

                {" "}

                <b>

                  {checkin.sleep}/5

                </b>

              </p>





              <p>

                🍽 Glad:

                {" "}

                <b>

                  {checkin.hunger}/5

                </b>

              </p>





              <p>

                💧 Voda:

                {" "}

                <b>

                  {checkin.water}

                </b>

              </p>


            </div>





            {checkin.comment && (

              <div className="rounded bg-gray-100 p-3">


                <b>

                  Komentar klijenta

                </b>



                <p className="mt-2">

                  💬 {checkin.comment}

                </p>


              </div>

            )}






            <div className="rounded bg-blue-50 p-3">


              <b>

                💬 Komentar trenera

              </b>
              {checkin.trainerComment && editing !== checkin.id ? (

                <>

                  <p className="mt-2 whitespace-pre-wrap">

                    {checkin.trainerComment}

                  </p>



                  <button

                    className="mt-3 text-blue-600 underline"

                    onClick={()=>{

                      setComments({

                        ...comments,

                        [checkin.id]:
                          checkin.trainerComment || ""

                      });


                      setEditing(checkin.id);


                    }}

                  >

                    ✏️ Uredi komentar

                  </button>


                </>


              ) : (


                <textarea

                  className="mt-3 w-full border rounded p-2"

                  rows={4}

                  placeholder="Napiši komentar klijentu..."

                  value={
                    comments[checkin.id] || ""
                  }


                  onChange={(e)=>

                    setComments({

                      ...comments,

                      [checkin.id]:
                        e.target.value

                    })

                  }


                />


              )}



            </div>






            {(!checkin.trainerComment || editing === checkin.id) && (


              <button

                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"

                disabled={
                  saving === checkin.id
                }


                onClick={()=> 
                  handleSaveComment(
                    checkin.id
                  )
                }


              >

                {

                  saving === checkin.id

                  ?

                  "Spremam..."

                  :

                  "💬 Spremi komentar"

                }


              </button>


            )}







            {checkin.clientReply && (


              <div className="rounded bg-green-50 p-3">


                <b>

                  👤 Odgovor klijenta

                </b>


                <p className="mt-2 whitespace-pre-wrap">

                  {checkin.clientReply}

                </p>


              </div>


            )}







            {!checkin.reviewed && (


              <button


                className="bg-black text-white px-4 px-2 py-2 rounded hover:bg-gray-800"


                onClick={()=>


                  handleReviewed(
                    checkin.id
                  )

                }


              >

                ✅ Označi pregledano

              </button>


            )}





          </div>


        ))}


      </div>



    </div>


  );


}