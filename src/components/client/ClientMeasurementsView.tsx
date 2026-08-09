"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";


type Measurement = {
  id: string;

  weight?: number;

  bodyFat?: number;

  notes?: string;

  height?: number;

  waist?: number;

  chest?: number;

  arm?: number;

  createdAt?: any;

  updatedAt?: any;
};


export default function ClientMeasurementsView({
  clientId,
}: {
  clientId: string;
}) {
  const [
    measurements,
    setMeasurements,
  ] =
    useState<Measurement[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    setLoading(
      true
    );

    setError(
      ""
    );


    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "clients",
          clientId,
          "measurements"
        ),

        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id:
                  item.id,

                ...item.data(),
              })
            ) as Measurement[];


          setMeasurements(
            data
          );

          setLoading(
            false
          );
        },

        (snapshotError) => {
          console.error(
            "Greška kod učitavanja mjerenja:",
            snapshotError
          );


          setError(
            "Mjerenja trenutno nije moguće učitati."
          );

          setLoading(
            false
          );
        }
      );


    return () =>
      unsubscribe();
  }, [
    clientId,
  ]);


  const sortedMeasurements =
    useMemo(
      () =>
        [...measurements].sort(
          (a, b) =>
            getTimestamp(
              b.createdAt ||
                b.updatedAt
            ) -
            getTimestamp(
              a.createdAt ||
                a.updatedAt
            )
        ),
      [measurements]
    );


  const latest =
    sortedMeasurements[0];


  const first =
    sortedMeasurements[
      sortedMeasurements.length -
        1
    ];


  const weightChange =
    latest?.weight != null &&
    first?.weight != null &&
    sortedMeasurements.length >
      1
      ? latest.weight -
        first.weight
      : null;


  if (loading) {
    return (
      <div className="space-y-4">
        <div
          className="
            h-36
            animate-pulse
            rounded-[28px]
            border
            border-[#E5E7EB]
            bg-white
          "
        />

        <div
          className="
            h-72
            animate-pulse
            rounded-[28px]
            border
            border-[#E5E7EB]
            bg-white
          "
        />
      </div>
    );
  }


  if (error) {
    return (
      <div
        className="
          flex
          items-start
          gap-4
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-5
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
            font-black
            text-red-600
          "
        >
          !
        </div>


        <div>
          <p
            className="
              text-sm
              font-black
              text-red-800
            "
          >
            Došlo je do problema
          </p>


          <p
            className="
              mt-1
              text-xs
              leading-5
              text-red-700
            "
          >
            {error}
          </p>
        </div>
      </div>
    );
  }


  if (
    sortedMeasurements.length ===
    0
  ) {
    return (
      <section
        className="
          rounded-[28px]
          border
          border-dashed
          border-[#D8DDD0]
          bg-white
          px-6
          py-12
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-[#16A6A1]/10
            font-black
            text-[#128D89]
          "
        >
          M
        </div>


        <h2
          className="
            mt-4
            text-lg
            font-black
            text-[#15171A]
          "
        >
          Još nema mjerenja
        </h2>


        <p
          className="
            mx-auto
            mt-2
            max-w-md
            text-sm
            leading-6
            text-[#667085]
          "
        >
          Kada trener spremi tvoje
          prvo mjerenje, ovdje ćeš
          moći pratiti promjene kroz
          vrijeme.
        </p>
      </section>
    );
  }


  return (
    <div className="space-y-6">

      {/* SUMMARY */}

      <section
        className="
          grid
          gap-4
          md:grid-cols-3
        "
      >
        <SummaryCard
          label="Broj mjerenja"
          value={String(
            sortedMeasurements.length
          )}
          accent="dark"
        />


        <SummaryCard
          label="Zadnja težina"
          value={
            latest?.weight != null
              ? `${latest.weight} kg`
              : "—"
          }
          accent="lime"
        />


        <SummaryCard
          label="Promjena težine"
          value={
            weightChange == null
              ? "—"
              : formatWeightChange(
                  weightChange
                )
          }
          accent="teal"
        />
      </section>


      {/* HISTORY */}

      <section>
        <div
          className="
            mb-5
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#16A6A1]
              "
            >
              Povijest
            </p>


            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-[#15171A]
              "
            >
              Moja mjerenja
            </h2>


            <p
              className="
                mt-1
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Pregledaj sva spremljena
              mjerenja od najnovijeg
              prema najstarijem.
            </p>
          </div>


          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-3
              rounded-2xl
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-3
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-9
                min-w-9
                items-center
                justify-center
                rounded-xl
                bg-[#111317]
                px-2
                text-sm
                font-black
                text-[#C8D52B]
              "
            >
              {
                sortedMeasurements.length
              }
            </div>


            <span
              className="
                text-xs
                font-bold
                text-[#667085]
              "
            >
              ukupno
            </span>
          </div>
        </div>


        <div className="space-y-4">
          {sortedMeasurements.map(
            (
              measurement,
              index
            ) => (
              <MeasurementCard
                key={
                  measurement.id
                }
                measurement={
                  measurement
                }
                newest={
                  index === 0
                }
              />
            )
          )}
        </div>
      </section>

    </div>
  );
}


function MeasurementCard({
  measurement,
  newest,
}: {
  measurement: Measurement;
  newest: boolean;
}) {
  const hasLegacyFields =
    measurement.height != null ||
    measurement.waist != null ||
    measurement.chest != null ||
    measurement.arm != null;


  const hasModernFields =
    measurement.bodyFat != null ||
    Boolean(
      measurement.notes
    );


  return (
    <article
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-[#EEF0EC]
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#16A6A1]/10
              text-sm
              font-black
              text-[#128D89]
            "
          >
            M
          </div>


          <div>
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#98A2B3]
              "
            >
              Datum mjerenja
            </p>


            <p
              className="
                mt-1
                text-sm
                font-black
                text-[#15171A]
              "
            >
              {formatDate(
                measurement.createdAt ||
                  measurement.updatedAt
              )}
            </p>
          </div>
        </div>


        {newest && (
          <span
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-[#C8D52B]/15
              px-3
              py-2
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-[#68720F]
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#C8D52B]
              "
            />

            Najnovije
          </span>
        )}
      </div>


      {/* PRIMARY METRICS */}

      <div
        className="
          grid
          gap-3
          p-5
          sm:grid-cols-2
          sm:p-6
          lg:grid-cols-3
        "
      >
        <Metric
          label="Težina"
          value={
            measurement.weight != null
              ? `${measurement.weight} kg`
              : "—"
          }
          accent="dark"
        />


        {measurement.bodyFat != null && (
          <Metric
            label="Tjelesna mast"
            value={`${measurement.bodyFat}%`}
            accent="lime"
          />
        )}


        {measurement.height != null && (
          <Metric
            label="Visina"
            value={`${measurement.height} cm`}
            accent="teal"
          />
        )}


        {measurement.waist != null && (
          <Metric
            label="Struk"
            value={`${measurement.waist} cm`}
            accent="light"
          />
        )}


        {measurement.chest != null && (
          <Metric
            label="Prsa"
            value={`${measurement.chest} cm`}
            accent="light"
          />
        )}


        {measurement.arm != null && (
          <Metric
            label="Ruka"
            value={`${measurement.arm} cm`}
            accent="light"
          />
        )}
      </div>


      {/* NOTES */}

      {measurement.notes && (
        <div
          className="
            border-t
            border-[#EEF0EC]
            p-5
            sm:p-6
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#98A2B3]
            "
          >
            Bilješka
          </p>


          <p
            className="
              mt-2
              whitespace-pre-wrap
              text-sm
              font-semibold
              leading-6
              text-[#344054]
            "
          >
            {
              measurement.notes
            }
          </p>
        </div>
      )}


      {/* LEGACY INFO */}

      {hasLegacyFields &&
        !hasModernFields && (
          <div
            className="
              border-t
              border-[#EEF0EC]
              bg-[#F9FAF8]
              px-5
              py-4
              sm:px-6
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-[#98A2B3]
              "
            >
              Ovo mjerenje spremljeno
              je u ranijem sustavu i
              zato sadrži stariji skup
              podataka.
            </p>
          </div>
        )}


      <div
        className="
          h-1
          bg-gradient-to-r
          from-[#16A6A1]
          via-[#C8D52B]
          to-transparent
        "
      />

    </article>
  );
}


function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "dark"
    | "lime"
    | "teal"
    | "light";
}) {
  const colors = {
    dark:
      "bg-[#111317] text-[#C8D52B]",

    lime:
      "bg-[#C8D52B]/15 text-[#68720F]",

    teal:
      "bg-[#16A6A1]/10 text-[#128D89]",

    light:
      "bg-[#F4F6F2] text-[#344054]",
  };


  return (
    <div
      className="
        rounded-2xl
        border
        border-[#EEF0EC]
        bg-white
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-[#98A2B3]
        "
      >
        {label}
      </p>


      <div
        className={`
          mt-3
          inline-flex
          min-h-9
          items-center
          rounded-xl
          px-3
          py-2
          text-sm
          font-black
          ${colors[accent]}
        `}
      >
        {value}
      </div>
    </div>
  );
}


function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "dark"
    | "lime"
    | "teal";
}) {
  const colors = {
    dark:
      "bg-[#111317] text-[#C8D52B]",

    lime:
      "bg-[#C8D52B]/15 text-[#68720F]",

    teal:
      "bg-[#16A6A1]/10 text-[#128D89]",
  };


  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>


      <div
        className={`
          mt-4
          inline-flex
          min-h-11
          max-w-full
          items-center
          rounded-xl
          px-4
          py-2.5
          text-xl
          font-black
          ${colors[accent]}
        `}
      >
        <span
          className="
            truncate
          "
        >
          {value}
        </span>
      </div>
    </div>
  );
}


function formatDate(
  timestamp: any
) {
  if (!timestamp) {
    return "Datum nije dostupan";
  }


  try {
    const date =
      typeof timestamp.toDate ===
      "function"
        ? timestamp.toDate()
        : new Date(
            timestamp
          );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Datum nije dostupan";
    }


    return date.toLocaleDateString(
      "hr-HR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  } catch {
    return "Datum nije dostupan";
  }
}


function getTimestamp(
  value: any
) {
  if (!value) {
    return 0;
  }


  try {
    if (
      typeof value.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .getTime();
    }


    const date =
      new Date(
        value
      );


    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  } catch {
    return 0;
  }
}


function formatWeightChange(
  value: number
) {
  const rounded =
    Math.round(
      value * 10
    ) / 10;


  if (rounded > 0) {
    return `+${rounded} kg`;
  }


  if (rounded < 0) {
    return `${rounded} kg`;
  }


  return "0 kg";
}