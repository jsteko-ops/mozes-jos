"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function WeightChart({ data }: { data: any[] }) {
  const chartData = data
    .map((m) => ({
      weight: m.weight,
      date: m.createdAt?.seconds
        ? new Date(m.createdAt.seconds * 1000).toLocaleDateString()
        : "",
    }))
    .reverse();

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#000" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}