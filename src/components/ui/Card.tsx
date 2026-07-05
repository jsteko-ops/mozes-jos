export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={box}>
      {children}
    </div>
  );
}

const box = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
};