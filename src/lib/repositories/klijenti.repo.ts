import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

/* 👤 GET CLIENT BY ID */
export async function getKlijentById(id: string) {
  const ref = doc(db, "klijenti", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

/* 👥 LIST CLIENTS */
export function listenKlijenti(cb: Function) {
  const ref = collection(db, "klijenti");

  return onSnapshot(ref, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* 📊 MEASUREMENTS */
export function listenMeasurements(clientId: string, cb: Function) {
  const ref = collection(db, "klijenti", clientId, "measurements");

  return onSnapshot(ref, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  });
}