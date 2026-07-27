"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import WeightChart from "@/components/reports/WeightChart";
import html2canvas from "html2canvas";
import ReportStats from "@/components/reports/ReportStats";

import {
  getClient,
  getMeasurements,
  getCheckins,
  getWorkouts,
  getNutritionPlans,
} from "@/lib/services/klijentiService";


type Props = {
  clientId:string;
};
type ReportPeriod =
  | "all"
  | "30"
  | "90"
  | "365";

function formatDate(value:any){

  if(!value) return "-";

  const date =
    value.toDate
      ? value.toDate()
      : new Date(value);


  return date.toLocaleDateString(
    "hr-HR"
  );

}



export default function ClientReport({
  clientId,
}:Props){

const [period, setPeriod] =
  useState<ReportPeriod>("all");

const [measurements, setMeasurements] =
  useState<any[]>([]);

async function generatePDF(){


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

setMeasurements(loadedMeasurements);


  const checkins =
    await getCheckins(clientId);


  const workouts =
    await getWorkouts(clientId);


  const nutrition =
    await getNutritionPlans(clientId);


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

  const pdf =
    new jsPDF();

const chartElement =
  document.getElementById(
    "weight-chart"
  );

let chartImage = null;


if(chartElement){

  const canvas =
    await html2canvas(
      chartElement
    );

  chartImage =
    canvas.toDataURL(
      "image/png"
    );

}



const chart =
  document.getElementById("weight-chart");


if(chart){

  const canvas =
    await html2canvas(chart);


  const imgData =
    canvas.toDataURL("image/png");


  pdf.addImage(
    imgData,
    "PNG",
    20,
    20,
    170,
    85
  );

}

  let y = 20;



  pdf.setFontSize(18);

  pdf.text(
    "MOŽEŠ JOŠ",
    20,
    y
  );


  y += 10;


  pdf.setFontSize(14);

  pdf.text(
    "Izvještaj napretka klijenta",
    20,
    y
  );


  y += 15;



  pdf.setFontSize(12);


  pdf.text(
    `Klijent: ${client.name}`,
    20,
    y
  );


  y += 7;


  pdf.text(
    `Email: ${client.email}`,
    20,
    y
  );



  y += 15;



  pdf.setFontSize(14);

  pdf.text(
    "MJERENJA",
    20,
    y
  );


  y += 8;

const firstMeasurement =
  filteredMeasurements.length > 0
    ? (filteredMeasurements[0] as any)
    : null;

const lastMeasurement =
  filteredMeasurements.length > 0
    ? (filteredMeasurements[filteredMeasurements.length - 1] as any)
    : null;

let weightChange = 0;

if (firstMeasurement && lastMeasurement) {
  weightChange =
    Number(lastMeasurement.weight) -
    Number(firstMeasurement.weight);
}

pdf.setFontSize(14);

pdf.text(
  "SAŽETAK",
  20,
  y
);

y += 8;

pdf.setFontSize(11);

pdf.text(
 `Ukupno mjerenja: ${filteredMeasurements.length}`,
  20,
  y
);

y += 7;

pdf.text(
  `Ukupno check-inova: ${checkins.length}`,
  20,
  y
);

y += 7;

pdf.text(
  `Početna težina: ${firstMeasurement ? firstMeasurement.weight : "-"} kg`,
  20,
  y
);

y += 7;

pdf.text(
  `Trenutna težina: ${lastMeasurement ? lastMeasurement.weight : "-"} kg`,
  20,
  y
);

y += 7;

pdf.text(
  `Promjena težine: ${weightChange > 0 ? "+" : ""}${weightChange} kg`,
  20,
  y
);

y += 15;

  pdf.setFontSize(14);

pdf.text(
  "MJERENJA",
  20,
  y
);

y += 5;

if (filteredMeasurements.length > 0) {

  autoTable(pdf, {
    startY: y,
    head: [[
      "Datum",
      "Težina",
      "Struk",
      "Prsa",
      "Ruka"
    ]],
   body: filteredMeasurements.map((m:any)=>[
      formatDate(m.createdAt),
      `${m.weight} kg`,
      `${m.waist} cm`,
      `${m.chest} cm`,
      `${m.arm} cm`,
    ]),
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [30, 30, 30],
    },
  });

  y = (pdf as any).lastAutoTable.finalY + 10;

} else {

  pdf.text(
    "Nema mjerenja.",
    20,
    y
  );

  y += 10;

}


  y += 10;



  pdf.setFontSize(14);

  pdf.text(
    "CHECK-INOVI",
    20,
    y
  );


  y += 8;


  pdf.setFontSize(10);



if(filteredCheckins.length===0){

    pdf.text(
      "Nema check-inova.",
      20,
      y
    );

    y+=8;

  }



  filteredCheckins.slice(0,10)
  .forEach((c:any)=>{


    pdf.text(

      `${formatDate(c.createdAt)} | Energija ${c.energy}/5 | San ${c.sleep}/5 | Glad ${c.hunger}/5`,

      20,

      y

    );


    y+=7;



    if(c.comment){

      pdf.text(

        `Komentar: ${c.comment}`,

        25,

        y

      );

      y+=7;

    }



    if(c.trainerComment){

      pdf.text(

        `Trener: ${c.trainerComment}`,

        25,

        y

      );

      y+=7;

    }


    if(y>270){

      pdf.addPage();

      y=20;

    }


  });




  y+=10;



  pdf.setFontSize(14);

  pdf.text(
    "PLANOVI",
    20,
    y
  );


  y+=8;


  pdf.setFontSize(11);


  pdf.text(
    `Trening planova: ${workouts.length}`,
    20,
    y
  );


  y+=7;


  pdf.text(
    `Planova prehrane: ${nutrition.length}`,
    20,
    y
  );




  y+=15;


  pdf.setFontSize(9);


  pdf.text(

    `Generirano: ${new Date().toLocaleDateString("hr-HR")}`,

    20,

    y

  );


if(chartImage){

  pdf.addPage();

  pdf.setFontSize(16);

  pdf.text(
    "Graf promjene težine",
    20,
    20
  );

  pdf.addImage(
    chartImage,
    "PNG",
    20,
    30,
    170,
    80
  );

}

  pdf.save(

    `${client.name}-izvjestaj.pdf`

  );


}




return (

  <div className="flex items-center gap-3">

<div
  id="weight-chart"
  style={{
  position:"absolute",
left:"-9999px",
width:"600px"
  }}
>
<WeightChart
  measurements={measurements}
/>
</div>

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