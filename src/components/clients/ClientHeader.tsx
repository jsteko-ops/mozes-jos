"use client";

type Client = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  goal?: string;
};

type Props = {
  client: Client;
  onEdit: () => void;
};

export default function ClientHeader({
  client,
  onEdit,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 space-y-3">

      <h2 className="text-2xl font-bold">
        👤 {client.name || "-"}
      </h2>

      <div>
        <b>Email:</b> {client.email || "-"}
      </div>

      <div>
        <b>Telefon:</b> {client.phone || "-"}
      </div>

      <div>
        <b>Napomena:</b> {client.note || "-"}
      </div>

      <div>
        <b>Cilj:</b> {client.goal || "-"}
      </div>

      <button
        onClick={onEdit}
        className="bg-black text-white px-5 py-2 rounded"
      >
        ✏️ Uredi klijenta
      </button>

    </div>
  );
}