"use client";
import { useState } from "react";


import ReportStats from "@/components/reports/ReportStats";
import {
  formatDate,
  getWeightChange,
  filterByDays,
} from "@/lib/reports/reportHelpers";

import {
  getClient,
  getMeasurements,
  getCheckins,
  getWorkouts,
  getNutritionPlans,
} from "@/lib/services/klijentiService";

import { generateClientPdf } from "@/lib/reports/PdfGenerator";

type Props = {
  clientId:string;
};
type ReportPeriod =
  | "all"
  | "30"
  | "90"
  | "365";




export default function ClientReport({
  clientId,
}:Props){

const [period, setPeriod] =
  useState<ReportPeriod>("all");



async function generatePDF(){

console.log("GENERATE PDF START");

  const client =
    await getClient(clientId);


  if(!client){

    alert(
      "Klijent nije pronađen"
    );

    return;

  }


  const loadedMeasurements =
  await getMeasurements(clientId);



  const checkins =
    await getCheckins(clientId);


  const workouts =
    await getWorkouts(clientId);


  const nutrition =
    await getNutritionPlans(clientId);

console.log("REPORT DATA", {
  client,
  measurements: loadedMeasurements.length,
  checkins: checkins.length,
  workouts: workouts.length,
  nutrition: nutrition.length,
});

const now = new Date();

const days =
  period === "30"
    ? 30
    : period === "90"
    ? 90
    : period === "365"
    ? 365
    : null;

const filteredMeasurements =
  days === null
    ? loadedMeasurements
    : loadedMeasurements.filter((m: any) => {
        const date = m.createdAt?.toDate
          ? m.createdAt.toDate()
          : new Date(m.createdAt);

        return (
          (now.getTime() - date.getTime()) /
            (1000 * 60 * 60 * 24) <=
          days
        );
      });

const filteredCheckins =
  days === null
    ? checkins
    : checkins.filter((c: any) => {
        const date = c.createdAt?.toDate
          ? c.createdAt.toDate()
          : new Date(c.createdAt);

        return (
          (now.getTime() - date.getTime()) /
            (1000 * 60 * 60 * 24) <=
          days
        );
      });


 await generateClientPdf({
  client,
  measurements: filteredMeasurements,
  checkins: filteredCheckins,
  workouts,
  nutrition,
});


}




return (

  <div className="flex items-center gap-3">



    <select
      value={period}
      onChange={(e)=>
        setPeriod(
          e.target.value as ReportPeriod
        )
      }
      className="
      border
      rounded-lg
      px-3
      py-2
      "
    >

      <option value="all">
        Sve
      </option>

      <option value="30">
        Zadnjih 30 dana
      </option>

      <option value="90">
        Zadnjih 90 dana
      </option>

      <option value="365">
        Zadnjih godinu dana
      </option>

    </select>

    <button
      onClick={generatePDF}
      className="
      bg-black
      text-white
      px-5
      py-3
      rounded-xl
      "
    >
      📄 Generiraj PDF
    </button>

  </div>

);

}