export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={box}>
      <h2>{title}</h2>
      <p style={{ color: "#6b7280" }}>{description}</p>

      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

const box = {
  padding: 60,
  textAlign: "center" as const,
  border: "1px dashed #e5e7eb",
  borderRadius: 16,
  background: "#fff",
};