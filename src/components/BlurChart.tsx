"use client";

import UpgradeButton from "@/components/UpgradeButton";

export default function BlurChart() {
  return (
    <div style={wrap}>
      <div style={chartMock}>
        📈 Analytics Chart
      </div>

      <div style={overlay}>
        <h3>Unlock full analytics</h3>
        <p>See progress trends and performance insights</p>
        <UpgradeButton plan="pro" />
      </div>
    </div>
  );
}

const wrap = {
  position: "relative" as const,
  height: 220,
  borderRadius: 16,
  overflow: "hidden" as const,
  border: "1px solid #eee",
};

const chartMock = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  filter: "blur(4px)",
  background: "#f5f5f5",
  fontSize: 20,
};

const overlay = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(6px)",
  textAlign: "center" as const,
  padding: 20,
};