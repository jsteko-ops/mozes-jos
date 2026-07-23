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
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";


interface Client {

  id: string;

  trainerId: string;

  name: string;

  email: string;

  phone: string;

  note: string;

  createdAt?: any;

}



// =======================
// KLIJENTI
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

  await addDoc(
    collection(db, "clients"),
    {
      trainerId,
      ...data,
      createdAt: serverTimestamp(),
    }
  );

}



export async function getClients(
  trainerId: string
): Promise<Client[]> {


  const q = query(
    collection(db, "clients"),
    where(
      "trainerId",
      "==",
      trainerId
    )
  );


  const snap = await getDocs(q);



  return snap.docs.map((doc)=>({

    id: doc.id,

    ...(doc.data() as Omit<Client,"id">),

  }));

}



export async function getClient(
  clientId: string
) {


  const snap =
    await getDoc(
      doc(
        db,
        "clients",
        clientId
      )
    );


  if(!snap.exists()) {

    return null;

  }


  const data =
    snap.data() as Client;


  return {

    id: snap.id,

    ...data,

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
      createdAt:serverTimestamp(),
    }
  );

}




export async function getMeasurements(
  clientId:string
){

  const snap =
    await getDocs(
      collection(
        db,
        "clients",
        clientId,
        "measurements"
      )
    );



  return snap.docs.map((doc)=>({

    id:doc.id,

    ...doc.data(),

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
      createdAt:serverTimestamp(),
    }
  );

}



export async function getWorkouts(
  clientId:string
){

  const snap =
    await getDocs(
      collection(
        db,
        "clients",
        clientId,
        "workouts"
      )
    );



  return snap.docs.map((doc)=>({

    id:doc.id,

    ...doc.data(),

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



  for(
    const client of clients
  ){

    const measurements =
      await getMeasurements(
        client.id
      );


    totalMeasurements +=
      measurements.length;

  }



  return {

    clientsCount:
      clients.length,

    measurementsCount:
      totalMeasurements,

  };

}



// =======================
// CHECK-IN
// =======================


export async function addCheckin(
  clientId:string,
  data:{
    weight:number;
    energy:number;
    sleep:number;
    hunger:number;
    water:string;
    comment:string;
    photos?:string[];
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

      photos:
        data.photos ?? [],

      reviewed:false,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),

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



  const checkins =
    snap.docs.map((doc)=>({

      id:doc.id,

      ...doc.data(),

    }));



  return checkins.sort(
    (a:any,b:any)=>{

      const dateA =
        a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;


      const dateB =
        b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;



      return dateB - dateA;

    }
  );

}




export async function markCheckinReviewed(
  clientId:string,
  checkinId:string
){

  await updateDoc(
    doc(
      db,
      "clients",
      clientId,
      "checkins",
      checkinId
    ),
    {

      reviewed:true,

      reviewedAt:
        serverTimestamp(),

    }
  );

}

export async function saveTrainerComment(
  clientId:string,
  checkinId:string,
  trainerComment:string
){

  await updateDoc(
    doc(
      db,
      "clients",
      clientId,
      "checkins",
      checkinId
    ),
    {

      trainerComment,

      trainerCommentAt:
        serverTimestamp(),

    }
  );

  await createNotification(

    clientId,

    {

      title:
        "Odgovor trenera",

      message:
        "Trener je odgovorio na tvoj check-in.",

      type:
        "checkin_reply",

      link:
        "/dashboard/client",

    }

  );

}



// =======================
// TRAŽENJE KLIJENTA PO EMAILU
// =======================


export async function getClientByEmail(
  email:string
){

  const q =
    query(
      collection(db,"clients"),
      where(
        "email",
        "==",
        email
      )
    );



  const snap =
    await getDocs(q);



  if(snap.empty){

    return null;

  }



  const clientDoc =
    snap.docs[0];



  return {

    id:
      clientDoc.id,

    ...clientDoc.data(),

  };

}
// =======================
// PREHRANA
// =======================

export async function addNutritionPlan(
  clientId:string,
  data:{
    title:string;
    meals:string;
  }
){

  await addDoc(
    collection(
      db,
      "clients",
      clientId,
      "nutrition"
    ),
    {
      ...data,
      createdAt:
        serverTimestamp(),
    }
  );

}


export async function getNutritionPlans(
  clientId:string
){

  const snap =
    await getDocs(
      collection(
        db,
        "clients",
        clientId,
        "nutrition"
      )
    );


  return snap.docs.map(doc=>({

    id:doc.id,

    ...doc.data()

  }));

}


export async function deleteNutritionPlan(
  clientId:string,
  planId:string
){

  await deleteDoc(
    doc(
      db,
      "clients",
      clientId,
      "nutrition",
      planId
    )
  );

}

export async function getClientByUserId(
  userId: string
): Promise<any | null> {


  const snap =
    await getDoc(
      doc(
        db,
        "clients",
        userId
      )
    );


  if (snap.exists()) {

    return {
      id: snap.id,
      ...snap.data(),
    };

  }


  return null;

}
// =======================
// REAL-TIME CHECKINS
// =======================

export function listenCheckins(

  clientId: string,

  callback: (checkins: any[]) => void

) {

  return onSnapshot(

    collection(
      db,
      "clients",
      clientId,
      "checkins"
    ),

    (snapshot) => {

      const checkins =
        snapshot.docs
          .map((doc) => ({

            id: doc.id,

            ...doc.data(),

          }))
          .sort((a: any, b: any) => {

            const dateA =
              a.createdAt?.toMillis
                ? a.createdAt.toMillis()
                : 0;

            const dateB =
              b.createdAt?.toMillis
                ? b.createdAt.toMillis()
                : 0;

            return dateB - dateA;

          });

      callback(checkins);

    }

  );

}