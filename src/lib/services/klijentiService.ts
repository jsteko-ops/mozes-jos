import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";



// =======================
// DODAVANJE KLIJENTA
// =======================

export async function addClient(
  trainerId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    note: string;
  }
) {

  const ref = collection(
    db,
    "clients"
  );


  await addDoc(ref, {

    trainerId,

    ...data,

    createdAt: serverTimestamp(),

  });

}





// =======================
// LISTA KLIJENATA
// =======================

export async function getClients(
  trainerId: string
) {

  const q = query(
    collection(
      db,
      "clients"
    ),
    where(
      "trainerId",
      "==",
      trainerId
    )
  );


  const snapshot =
    await getDocs(q);



  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

}





// =======================
// JEDAN KLIJENT
// =======================

export async function getClient(
  clientId: string
) {

  const ref = doc(
    db,
    "clients",
    clientId
  );


  const snapshot =
    await getDoc(ref);



  if (!snapshot.exists()) {

    return null;

  }



  return {
    id: snapshot.id,
    ...snapshot.data(),
  };

}





// =======================
// IZMJENA KLIJENTA
// =======================

export async function updateClient(

  clientId: string,

  data: {
    name: string;
    email: string;
    phone: string;
    note: string;
  }

) {


  const ref = doc(
    db,
    "clients",
    clientId
  );


  await updateDoc(
    ref,
    data
  );

}







// =======================
// DODAVANJE MJERENJA
// =======================

export async function addMeasurement(

  clientId: string,

  data: {
    weight: number;
    height: number;
    waist: number;
    chest: number;
    arm: number;
  }

) {


  const ref = collection(
    db,
    "clients",
    clientId,
    "measurements"
  );


  await addDoc(ref, {

    ...data,

    createdAt:
      serverTimestamp(),

  });

}






// =======================
// DOHVAT MJERENJA
// =======================

export async function getMeasurements(

  clientId: string

) {


  const ref = collection(
    db,
    "clients",
    clientId,
    "measurements"
  );


  const snapshot =
    await getDocs(ref);



  return snapshot.docs.map((item)=>({

    id:item.id,

    ...item.data(),

  }));

}






// =======================
// IZMJENA MJERENJA
// =======================

export async function updateMeasurement(

  clientId:string,

  measurementId:string,

  data:{
    weight:number;
    height:number;
    waist:number;
    chest:number;
    arm:number;
  }

){

  const ref = doc(
    db,
    "clients",
    clientId,
    "measurements",
    measurementId
  );


  await updateDoc(
    ref,
    data
  );

}






// =======================
// BRISANJE MJERENJA
// =======================

export async function deleteMeasurement(

  clientId:string,

  measurementId:string

){

  const ref = doc(
    db,
    "clients",
    clientId,
    "measurements",
    measurementId
  );


  await deleteDoc(ref);

}






// =======================
// DODAVANJE TRENINGA
// =======================

export async function addWorkout(

  clientId:string,

  data:{
    title:string;
    exercises:string;
  }

){


  const ref = collection(
    db,
    "clients",
    clientId,
    "workouts"
  );


  await addDoc(ref, {

    ...data,

    createdAt:
      serverTimestamp(),

  });

}






// =======================
// DOHVAT TRENINGA
// =======================

export async function getWorkouts(

  clientId:string

){


  const ref = collection(
    db,
    "clients",
    clientId,
    "workouts"
  );


  const snapshot =
    await getDocs(ref);



  return snapshot.docs.map((item)=>({

    id:item.id,

    ...item.data(),

  }));

}






// =======================
// IZMJENA TRENINGA
// =======================

export async function updateWorkout(

  clientId:string,

  workoutId:string,

  data:{
    title:string;
    exercises:string;
  }

){


  const ref = doc(
    db,
    "clients",
    clientId,
    "workouts",
    workoutId
  );


  await updateDoc(
    ref,
    data
  );

}






// =======================
// BRISANJE TRENINGA
// =======================

export async function deleteWorkout(

  clientId:string,

  workoutId:string

){

  const ref = doc(
    db,
    "clients",
    clientId,
    "workouts",
    workoutId
  );


  await deleteDoc(ref);

}