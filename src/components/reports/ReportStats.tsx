"use client";

type Props = {
  clients: number;
  measurements: number;
  checkins: number;
  workouts: number;
  nutrition: number;
};

export default function ReportStats({
  clients,
  measurements,
  checkins,
  workouts,
  nutrition,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-500">
          Klijenti
        </div>
        <div className="text-2xl font-bold">
          {clients}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-500">
          Mjerenja
        </div>
        <div className="text-2xl font-bold">
          {measurements}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-500">
          Check-inovi
        </div>
        <div className="text-2xl font-bold">
          {checkins}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-500">
          Treninzi
        </div>
        <div className="text-2xl font-bold">
          {workouts}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-500">
          Prehrana
        </div>
        <div className="text-2xl font-bold">
          {nutrition}
        </div>
      </div>

    </div>
  );
}