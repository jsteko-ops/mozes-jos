"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";

type Client = {
  id: string;
  name: string;
  email: string;
  goal?: string;
};

export default function ClientList({
  clients,
}: {
  clients: Client[];
}) {
  if (clients.length === 0) {
    return (
      <Card>
        <p className="text-gray-500">
          Nema dodanih klijenata.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">

      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/dashboard/clients/${client.id}`}
          className="transition-transform hover:-translate-y-1"
        >
          <Card>

            <div className="space-y-2">

              <h3 className="text-lg font-semibold">
                {client.name}
              </h3>

              <p className="text-sm text-gray-600">
                {client.email}
              </p>

              <p className="text-sm text-gray-500">
                Cilj: {client.goal}
              </p>

            </div>

          </Card>
        </Link>
      ))}

    </div>
  );
}