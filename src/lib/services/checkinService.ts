import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

export interface Checkin {
  id?: string;
  weight: number;
  energy: number;
  sleep: number;
  hunger: number;
  water: string;
  comment: string;
  photos: string[];
  createdAt?: any;
  updatedAt?: any;
}

export async function createCheckin(
  clientId: string,
  data: Omit<Checkin, "id" | "createdAt" | "updatedAt">
) {

  const ref =
    collection(
      db,
      "clients",
      clientId,
      "checkins"
    );


  const checkinRef =
    await addDoc(
      ref,
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );



  const clientSnap =
    await getDoc(
      doc(
        db,
        "clients",
        clientId
      )
    );


  if(clientSnap.exists()){

    const client =
      clientSnap.data();



    if(client.trainerId){

      await createNotification(

        client.trainerId,

        {
          title:
            "Novi check-in",

          message:
            `${client.name} je poslao novi check-in.`,

          type:
            "checkin",

          link:
            `/dashboard/trainer/klijenti/${clientId}?tab=checkin&checkinId=${checkinRef.id}`

        }

      );

    }

  }



  return checkinRef;

}

export async function getCheckins(clientId: string) {
  const ref = collection(db, "clients", clientId, "checkins");

  const q = query(ref, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Checkin, "id">),
  }));
}

export async function updateCheckin(
  clientId: string,
  checkinId: string,
  data: Partial<Checkin>
) {
  const ref = doc(db, "clients", clientId, "checkins", checkinId);

  return await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCheckin(
  clientId: string,
  checkinId: string
) {
  const ref = doc(db, "clients", clientId, "checkins", checkinId);

  return await deleteDoc(ref);
}