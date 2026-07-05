import UpgradeButton from "@/components/UpgradeButton";

export default function LockedFeature({ title }: any) {
  return (
    <div style={wrap}>
      <div style={box}>
        <h2>🔒 {title}</h2>
        <p style={{ color: "#6b7280" }}>
          This feature is available on Pro plan.
        </p>

        <UpgradeButton plan="pro" />
      </div>
    </div>
  );
}

const wrap = {
  padding: 20,
};

const box = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  textAlign: "center" as const,
};