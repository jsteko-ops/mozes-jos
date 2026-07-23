"use client";

import { useEffect, useRef, useState } from "react";

import {
  collection,
  onSnapshot,
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
const bellRef = useRef<HTMLDivElement>(null);




  function loadNotifications(uid: string) {

  const q = query(

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

  return onSnapshot(

    q,

    (snap) => {

      const data = snap.docs
        .map((d) => ({

          id: d.id,

          ...d.data(),

        }) as Notification)
        .filter((n) => !n.read);

      setNotifications(data);

    }

  );

}







  useEffect(() => {

  let unsubscribeNotifications: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(

    auth,

    (user) => {

      if (!user) {

        setNotifications([]);
        setUserId(null);

        if (unsubscribeNotifications) {
          unsubscribeNotifications();
        }

        return;

      }

      setUserId(user.uid);

      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }

      unsubscribeNotifications =
        loadNotifications(user.uid);

    }

  );

  return () => {

    unsubscribeAuth();

    if (unsubscribeNotifications) {
      unsubscribeNotifications();
    }

  };

}, []);




useEffect(() => {

  function handleClickOutside(event: MouseEvent) {

    if (
      bellRef.current &&
      !bellRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }

  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };

}, []);




async function openNotification(
  notification: Notification
){

console.log("KLIK OBAVIJEST:", notification);

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


// makni odmah iz prikaza
setNotifications(prev =>
  prev.filter(
    n => n.id !== notification.id
  )
);

// zatvori oblačić
setOpen(false);

  // idi na povezani sadržaj
  if(notification.link){

  await router.push(
  notification.link
);

router.refresh();

return;

  }


  // ako nema linka samo osvježi listu
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

<div
  ref={bellRef}
  className="relative"
>


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