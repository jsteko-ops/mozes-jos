"use client";

import { jsPDF } from "jspdf";

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


async function generatePDF(){


  const client =
    await getClient(clientId);


  if(!client){

    alert(
      "Klijent nije pronađen"
    );

    return;

  }


  const measurements =
    await getMeasurements(clientId);


  const checkins =
    await getCheckins(clientId);


  const workouts =
    await getWorkouts(clientId);


  const nutrition =
    await getNutritionPlans(clientId);




  const pdf =
    new jsPDF();



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


  pdf.setFontSize(10);



  if(measurements.length===0){

    pdf.text(
      "Nema mjerenja.",
      20,
      y
    );

    y += 8;

  }



  measurements.forEach((m:any)=>{


    pdf.text(

      `${formatDate(m.createdAt)} | ${m.weight} kg | struk ${m.waist} cm | prsa ${m.chest} cm | ruka ${m.arm} cm`,

      20,

      y

    );


    y += 7;



    if(y>270){

      pdf.addPage();

      y=20;

    }


  });




  y += 10;



  pdf.setFontSize(14);

  pdf.text(
    "CHECK-INOVI",
    20,
    y
  );


  y += 8;


  pdf.setFontSize(10);



  if(checkins.length===0){

    pdf.text(
      "Nema check-inova.",
      20,
      y
    );

    y+=8;

  }



  checkins.slice(0,10)
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




  pdf.save(

    `${client.name}-izvjestaj.pdf`

  );


}





return (

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

📄 Generiraj PDF izvještaj

</button>

);


}