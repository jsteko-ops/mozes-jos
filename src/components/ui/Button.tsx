type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
        marginRight: 10,
      }}
    >
      {children}
    </button>
  );
}