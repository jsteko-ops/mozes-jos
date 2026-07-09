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
// KLIJENTI
// =======================

export async function addClient(
  trainerId:string,
  data:{
    name:string;
    email:string;
    phone:string;
    note:string;
  }
){

  await addDoc(
    collection(db,"clients"),
    {
      trainerId,
      ...data,
      createdAt:serverTimestamp()
    }
  );

}



export async function getClients(
  trainerId:string
){

 const q=query(
  collection(db,"clients"),
  where(
    "trainerId",
    "==",
    trainerId
  )
 );


 const snap=await getDocs(q);


 return snap.docs.map(doc=>({
   id:doc.id,
   ...doc.data()
 }));

}



export async function getClient(
 clientId:string
){

 const snap=await getDoc(
  doc(
    db,
    "clients",
    clientId
  )
 );


 if(!snap.exists())
 return null;


 return {
  id:snap.id,
  ...snap.data()
 };

}



export async function updateClient(
 clientId:string,
 data:{
  name:string;
  email:string;
  phone:string;
  note:string;
 }
){

 await updateDoc(
  doc(
   db,
   "clients",
   clientId
  ),
  data
 );

}



// =======================
// MJERENJA
// =======================


export async function addMeasurement(
 clientId:string,
 data:{
  weight:number;
  height:number;
  waist:number;
  chest:number;
  arm:number;
 }
){

 await addDoc(
  collection(
   db,
   "clients",
   clientId,
   "measurements"
  ),
  {
   ...data,
   createdAt:serverTimestamp()
  }
 );

}



export async function getMeasurements(
 clientId:string
){

 const snap=
 await getDocs(
  collection(
   db,
   "clients",
   clientId,
   "measurements"
  )
 );


 return snap.docs.map(doc=>({
  id:doc.id,
  ...doc.data()
 }));

}



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

 await updateDoc(
  doc(
   db,
   "clients",
   clientId,
   "measurements",
   measurementId
  ),
  data
 );

}



export async function deleteMeasurement(
 clientId:string,
 measurementId:string
){

 await deleteDoc(
  doc(
   db,
   "clients",
   clientId,
   "measurements",
   measurementId
  )
 );

}




// =======================
// TRENING PLANOVI
// =======================


export async function addWorkout(
 clientId:string,
 data:{
  title:string;
  exercises:string;
 }
){

 await addDoc(
  collection(
   db,
   "clients",
   clientId,
   "workouts"
  ),
  {
   ...data,
   createdAt:serverTimestamp()
  }
 );

}




export async function getWorkouts(
 clientId:string
){

 const snap=
 await getDocs(
  collection(
   db,
   "clients",
   clientId,
   "workouts"
  )
 );


 return snap.docs.map(doc=>({
  id:doc.id,
  ...doc.data()
 }));

}




export async function updateWorkout(
 clientId:string,
 workoutId:string,
 data:{
  title:string;
  exercises:string;
 }
){

 await updateDoc(
  doc(
   db,
   "clients",
   clientId,
   "workouts",
   workoutId
  ),
  data
 );

}




export async function deleteWorkout(
 clientId:string,
 workoutId:string
){

 await deleteDoc(
  doc(
   db,
   "clients",
   clientId,
   "workouts",
   workoutId
  )
 );

}
// =======================
// STATISTIKA TRENERA
// =======================


export async function getTrainerStats(
  trainerId:string
){

  const clients =
    await getClients(trainerId);


  let totalMeasurements = 0;


  for(const client of clients){

    const measurements =
      await getMeasurements(client.id);


    totalMeasurements += measurements.length;

  }



  return {

    clientsCount:
      clients.length,


    measurementsCount:
      totalMeasurements

  };

}





// =======================
// CHECK IN
// =======================


export async function addCheckin(
 clientId:string,
 data:{
  weight:number;
  energy:number;
  note:string;
 }
){


 await addDoc(

  collection(
   db,
   "clients",
   clientId,
   "checkins"
  ),

  {

   ...data,

   createdAt:
    serverTimestamp()

  }

 );


}





export async function getCheckins(
 clientId:string
){


 const snap =

 await getDocs(

  collection(
   db,
   "clients",
   clientId,
   "checkins"
  )

 );



 return snap.docs.map(doc=>({

  id:doc.id,

  ...doc.data()

 }));


}