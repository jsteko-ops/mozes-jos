import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const ref = collection(db, "clients", clientId, "checkins");

  return await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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