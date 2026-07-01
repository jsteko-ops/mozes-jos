type CardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function Card({ title, children }: CardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: 20,
      }}
    >
      {title && (
        <h2
          style={{
            marginBottom: 16,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}