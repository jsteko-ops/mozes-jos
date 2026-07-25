"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useRouter,
} from "next/navigation";



type Notification = {

  id:string;

  title:string;

  message:string;

  read:boolean;

  link?:string;

  type?:string;

  createdAt?:any;

};



function formatDate(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);



  return date.toLocaleString(
    "hr-HR"
  );

}





function formatNotificationTime(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);



  const now =
    new Date();



  const diff =
    Math.floor(
      (
        now.getTime()
        -
        date.getTime()
      )
      /
      1000
    );



  if(diff < 60){

    return "Upravo sada";

  }



  if(diff < 3600){

    return `Prije ${Math.floor(diff / 60)} min`;

  }



  const isToday =
    date.toDateString()
    ===
    now.toDateString();



  if(isToday){

    return `Danas u ${
      date.toLocaleTimeString(
        "hr-HR",
        {
          hour:"2-digit",
          minute:"2-digit",
        }
      )
    }`;

  }



  const yesterday =
    new Date();


  yesterday.setDate(
    now.getDate() - 1
  );



  if(
    date.toDateString()
    ===
    yesterday.toDateString()
  ){

    return `Jučer u ${
      date.toLocaleTimeString(
        "hr-HR",
        {
          hour:"2-digit",
          minute:"2-digit",
        }
      )
    }`;

  }



  return date.toLocaleString(
    "hr-HR"
  );

}





function notificationIcon(
  type?:string
){

  switch(type){

    case "checkin":
      return "📋";


    case "chat":
      return "💬";


    case "plan":
      return "🏋️";


    default:
      return "🔔";

  }

}






export default function NotificationsPage(){


  const router =
    useRouter();



  const [
    notifications,
    setNotifications
  ] =
    useState<Notification[]>([]);



  const [
    userId,
    setUserId
  ] =
    useState<string | null>(null);



  const [
    filter,
    setFilter
  ] =
    useState<
      "all" | "new" | "read"
    >("all");

  useEffect(()=>{


    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user)=>{


          if(user){

            setUserId(
              user.uid
            );

          }


        }
      );



    return ()=>unsubscribe();


  },[]);






  useEffect(()=>{


    if(!userId) return;



    const q =
      query(

        collection(
          db,
          "notifications"
        ),


        where(
          "userId",
          "==",
          userId
        ),


        orderBy(
          "createdAt",
          "desc"
        )

      );



    const unsubscribe =
      onSnapshot(
        q,
        (snapshot)=>{


          const data =
            snapshot.docs.map(
              (doc)=>({

                id:
                  doc.id,

                ...doc.data(),

              } as Notification)

            );



          setNotifications(
            data
          );


        }

      );



    return ()=>unsubscribe();



  },[userId]);







  async function markAllRead(){


    if(!userId) return;



    const batch =
      writeBatch(db);



    notifications.forEach(
      (n)=>{


        if(!n.read){


          batch.update(

            doc(
              db,
              "notifications",
              n.id
            ),

            {
              read:true,
            }

          );


        }


      }

    );



    await batch.commit();


  }







  async function deleteNotification(
    id:string
  ){


    await deleteDoc(

      doc(
        db,
        "notifications",
        id
      )

    );


  }







  async function deleteReadNotifications(){


    const read =
      notifications.filter(
        (n)=>n.read
      );



    for(
      const n of read
    ){

      await deleteDoc(

        doc(
          db,
          "notifications",
          n.id
        )

      );

    }


  }








  const filteredNotifications =
    notifications.filter(
      (n)=>{


        if(
          filter === "new"
        ){

          return !n.read;

        }



        if(
          filter === "read"
        ){

          return n.read;

        }



        return true;


      }
    );







  return (

    <div className="p-6 space-y-6">



      <h1 className="text-3xl font-bold">

        🔔 Obavijesti

      </h1>





      <div className="flex flex-wrap gap-3">


        <button

          onClick={()=>setFilter("all")}

          className="px-4 py-2 rounded bg-gray-100"

        >

          Sve

        </button>





        <button

          onClick={()=>setFilter("new")}

          className="px-4 py-2 rounded bg-gray-100"

        >

          Nove

        </button>





        <button

          onClick={()=>setFilter("read")}

          className="px-4 py-2 rounded bg-gray-100"

        >

          Pročitane

        </button>





        <button

          onClick={markAllRead}

          className="px-4 py-2 rounded bg-blue-600 text-white"

        >

          ✅ Označi sve pročitano

        </button>





        <button

          onClick={deleteReadNotifications}

          className="px-4 py-2 rounded bg-red-600 text-white"

        >

          🗑 Obriši pročitane

        </button>


      </div>

      <div className="bg-white rounded-xl shadow p-4">



        {
          filteredNotifications.length === 0 ?


          (

            <p>
              Nema obavijesti
            </p>

          )


          :


          filteredNotifications.map((n)=>(


            <div

              key={n.id}

              className={`border-b py-4 px-3 rounded ${
                !n.read
                ?
                "bg-blue-50"
                :
                ""
              }`}

            >



              <button

                type="button"

                className="w-full text-left"

           onClick={()=>{

  alert("KLIK RADI");

}}

              >



                <div className="flex justify-between">


                  <b>

                    {notificationIcon(n.type)} {n.title}

                  </b>



                  <span className="text-sm">

                    {
                      n.read
                      ?
                      "Pročitano"
                      :
                      "Novo"
                    }

                  </span>



                </div>




                <p>

                  {n.message}

                </p>

<span className="text-xs text-gray-500 block mt-1">

  {
    n.createdAt?.toDate
    ?
    n.createdAt.toDate().toLocaleString(
      "hr-HR",
      {
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"
      }
    )
    :
    ""
  }

</span>


                <p className="text-sm text-gray-500 mt-1">

                  {formatDate(n.createdAt)}

                </p>




                <p className="text-xs text-gray-500 mt-2">

                  🕒 {formatNotificationTime(n.createdAt)}

                </p>



              </button>






              <button

                type="button"

                onClick={(e)=>{


                  e.stopPropagation();



                  deleteNotification(
                    n.id
                  );


                }}

                className="mt-2 text-sm text-red-600 hover:underline"

              >

                🗑 Obriši

              </button>





            </div>


          ))


        }



      </div>



    </div>

  );


}