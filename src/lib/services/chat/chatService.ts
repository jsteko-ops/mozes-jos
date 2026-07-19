import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";




// ======================
// PRONAĐI ILI KREIRAJ CHAT
// ======================

export async function getOrCreateChat(

  trainerId:string,

  clientId:string

){


  const chatId =
    `${trainerId}_${clientId}`;


  const ref =
    doc(
      db,
      "chats",
      chatId
    );


  const snap =
    await getDoc(ref);



  if(!snap.exists()){


    await setDoc(

      ref,

      {

        trainerId,

        clientId,

        createdAt:
          serverTimestamp(),

      }

    );


  }


  return chatId;

}





// ======================
// POŠALJI PORUKU
// ======================

export async function sendMessage(

  chatId:string,

  senderId:string,

  text:string

){


  await addDoc(

    collection(

      db,

      "chats",

      chatId,

      "messages"

    ),

    {

      senderId,

      text,

      createdAt:
        serverTimestamp(),

    }

  );


}






// ======================
// DOHVATI PORUKE
// ======================

export async function getMessages(

  chatId:string

){


  const q = query(

    collection(

      db,

      "chats",

      chatId,

      "messages"

    ),

    orderBy(

      "createdAt",

      "asc"

    )

  );



  const snap =
    await getDocs(q);



  return snap.docs.map((doc)=>({

    id:doc.id,

    ...doc.data(),

  }));


}
// ======================
// REAL-TIME PORUKE
// ======================

export function listenMessages(

  chatId:string,

  callback:(messages:any[])=>void

){


  const q = query(

    collection(

      db,

      "chats",

      chatId,

      "messages"

    ),

    orderBy(

      "createdAt",

      "asc"

    )

  );



  return onSnapshot(

    q,

    (snapshot)=>{


      const messages =
        snapshot.docs.map((doc)=>({

          id:doc.id,

          ...doc.data(),

        }));


      callback(messages);


    }

  );


}