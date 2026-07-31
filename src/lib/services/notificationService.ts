import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


// ========================================
// NEPROČITANI CHECK-INOVI
// ========================================

export function listenUnreadCheckins(
  userId: string,
  callback: (count: number) => void
) {

  const q = query(

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

    (snapshot) => {

      callback(
        snapshot.size
      );

    },

    (error) => {

      console.error(
        "Greška kod brojanja check-in obavijesti:",
        error
      );

      callback(0);

    }

  );

}


// ========================================
// SVE NEPROČITANE OBAVIJESTI
// ========================================

export function listenUnreadNotifications(
  userId: string,
  callback: (count: number) => void
) {

  const q = query(

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
      "read",
      "==",
      false
    )

  );


  return onSnapshot(

    q,

    (snapshot) => {

      callback(
        snapshot.size
      );

    },

    (error) => {

      console.error(
        "Greška kod brojanja obavijesti:",
        error
      );

      callback(0);

    }

  );

}