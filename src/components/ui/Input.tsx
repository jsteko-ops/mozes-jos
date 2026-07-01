type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ddd",
        marginBottom: 12,
        fontSize: 16,
        boxSizing: "border-box",
      }}
    />
  );
}