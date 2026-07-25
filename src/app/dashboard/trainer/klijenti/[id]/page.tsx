"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientPlans from "@/components/owner/ClientPlans";
import ClientEditForm from "@/components/clients/ClientEditForm";

import ClientTabs from "@/components/owner/ClientTabs";

import ClientNutrition from "@/components/nutrition/ClientNutrition";
import ClientMeasurements from "@/components/owner/ClientMeasurements";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  getCheckins,
  markCheckinReviewed,
} from "@/lib/services/klijentiService";


import {
  getClient,
  addMeasurement,
  getMeasurements,
  updateMeasurement,
  deleteMeasurement,
  addWorkout,
} from "@/lib/services/klijentiService";



function toNumber(value: string) {

  return Number(
    value.replace(",", ".")
  );

}



type Client = {

  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;

};



type Measurement = {

  id: string;
  weight: number;
  height: number;
  waist: number;
  chest: number;
  arm: number;

};




export default function KlijentProfilPage() {


  const params = useParams();
const searchParams = useSearchParams();

const checkinId =
  searchParams.get("checkinId");

  const id = params.id as string;



  const [client, setClient] =
    useState<Client | null>(null);



  const [measurements, setMeasurements] =
    useState<Measurement[]>([]);



  const [chartData, setChartData] =
    useState<any[]>([]);



  const [loading, setLoading] =
    useState(true);

const [checkins,setCheckins] =
  useState<any[]>([]);


const [refreshCheckins,setRefreshCheckins] =
  useState(false);


  // MJERENJE

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [waist, setWaist] =
    useState("");

  const [chest, setChest] =
    useState("");

  const [arm, setArm] =
    useState("");




  const [editingMeasurement, setEditingMeasurement] =
    useState<string | null>(null);



  const [editMeasurementData, setEditMeasurementData] =
    useState({

      weight: "",
      height: "",
      waist: "",
      chest: "",
      arm: ""

    });





  // TRENING

  const [workoutTitle, setWorkoutTitle] =
    useState("");

  const [exercises, setExercises] =
    useState("");




  async function loadData() {


    if (!id) return;



    const c =
      await getClient(id);


    setClient(
      c as Client
    );



    const m =
      await getMeasurements(id);



    setMeasurements(
      m as Measurement[]
    );

const cks =
  await getCheckins(id);


setCheckins(
  cks as any[]
);

    const chart = (m as any[])
      .map((item) => ({

        date:
          item.createdAt?.toDate
            ?
            item.createdAt
              .toDate()
              .toLocaleDateString("hr-HR")
            :
            "",

        weight: item.weight

      }))
      .reverse();



    setChartData(chart);



    setLoading(false);


  }




  useEffect(() => {

    loadData();

  }, [
  id,
  refreshCheckins
]);




  async function saveMeasurement() {


    await addMeasurement(

      id,

      {
        weight: toNumber(weight),
        height: toNumber(height),
        waist: toNumber(waist),
        chest: toNumber(chest),
        arm: toNumber(arm)
      }

    );



    setWeight("");
    setHeight("");
    setWaist("");
    setChest("");
    setArm("");



    await loadData();


    alert("Mjerenje spremljeno ✅");


  }
    async function saveEditedMeasurement(
    measurementId: string
  ) {


    await updateMeasurement(

      id,

      measurementId,

      {
        weight: toNumber(editMeasurementData.weight),
        height: toNumber(editMeasurementData.height),
        waist: toNumber(editMeasurementData.waist),
        chest: toNumber(editMeasurementData.chest),
        arm: toNumber(editMeasurementData.arm)
      }

    );



    setEditingMeasurement(null);


    await loadData();


    alert("Mjerenje izmijenjeno ✅");


  }





  async function removeMeasurement(
    measurementId: string
  ) {


    const ok =
      confirm(
        "Obrisati mjerenje?"
      );


    if (!ok) return;



    await deleteMeasurement(
      id,
      measurementId
    );



    await loadData();



    alert("Mjerenje obrisano ✅");


  }





  async function saveWorkout() {


    if (!workoutTitle || !exercises) {

      alert(
        "Upiši naziv plana i vježbe"
      );

      return;

    }



    await addWorkout(

      id,

      {
        title: workoutTitle,
        exercises
      }

    );



    setWorkoutTitle("");

    setExercises("");



    alert(
      "Trening plan spremljen ✅"
    );


  }




const profileContent = (

  <div className="border rounded-xl p-5">

    {client && (

      <ClientEditForm

        client={client}

        onSaved={() => {

          loadData();

        }}

      />

    )}

  </div>

);

const measurementsContent = (

  <div className="space-y-6">

    <ClientMeasurements
      clientId={params.id as string}
    />

  </div>

);



const plansContent = (

  <div className="space-y-6">

    <ClientPlans

      clientId={id}

    />

  </div>

);



const nutritionContent = (

  <ClientNutrition

    clientId={id}

  />

);





const checkinContent = (

  <CheckinHistory

    clientId={id}

    checkins={checkins}

    targetCheckinId={checkinId}

    onReviewed={()=>{

      setRefreshCheckins(
        !refreshCheckins
      );

    }}

  />

);

  return (

    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">
          Profil klijenta
        </h1>


<ClientTabs

  profile={profileContent}

  measurements={measurementsContent}

  plans={plansContent}

  checkin={checkinContent}

  nutrition={nutritionContent}

/>


        {loading &&

          <p>
            Učitavanje...
          </p>

        }





       


      </div>


    </RoleGuard>

  );


}