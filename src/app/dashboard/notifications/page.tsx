"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import { useRouter } from "next/navigation";


type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt?: any;
};



export default function NotificationsPage() {


  const router = useRouter();


  const [notifications,setNotifications] =
    useState<Notification[]>([]);


  const [filter,setFilter] =
    useState<
      "all" | "new" | "read"
    >("all");



  useEffect(()=>{


    const unsubscribeAuth =
      onAuthStateChanged(auth,(user)=>{


        if(!user){
          return;
        }



        const q = query(

          collection(
            db,
            "notifications"
          ),

          where(
            "userId",
            "==",
            user.uid
          ),

          orderBy(
            "createdAt",
            "desc"
          )

        );



        const unsubscribe =
          onSnapshot(q,(snap)=>{


            const data =
              snap.docs.map((item)=>({

                id:item.id,

                ...item.data()

              })) as Notification[];



            setNotifications(data);


          });


        return unsubscribe;


      });



    return ()=>unsubscribeAuth();



  },[]);





  async function markAllRead(){

    const unread =
      notifications.filter(
        n => !n.read
      );


    if(unread.length === 0){
      return;
    }



    const batch =
      writeBatch(db);



    unread.forEach((n)=>{

      const ref =
        doc(
          db,
          "notifications",
          n.id
        );


      batch.update(
        ref,
        {
          read:true
        }
      );


    });



    await batch.commit();

  }






  const filteredNotifications =
    notifications.filter((n)=>{


      if(filter === "new"){
        return !n.read;
      }


      if(filter === "read"){
        return n.read;
      }


      return true;


    });







  function formatDate(timestamp:any){

    if(!timestamp){
      return "";
    }


    return timestamp
      .toDate()
      .toLocaleString(
        "hr-HR"
      );

  }






  return (

<div className="p-6">


<h1 className="text-2xl font-bold mb-6">
🔔 Povijest obavijesti
</h1>




<div className="flex gap-3 mb-5">


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
className="ml-auto px-4 py-2 rounded bg-blue-600 text-white"
>
Označi sve pročitano
</button>


</div>





<div className="bg-white rounded-xl shadow p-4">



{
filteredNotifications.length === 0 ?


<p>
Nema obavijesti
</p>



:

filteredNotifications.map((n)=>(


<button

key={n.id}

onClick={()=>{

if(n.link){

router.push(
n.link
);

}

}}

className={`w-full text-left border-b py-4 px-3 rounded hover:bg-gray-50 ${
!n.read ? "bg-blue-50" : ""
}`}

>



<div className="flex justify-between">


<b>
{n.title}
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



<p className="text-sm text-gray-500 mt-1">

{formatDate(n.createdAt)}

</p>




</button>


))


}



</div>


</div>

);


}