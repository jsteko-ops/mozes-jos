"use client";

type Props = {
  clientId: string;
};

export default function ClientDashboard({ clientId }: Props) {
  return (
    <div className="space-y-4">

      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-bold">
          Dashboard klijenta
        </h2>

        <p className="text-sm text-gray-500">
          Klijent ID: {clientId}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-xl border p-4">
          📋 Planovi
        </div>

        <div className="rounded-xl border p-4">
          ✅ Check-in
        </div>

        <div className="rounded-xl border p-4">
          🥗 Prehrana
        </div>

        <div className="rounded-xl border p-4">
          💬 Chat
        </div>

        <div className="rounded-xl border p-4">
          📊 Izvještaji
        </div>

      </div>

    </div>
  );
}