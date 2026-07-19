import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

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

  const chatSnap =
    await getDoc(
      doc(
        db,
        "chats",
        chatId
      )
    );


  if(!chatSnap.exists()){
    return;
  }


  const chatData =
    chatSnap.data();


  const isTrainer =
    chatData.trainerId === senderId;

const receiverId =
  isTrainer
    ? chatData.clientId
    : chatData.trainerId;



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



  await updateDoc(

    doc(
      db,
      "chats",
      chatId
    ),

    {

      lastMessage:text,

      lastSenderId:senderId,

      updatedAt:
        serverTimestamp(),

      unreadForTrainer:
        !isTrainer,

      unreadForClient:
        isTrainer,

    }

  );




await createNotification(

  receiverId,

  {
    title:
      "Nova poruka 💬",

    message:
      text,

    type:
      "chat",

    link:
      "/dashboard/chat",

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

  ...(doc.data() as {
    clientId:string;
    trainerId:string;
    lastMessage?:string;
    updatedAt?:any;
  }),

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

// ======================
// DOHVATI CHATOVE TRENERA
// ======================

export async function getTrainerChats(
  trainerId: string
) {

  const q = query(
    collection(db, "chats"),
    where(
      "trainerId",
      "==",
      trainerId
    ),
    orderBy(
      "updatedAt",
      "desc"
    )
  );


  const snap =
    await getDocs(q);


return snap.docs.map((doc)=>({

  id: doc.id,

  ...(doc.data() as {

    clientId: string;

    trainerId: string;

    lastMessage?: string;

    updatedAt?: any;

  }),

}));

}
