import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


export function listenUnreadTrainerMessages(
  trainerId:string,
  callback:(count:number)=>void
){

  const q =
    query(

      collection(
        db,
        "chats"
      ),

      where(
        "trainerId",
        "==",
        trainerId
      ),

      where(
        "unreadForTrainer",
        "==",
        true
      )

    );


  return onSnapshot(
    q,
    (snapshot)=>{

      callback(
        snapshot.size
      );

    }
  );

}