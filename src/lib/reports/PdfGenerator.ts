import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


export type GeneratePdfData = {
  client: any;
  measurements: any[];
  checkins: any[];
  workouts: any[];
  nutrition: any[];
};


function formatDate(value:any){

  if(!value) return "-";

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);


  return date.toLocaleDateString(
    "hr-HR"
  );

}



async function loadPdfFonts(pdf: jsPDF) {
  const loadFont = async (
    url: string,
    fileName: string,
    fontName: string,
    fontStyle: "normal" | "bold"
  ) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);

    pdf.addFileToVFS(fileName, base64);
    pdf.addFont(fileName, fontName, fontStyle);
  };

  await loadFont(
    "/fonts/DejaVuSans.ttf",
    "DejaVuSans.ttf",
    "DejaVuSans",
    "normal"
  );

  await loadFont(
    "/fonts/DejaVuSans-Bold.ttf",
    "DejaVuSans-Bold.ttf",
    "DejaVuSans",
    "bold"
  );

  pdf.setFont("DejaVuSans", "normal");
}

export async function generateClientPdf({

  client,
  measurements,
  checkins,
  workouts,
  nutrition,

}:GeneratePdfData){


const pdf =
  new jsPDF();

await loadPdfFonts(pdf);


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
  "SAŽETAK",
  20,
  y
);


y += 5;


autoTable(pdf,{
styles: { font: "DejaVuSans" },
headStyles: { font: "DejaVuSans", fontStyle: "bold" },

startY:y,

head:[

[
"Podatak",
"Vrijednost"
]

],


body:[

[
"Mjerenja",
String(measurements.length)
],

[
"Check-inovi",
String(checkins.length)
],

[
"Planovi treninga",
String(workouts.length)
],

[
"Planovi prehrane",
String(nutrition.length)
]

]

});


y =
(pdf as any)
.lastAutoTable
.finalY + 15;

pdf.setFontSize(14);

pdf.text(
  "MJERENJA",
  20,
  y
);


y += 5;


if(measurements.length > 0){

autoTable(pdf,{
styles: { font: "DejaVuSans" },
headStyles: { font: "DejaVuSans", fontStyle: "bold" },

startY:y,

head: [["Datum", "Težina", "Tjelesna mast", "Bilješke"]],

body: measurements.map((m: any) => [
  formatDate(m.createdAt),
  `${m.weight ?? "-"} kg`,
  m.bodyFat !== null && m.bodyFat !== undefined ? `${m.bodyFat}%` : "-",
  m.notes || "-",
])


});


y =
(pdf as any)
.lastAutoTable
.finalY + 15;


}else{


pdf.text(
  "Nema mjerenja.",
  20,
  y
);


y += 15;

}




pdf.setFontSize(14);


pdf.text(
  "CHECK-INOVI",
  20,
  y
);


y += 5;



autoTable(pdf,{
styles: { font: "DejaVuSans" },
headStyles: { font: "DejaVuSans", fontStyle: "bold" },

startY:y,


head:[

[
"Datum",
"Energija",
"San",
"Glad",
"Komentar"
]

],


body:

checkins
.slice(0,10)
.map((c:any)=>[

formatDate(c.createdAt),

`${c.energy ?? "-"}/5`,

`${c.sleep ?? "-"}/5`,

`${c.hunger ?? "-"}/5`,

c.comment || "-"

])


});


y =
(pdf as any)
.lastAutoTable
.finalY + 15;




pdf.setFontSize(14);


pdf.text(
  "PLANOVI",
  20,
  y
);



autoTable(pdf,{
styles: { font: "DejaVuSans" },
headStyles: { font: "DejaVuSans", fontStyle: "bold" },

startY:y+5,


head:[

[
"Vrsta",
"Broj"
]

],


body:[

[
"Trening",
String(workouts.length)
],

[
"Prehrana",
String(nutrition.length)
]

]

});



pdf.setFontSize(10);


pdf.text(

`Generirano: ${new Date().toLocaleDateString("hr-HR")}`,

20,

(pdf as any)
.lastAutoTable
.finalY + 15

);



pdf.save(

`${client.name}-izvjestaj.pdf`

);


}





