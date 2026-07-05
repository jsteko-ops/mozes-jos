export default function Skeleton({
  height = 20,
}: {
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        background: "#eee",
        borderRadius: 8,
        animation: "pulse 1.5s infinite",
      }}
    />
  );
}