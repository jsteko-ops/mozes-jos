import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


export function listenUnreadCheckins(
  userId: string,
  callback: (count:number)=>void
){

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

      where(
        "type",
        "==",
        "checkin"
      ),

      where(
        "read",
        "==",
        false
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