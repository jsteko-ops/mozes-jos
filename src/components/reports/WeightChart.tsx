"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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
    value.toDate
      ? value.toDate()
      : new Date(value);

  return date.toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function WeightChart({
  measurements,
}: Props) {

  const data = measurements.map((m) => ({
    date: formatDate(m.createdAt),
    weight: Number(m.weight),
  }));

  return (
    <div
      style={{
        width: "100%",
        height: 300,
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}