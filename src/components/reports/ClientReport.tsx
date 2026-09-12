"use client";

import {
  useState,
} from "react";

import {
  getClient,
  getMeasurements,
  getCheckins,
  getWorkouts,
  getNutritionPlans,
} from "@/lib/services/klijentiService";

import {
  generateClientPdf,
} from "@/lib/reports/PdfGenerator";


type Props = {
  clientId: string;
};


type ReportPeriod =
  | "all"
  | "30"
  | "90"
  | "365";


function getDate(
  value: any
): Date | null {
  if (!value) {
    return null;
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
    return null;
  }

  return date;
}


function isWithinPeriod(
  value: any,
  days: number | null,
  now: Date
) {
  if (days === null) {
    return true;
  }

  const date =
    getDate(value);

  if (!date) {
    return false;
  }

  const difference =
    (
      now.getTime() -
      date.getTime()
    ) /
    (
      1000 *
      60 *
      60 *
      24
    );

  return (
    difference >= 0 &&
    difference <= days
  );
}


function getPeriodLabel(
  period: ReportPeriod
) {
  switch (period) {
    case "30":
      return "Zadnjih 30 dana";

    case "90":
      return "Zadnjih 90 dana";

    case "365":
      return "Zadnjih godinu dana";

    default:
      return "Sve";
  }
}


export default function ClientReport({
  clientId,
}: Props) {
  const [
    period,
    setPeriod,
  ] =
    useState<ReportPeriod>(
      "all"
    );


  const [
    generating,
    setGenerating,
  ] =
    useState(false);


  async function generatePDF() {
    if (generating) {
      return;
    }

    try {
      setGenerating(true);


      const client =
        await getClient(
          clientId
        );


      if (!client) {
        alert(
          "Klijent nije pronađen."
        );

        return;
      }


      const [
        loadedMeasurements,
        loadedCheckins,
        loadedWorkouts,
        loadedNutrition,
      ] =
        await Promise.all([
          getMeasurements(
            clientId
          ),

          getCheckins(
            clientId
          ),

          getWorkouts(
            clientId
          ),

          getNutritionPlans(
            clientId
          ),
        ]);


      const now =
        new Date();


      const days =
        period === "30"
          ? 30
          : period === "90"
          ? 90
          : period === "365"
          ? 365
          : null;


      const filteredMeasurements =
        loadedMeasurements.filter(
          (measurement: any) =>
            isWithinPeriod(
              measurement.createdAt,
              days,
              now
            )
        );


      const filteredCheckins =
        loadedCheckins.filter(
          (checkin: any) =>
            isWithinPeriod(
              checkin.createdAt,
              days,
              now
            )
        );


      const filteredWorkouts =
        loadedWorkouts.filter(
          (workout: any) =>
            isWithinPeriod(
              workout.createdAt,
              days,
              now
            )
        );


      const filteredNutrition =
        loadedNutrition.filter(
          (plan: any) =>
            isWithinPeriod(
              plan.createdAt,
              days,
              now
            )
        );


      await generateClientPdf({
        client,

        measurements:
          filteredMeasurements,

        checkins:
          filteredCheckins,

        workouts:
          filteredWorkouts,

        nutrition:
          filteredNutrition,

        periodLabel:
          getPeriodLabel(
            period
          ),
      });
    } catch (error) {
      console.error(
        "Greška kod generiranja PDF izvještaja:",
        error
      );

      alert(
        "PDF izvještaj nije moguće generirati."
      );
    } finally {
      setGenerating(false);
    }
  }


  return (
    <div
      className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
      "
    >
      <div>
        <label
          className="
            mb-1.5
            block
            text-[10px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-[#98A2B3]
          "
        >
          Razdoblje
        </label>


        <select
          value={period}
          disabled={
            generating
          }
          onChange={(
            event
          ) =>
            setPeriod(
              event.target
                .value as
                ReportPeriod
            )
          }
          className="
            min-h-11
            rounded-xl
            border
            border-[#E5E7EB]
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-[#15171A]
            outline-none
            transition
            focus:border-[#16A6A1]
            focus:ring-4
            focus:ring-[#16A6A1]/10
            disabled:cursor-not-allowed
            disabled:opacity-60
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
      </div>


      <button
        type="button"
        onClick={() =>
          void generatePDF()
        }
        disabled={
          generating
        }
        className="
          mt-auto
          inline-flex
          min-h-11
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#111317]
          px-5
          py-3
          text-sm
          font-bold
          text-white
          shadow-sm
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:bg-[#202328]
          hover:shadow-md
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:translate-y-0
        "
      >
        {generating ? (
          <>
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/30
                border-t-[#C8D52B]
              "
            />

            Generiranje...
          </>
        ) : (
          <>
            <span
              className="
                font-black
                text-[#C8D52B]
              "
            >
              ↓
            </span>

            Generiraj PDF
          </>
        )}
      </button>
    </div>
  );
}