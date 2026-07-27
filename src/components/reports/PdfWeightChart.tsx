"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Measurement = {
  createdAt: any;
  weight: number;
};

type Props = {
  measurements: Measurement[];
};

function formatDate(value: any) {
  if (!value) return "";

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);

  return date.toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function PdfWeightChart({
  measurements,
}: Props) {

  const data = {
    labels: measurements.map((m) =>
      formatDate(m.createdAt)
    ),

    datasets: [
      {
        label: "Težina (kg)",
        data: measurements.map((m) =>
          Number(m.weight)
        ),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb33",
        borderWidth: 3,
        tension: 0.35,
        fill: false,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: false,
    animation: {
  duration: 0,
},
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div
      style={{
        width: 700,
        height: 350,
        background: "#fff",
        padding: 20,
      }}
    >
      <Line
        data={data}
        options={options}
        width={660}
        height={300}
      />
    </div>
  );
}