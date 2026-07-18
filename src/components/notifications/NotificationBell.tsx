"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { useRouter } from "next/navigation";



type Notification = {

  id:string;

  title:string;

  message:string;

  read:boolean;

  link?:string;

  createdAt?:any;

};




export default function NotificationBell(){


  const router = useRouter();


  const [userId,setUserId] =
    useState<string | null>(null);


  const [notifications,setNotifications] =
    useState<Notification[]>([]);


  const [open,setOpen] =
    useState(false);





  async function loadNotifications(uid:string){


    const q =
      query(

        collection(
          db,
          "notifications"
        ),

        where(
          "userId",
          "==",
          uid
        ),

        orderBy(
          "createdAt",
          "desc"
        )

      );



    const snap =
      await getDocs(q);



    setNotifications(

      snap.docs.map((d)=>({

        id:d.id,

        ...d.data()

      })) as Notification[]

    );


  }







  useEffect(()=>{


    const unsub =
      onAuthStateChanged(
        auth,
        (user)=>{


          if(user){

            setUserId(
              user.uid
            );

            loadNotifications(
              user.uid
            );

          }


        }
      );


    return ()=>unsub();


  },[]);







  async function openNotification(
    notification:Notification
  ){


    await updateDoc(

      doc(
        db,
        "notifications",
        notification.id
      ),

      {
        read:true
      }

    );


    if(notification.link){

      router.push(
        notification.link
      );

      return;

    }


    if(userId){

      loadNotifications(
        userId
      );

    }


  }






  const unread =
    notifications.filter(
      n=>!n.read
    ).length;






  return (

    <div className="relative">


      <button

        onClick={()=>
          setOpen(!open)
        }

        className="relative text-2xl"

      >

        🔔


        {
          unread > 0 &&

          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">

            {unread}

          </span>

        }


      </button>





      {
        open &&

        <div className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-xl p-4 z-50">


          <h3 className="font-bold mb-3">

            Obavijesti

          </h3>




          {
            notifications.length === 0

            ?

            <p>
              Nema obavijesti
            </p>


            :

            notifications.map((n)=>(


              <button

                key={n.id}

                className="block w-full text-left border-b py-3 hover:bg-gray-50"

                onClick={()=>
                  openNotification(n)
                }

              >

                <b>
                  {n.title}
                </b>


                <p className="text-sm">
                  {n.message}
                </p>


              </button>


            ))

          }


        </div>

      }


    </div>

  );

}