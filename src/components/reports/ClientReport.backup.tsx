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


export default function ClientReport({
  clientId,
}:Props){



  async function generatePDF(){


    const client =
      await getClient(clientId);


    const measurements =
      await getMeasurements(clientId);


    const checkins =
      await getCheckins(clientId);


    const workouts =
      await getWorkouts(clientId);


    const nutrition =
      await getNutritionPlans(clientId);




    if(!client){

      alert("Klijent nije pronađen");

      return;

    }




    const pdf =
      new jsPDF();




    let y = 20;



    pdf.setFontSize(18);

    pdf.text(
      "MOŽEŠ JOŠ - Izvještaj klijenta",
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


    y += 8;


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



    pdf.setFontSize(11);



    measurements.forEach((m:any)=>{


      pdf.text(

        `${m.weight} kg | struk ${m.waist} | prsa ${m.chest} | ruka ${m.arm}`,

        20,

        y

      );


      y += 7;



      if(y > 270){

        pdf.addPage();

        y = 20;

      }


    });




    y += 10;



    pdf.setFontSize(14);

    pdf.text(
      "CHECK-IN",
      20,
      y
    );


    y += 8;



    pdf.setFontSize(11);



    checkins.slice(0,5).forEach((c:any)=>{


      pdf.text(

        `Energija: ${c.energy} | San: ${c.sleep} | Glad: ${c.hunger}`,

        20,

        y

      );


      y += 7;


    });




    y += 10;



    pdf.setFontSize(14);


    pdf.text(
      "PLANOVI",
      20,
      y
    );


    y += 8;



    pdf.setFontSize(11);



    pdf.text(

      `Trening planova: ${workouts.length}`,

      20,

      y

    );


    y += 7;



    pdf.text(

      `Planova prehrane: ${nutrition.length}`,

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