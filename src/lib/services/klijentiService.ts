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

import { auth, db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

// =======================
// TIPOVI
// =======================

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

      createdAt:
        serverTimestamp(),

    }
  );

}




export async function getClients(trainerId: string): Promise<Client[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const response = await fetch(
    `/api/clients/list?trainerId=${encodeURIComponent(trainerId)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Klijente nije moguće učitati.");
  if (result?.trainerId !== trainerId || !Array.isArray(result.clients)) {
    throw new Error("Neispravan odgovor servera.");
  }
  return result.clients as Client[];
}

export async function getClient(clientId: string): Promise<Client | null> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const response = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (response.status === 404) return null;
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Profil nije dostupan.");
  if (!result?.client || result.client.id !== clientId) throw new Error("Neispravan odgovor servera.");
  return result.client as Client;
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


export type MeasurementValues = {
  weight: number;
  bodyFat?: number | null;
  notes?: string;
  height?: number;
  waist?: number;
  chest?: number;
  arm?: number;
};

type MeasurementRecord = MeasurementValues & {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

async function measurementRequest(
  clientId: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  data?: object,
  measurementId?: string
): Promise<any> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Moraš biti prijavljen.");
  const token = await currentUser.getIdToken();
  const base = `/api/clients/${encodeURIComponent(clientId)}/measurements`;
  const url = measurementId ? `${base}/${encodeURIComponent(measurementId)}` : base;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });
  const result: any = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error || "Mjerenja trenutačno nisu dostupna.");
  }
  return result;
}

export async function addMeasurement(clientId: string, data: MeasurementValues) {
  const result = await measurementRequest(clientId, "POST", data);
  return result.id as string;
}

export async function getMeasurements(clientId: string): Promise<MeasurementRecord[]> {
  const result = await measurementRequest(clientId, "GET");
  if (!Array.isArray(result?.measurements)) {
    throw new Error("Neispravan odgovor servera za mjerenja.");
  }
  return result.measurements as MeasurementRecord[];
}

export async function updateMeasurement(
  clientId: string,
  measurementId: string,
  data: Partial<MeasurementValues>
) {
  await measurementRequest(clientId, "PATCH", data, measurementId);
}

export async function deleteMeasurement(clientId: string, measurementId: string) {
  await measurementRequest(clientId, "DELETE", undefined, measurementId);
}

// =======================
// TRENING PLANOVI
// =======================


export type WorkoutPlan = {
  id: string;
  title: string;
  exercises: string;
  createdAt: string | null;
  updatedAt: string | null;
};

async function workoutRequest(
  clientId: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  workoutId?: string,
  data?: { title: string; exercises: string }
): Promise<{ workouts?: WorkoutPlan[]; id?: string; ok?: boolean }> {
  const user = auth.currentUser;
  if (!user) throw new Error("Prijava je potrebna.");
  const token = await user.getIdToken();
  const base = `/api/clients/${encodeURIComponent(clientId)}/workouts`;
  const url = workoutId ? `${base}/${encodeURIComponent(workoutId)}` : base;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Rad s trening planom nije uspio.");
  return result ?? {};
}

export async function addWorkout(clientId: string, data: { title: string; exercises: string }) {
  await workoutRequest(clientId, "POST", undefined, data);
}

export async function getWorkouts(clientId: string): Promise<WorkoutPlan[]> {
  const result = await workoutRequest(clientId, "GET");
  if (!Array.isArray(result.workouts)) throw new Error("Neispravan odgovor servera.");
  return result.workouts;
}

export async function updateWorkout(
  clientId: string,
  workoutId: string,
  data: { title: string; exercises: string }
) {
  await workoutRequest(clientId, "PATCH", workoutId, data);
}

export async function deleteWorkout(clientId: string, workoutId: string) {
  await workoutRequest(clientId, "DELETE", workoutId);
}

// =======================
// STATISTIKA TRENERA
// =======================


export async function getTrainerStats(trainerId: string) {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== trainerId) {
    throw new Error("Prijava trenera nije valjana.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(
    "/api/clients/list?trainerId=" + encodeURIComponent(trainerId),
    {
      headers: {
        Authorization: "Bearer " + token,
      },
      cache: "no-store",
    }
  );

  const result = (await response.json().catch(() => null)) as {
    error?: string;
    trainerId?: string;
    clients?: Array<{ id: string }>;
  } | null;

  if (!response.ok) {
    throw new Error(result?.error || "Klijente nije moguce ucitati.");
  }

  if (
    result?.trainerId !== trainerId ||
    !Array.isArray(result.clients)
  ) {
    throw new Error("Neispravan popis klijenata.");
  }

  let totalMeasurements = 0;

  for (const client of result.clients) {
    if (typeof client.id !== "string" || !client.id) {
      throw new Error("Neispravan ID klijenta.");
    }

    const measurements = await getMeasurements(client.id);
    totalMeasurements += measurements.length;
  }

  return {
    clientsCount: result.clients.length,
    measurementsCount: totalMeasurements,
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

      id:
        doc.id,

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

  const checkinRef =
    doc(
      db,
      "clients",
      clientId,
      "checkins",
      checkinId
    );



  const oldCheckin =
    await getDoc(checkinRef);



  const hadComment =
    oldCheckin.exists() &&
    !!oldCheckin.data().trainerComment;



  await updateDoc(

    checkinRef,

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
        hadComment
          ? "Ažuriran komentar trenera"
          : "Odgovor trenera",



      message:
        hadComment
          ? "Trener je ažurirao komentar na tvom check-inu."
          : "Trener je odgovorio na tvoj check-in.",



      type:
        "checkin",



      link:
        `/dashboard/client?tab=checkin&checkin=${checkinId}`

    }

  );

}
// =======================
// ODGOVOR KLIJENTA NA KOMENTAR TRENERA
// =======================


// =======================
// TRAŽENJE KLIJENTA PO EMAILU
// =======================


export async function getClientByEmail(email: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email ||
      currentUser.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("Možeš dohvatiti samo svoj profil.");
  }
  const token = await currentUser.getIdToken();
  const response = await fetch("/api/clients/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Profil nije dostupan.");
  return body?.client ?? null;
}


// =======================
// KLIJENT PO USER ID
// =======================


export async function getClientByUserId(userId: string): Promise<any | null> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) throw new Error("Možeš dohvatiti samo svoj profil.");
  const token = await user.getIdToken();
  const response = await fetch("/api/clients/me", {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Profil nije dostupan.");
  if (result?.client?.id !== userId) throw new Error("Neispravan profil.");
  return result.client;
}

// =======================
// REAL-TIME CHECKINS
// =======================


export function listenCheckins(

  clientId:string,

  callback:(checkins:any[])=>void

){


  return onSnapshot(


    collection(

      db,

      "clients",

      clientId,

      "checkins"

    ),



    (snapshot)=>{


      const checkins =

        snapshot.docs

        .map((doc)=>({


          id:
            doc.id,


          ...doc.data(),


        }))



        .sort((a:any,b:any)=>{


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
// =======================
// PREHRANA
// =======================


type NutritionPlanResult = {
  id: string;
  title: string;
  meals: string;
  createdAt: string | null;
  updatedAt: string | null;
};

async function nutritionRequest(
  clientId: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  planId?: string,
  data?: { title: string; meals: string }
): Promise<{ plans?: NutritionPlanResult[]; id?: string; ok?: boolean }> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Prijava je potrebna.");
  const token = await currentUser.getIdToken();
  const base = `/api/clients/${encodeURIComponent(clientId)}/nutrition`;
  const url = planId ? `${base}/${encodeURIComponent(planId)}` : base;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error || "Rad s planom prehrane nije uspio.");
  }
  return result ?? {};
}

export async function addNutritionPlan(
  clientId: string,
  data: { title: string; meals: string }
) {
  await nutritionRequest(clientId, "POST", undefined, data);
}

export async function getNutritionPlans(clientId: string) {
  const result = await nutritionRequest(clientId, "GET");
  return result.plans ?? [];
}

export async function updateNutritionPlan(
  clientId: string,
  planId: string,
  data: { title: string; meals: string }
) {
  await nutritionRequest(clientId, "PATCH", planId, data);
}

export async function deleteNutritionPlan(clientId: string, planId: string) {
  await nutritionRequest(clientId, "DELETE", planId);
}
