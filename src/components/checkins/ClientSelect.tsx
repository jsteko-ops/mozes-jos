"use client";

interface Client {
  id: string;
  name: string;
}

interface ClientSelectProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  onLoadHistory: () => void;
}

export default function ClientSelect({
  clients,
  value,
  onChange,
  onLoadHistory,
}: ClientSelectProps) {
  return (
    <div className="border rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-bold">
        👤 Odaberi klijenta
      </h2>

      <select
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Odaberi klijenta</option>

        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <button
        className="bg-gray-200 hover:bg-gray-300 transition px-4 py-2 rounded"
        onClick={onLoadHistory}
        disabled={!value}
      >
        📋 Učitaj povijest
      </button>
    </div>
  );
}