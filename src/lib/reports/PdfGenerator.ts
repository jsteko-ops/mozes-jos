import {
  jsPDF,
} from "jspdf";

import autoTable from "jspdf-autotable";


export type GeneratePdfData = {
  client: any;
  measurements: any[];
  checkins: any[];
  workouts: any[];
  nutrition: any[];
  periodLabel?: string;
};


function formatDate(
  value: any
) {
  if (!value) {
    return "-";
  }

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "hr-HR"
  );
}


function valueOrDash(
  value: any
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  const text =
    String(value).trim();

  return text || "-";
}


function ensureSpace(
  pdf: jsPDF,
  currentY: number,
  requiredSpace = 25
) {
  const pageHeight =
    pdf.internal.pageSize
      .getHeight();

  if (
    currentY +
      requiredSpace >
    pageHeight - 20
  ) {
    pdf.addPage();

    return 20;
  }

  return currentY;
}


function lastTableY(
  pdf: jsPDF,
  fallback: number
) {
  const table =
    (pdf as any)
      .lastAutoTable;

  if (
    !table ||
    typeof table.finalY !==
      "number"
  ) {
    return fallback;
  }

  return table.finalY;
}


async function loadPdfFonts(
  pdf: jsPDF
) {
  const loadFont =
    async (
      url: string,
      fileName: string,
      fontName: string,
      fontStyle:
        | "normal"
        | "bold"
    ) => {
      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Font nije moguće učitati: ${url}`
        );
      }

      const buffer =
        await response
          .arrayBuffer();

      const bytes =
        new Uint8Array(
          buffer
        );

      let binary =
        "";

      for (
        let index = 0;
        index < bytes.length;
        index++
      ) {
        binary +=
          String.fromCharCode(
            bytes[index]
          );
      }

      const base64 =
        btoa(binary);

      pdf.addFileToVFS(
        fileName,
        base64
      );

      pdf.addFont(
        fileName,
        fontName,
        fontStyle
      );
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


  pdf.setFont(
    "DejaVuSans",
    "normal"
  );
}


function addSectionTitle(
  pdf: jsPDF,
  title: string,
  currentY: number
) {
  const y =
    ensureSpace(
      pdf,
      currentY,
      20
    );

  pdf.setFont(
    "DejaVuSans",
    "bold"
  );

  pdf.setFontSize(14);

  pdf.text(
    title,
    20,
    y
  );

  pdf.setFont(
    "DejaVuSans",
    "normal"
  );

  return y + 5;
}


export async function generateClientPdf({
  client,
  measurements,
  checkins,
  workouts,
  nutrition,
  periodLabel = "Sve",
}: GeneratePdfData) {
  const pdf =
    new jsPDF();


  await loadPdfFonts(
    pdf
  );


  let y =
    20;


  pdf.setFont(
    "DejaVuSans",
    "bold"
  );

  pdf.setFontSize(
    18
  );

  pdf.text(
    "MOŽEŠ JOŠ",
    20,
    y
  );


  y +=
    10;


  pdf.setFontSize(
    14
  );

  pdf.text(
    "Izvještaj napretka klijenta",
    20,
    y
  );


  y +=
    15;


  pdf.setFont(
    "DejaVuSans",
    "normal"
  );

  pdf.setFontSize(
    11
  );


  pdf.text(
    `Klijent: ${valueOrDash(
      client?.name
    )}`,
    20,
    y
  );


  y +=
    7;


  pdf.text(
    `Email: ${valueOrDash(
      client?.email
    )}`,
    20,
    y
  );


  y +=
    7;


  pdf.text(
    `Razdoblje: ${periodLabel}`,
    20,
    y
  );


  y +=
    15;


  y =
    addSectionTitle(
      pdf,
      "SAŽETAK",
      y
    );


  autoTable(
    pdf,
    {
      startY: y,

      styles: {
        font:
          "DejaVuSans",

        fontSize:
          10,

        cellPadding:
          3,
      },

      headStyles: {
        font:
          "DejaVuSans",

        fontStyle:
          "bold",
      },

      head: [
        [
          "Podatak",
          "Vrijednost",
        ],
      ],

      body: [
        [
          "Mjerenja",
          String(
            measurements.length
          ),
        ],

        [
          "Check-inovi",
          String(
            checkins.length
          ),
        ],

        [
          "Planovi treninga",
          String(
            workouts.length
          ),
        ],

        [
          "Planovi prehrane",
          String(
            nutrition.length
          ),
        ],
      ],
    }
  );


  y =
    lastTableY(
      pdf,
      y
    ) + 15;


  // MJERENJA
  y =
    addSectionTitle(
      pdf,
      "MJERENJA",
      y
    );


  if (
    measurements.length >
    0
  ) {
    autoTable(
      pdf,
      {
        startY: y,

        styles: {
          font:
            "DejaVuSans",

          fontSize:
            9,

          cellPadding:
            2.5,
        },

        headStyles: {
          font:
            "DejaVuSans",

          fontStyle:
            "bold",
        },

        head: [
          [
            "Datum",
            "Težina",
            "Tjelesna mast",
            "Bilješke",
          ],
        ],

        body:
          measurements.map(
            (
              measurement:
                any
            ) => [
              formatDate(
                measurement
                  .createdAt
              ),

              measurement
                  .weight !==
                null &&
              measurement
                  .weight !==
                undefined
                ? `${measurement.weight} kg`
                : "-",

              measurement
                  .bodyFat !==
                null &&
              measurement
                  .bodyFat !==
                undefined
                ? `${measurement.bodyFat}%`
                : "-",

              valueOrDash(
                measurement
                  .notes ??
                  measurement
                    .note
              ),
            ]
          ),
      }
    );


    y =
      lastTableY(
        pdf,
        y
      ) + 15;
  } else {
    pdf.setFontSize(
      10
    );

    pdf.text(
      "Nema mjerenja u odabranom razdoblju.",
      20,
      y + 5
    );

    y +=
      20;
  }


  // CHECK-INOVI
  y =
    addSectionTitle(
      pdf,
      checkins.length > 10
        ? "CHECK-INOVI — 10 NAJNOVIJIH"
        : "CHECK-INOVI",
      y
    );


  if (
    checkins.length >
    0
  ) {
    const latestCheckins =
      [...checkins]
        .sort(
          (
            first: any,
            second: any
          ) => {
            const firstDate =
              first
                ?.createdAt
                ?.toDate
                ? first
                    .createdAt
                    .toDate()
                    .getTime()
                : new Date(
                    first
                      ?.createdAt
                  ).getTime();

            const secondDate =
              second
                ?.createdAt
                ?.toDate
                ? second
                    .createdAt
                    .toDate()
                    .getTime()
                : new Date(
                    second
                      ?.createdAt
                  ).getTime();

            return (
              (
                Number.isNaN(
                  secondDate
                )
                  ? 0
                  : secondDate
              ) -
              (
                Number.isNaN(
                  firstDate
                )
                  ? 0
                  : firstDate
              )
            );
          }
        )
        .slice(
          0,
          10
        );


    autoTable(
      pdf,
      {
        startY: y,

        styles: {
          font:
            "DejaVuSans",

          fontSize:
            8.5,

          cellPadding:
            2.2,
        },

        headStyles: {
          font:
            "DejaVuSans",

          fontStyle:
            "bold",
        },

        head: [
          [
            "Datum",
            "Energija",
            "San",
            "Glad",
            "Komentar",
          ],
        ],

        body:
          latestCheckins.map(
            (
              checkin:
                any
            ) => [
              formatDate(
                checkin
                  .createdAt
              ),

              `${
                checkin
                  .energy ??
                "-"
              }/5`,

              `${
                checkin
                  .sleep ??
                "-"
              }/5`,

              `${
                checkin
                  .hunger ??
                "-"
              }/5`,

              valueOrDash(
                checkin
                  .comment
              ),
            ]
          ),
      }
    );


    y =
      lastTableY(
        pdf,
        y
      ) + 15;
  } else {
    pdf.setFontSize(
      10
    );

    pdf.text(
      "Nema Check-inova u odabranom razdoblju.",
      20,
      y + 5
    );

    y +=
      20;
  }


  // PLANOVI TRENINGA
  y =
    addSectionTitle(
      pdf,
      "PLANOVI TRENINGA",
      y
    );


  if (
    workouts.length >
    0
  ) {
    autoTable(
      pdf,
      {
        startY: y,

        styles: {
          font:
            "DejaVuSans",

          fontSize:
            9,

          cellPadding:
            2.5,

          overflow:
            "linebreak",
        },

        headStyles: {
          font:
            "DejaVuSans",

          fontStyle:
            "bold",
        },

        columnStyles: {
          0: {
            cellWidth:
              30,
          },

          1: {
            cellWidth:
              50,
          },

          2: {
            cellWidth:
              "auto",
          },
        },

        head: [
          [
            "Datum",
            "Naziv",
            "Opis",
          ],
        ],

        body:
          workouts.map(
            (
              workout:
                any
            ) => [
              formatDate(
                workout
                  .createdAt
              ),

              valueOrDash(
                workout
                  .name ??
                  workout
                    .title
              ),

              valueOrDash(
                workout
                  .description
              ),
            ]
          ),
      }
    );


    y =
      lastTableY(
        pdf,
        y
      ) + 15;
  } else {
    pdf.setFontSize(
      10
    );

    pdf.text(
      "Nema planova treninga u odabranom razdoblju.",
      20,
      y + 5
    );

    y +=
      20;
  }


  // PLANOVI PREHRANE
  y =
    addSectionTitle(
      pdf,
      "PLANOVI PREHRANE",
      y
    );


  if (
    nutrition.length >
    0
  ) {
    autoTable(
      pdf,
      {
        startY: y,

        styles: {
          font:
            "DejaVuSans",

          fontSize:
            9,

          cellPadding:
            2.5,

          overflow:
            "linebreak",
        },

        headStyles: {
          font:
            "DejaVuSans",

          fontStyle:
            "bold",
        },

        columnStyles: {
          0: {
            cellWidth:
              30,
          },

          1: {
            cellWidth:
              50,
          },

          2: {
            cellWidth:
              "auto",
          },
        },

        head: [
          [
            "Datum",
            "Naziv",
            "Obroci i upute",
          ],
        ],

        body:
          nutrition.map(
            (
              plan:
                any
            ) => [
              formatDate(
                plan
                  .createdAt
              ),

              valueOrDash(
                plan
                  .title
              ),

              valueOrDash(
                plan
                  .meals
              ),
            ]
          ),
      }
    );


    y =
      lastTableY(
        pdf,
        y
      ) + 15;
  } else {
    pdf.setFontSize(
      10
    );

    pdf.text(
      "Nema planova prehrane u odabranom razdoblju.",
      20,
      y + 5
    );

    y +=
      20;
  }


  const generatedDate =
    new Date()
      .toLocaleDateString(
        "hr-HR"
      );


  const pageCount =
    pdf.getNumberOfPages();


  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    pdf.setPage(
      page
    );

    const pageHeight =
      pdf.internal
        .pageSize
        .getHeight();

    pdf.setFont(
      "DejaVuSans",
      "normal"
    );

    pdf.setFontSize(
      8
    );

    pdf.setTextColor(
      100
    );

    pdf.text(
      `Generirano: ${generatedDate}`,
      20,
      pageHeight - 10
    );

    pdf.text(
      `Stranica ${page} od ${pageCount}`,
      pdf.internal
        .pageSize
        .getWidth() - 20,
      pageHeight - 10,
      {
        align:
          "right",
      }
    );
  }


  pdf.setTextColor(
    0
  );


  const clientName =
    String(
      client?.name ||
        "klijent"
    )
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .toLowerCase();


  pdf.save(
    `mozes-jos-izvjestaj-${
      clientName ||
      "klijent"
    }.pdf`
  );
}