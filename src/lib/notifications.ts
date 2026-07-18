import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


export async function createNotification(

  userId:string,

  data:{
    title:string;
    message:string;
    type:string;
    link?:string;
  }

){

  await addDoc(

    collection(
      db,
      "notifications"
    ),

    {

      userId,

      title:data.title,

      message:data.message,

      type:data.type,

      link:data.link ?? null,

      read:false,

      createdAt:
        serverTimestamp(),

    }

  );

}