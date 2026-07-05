"use client";

import UpgradeButton from "./UpgradeButton";

export default function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Unlock Pro 🚀</h2>
        <p style={{ color: "#6b7280" }}>
          Upgrade to unlock analytics & unlimited clients
        </p>

        <UpgradeButton plan="pro" />

        <button className="btn btn-secondary" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  width: 400,
};