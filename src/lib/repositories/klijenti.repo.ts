import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
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

/* ➕ ADD CLIENT (FREE LIMIT + PREMIUM CHECK) */
export async function addKlijent(data: {
  name: string;
  goal: string;
  email?: string;
  phone?: string;
  userId: string;
}) {
  // 1. provjeri usera
  const userRef = doc(db, "users", data.userId);
  const userSnap = await getDoc(userRef);

  const isPremium = userSnap.exists()
    ? userSnap.data().isPremium
    : false;

  // 2. FREE LIMIT (5 klijenata)
  if (!isPremium) {
    const klijentiSnap = await getDocs(collection(db, "klijenti"));

    if (klijentiSnap.size >= 5) {
      throw new Error("LIMIT_REACHED");
    }
  }

  // 3. spremi klijenta
  await addDoc(collection(db, "klijenti"), {
    ...data,
    createdAt: serverTimestamp(),
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