"use client";

import { useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";

type Client = {
  id: string;
  name: string;
  email?: string;
  goal?: string;
};

type Tab = "info" | "measurements" | "plans";

export default function ClientTabs({
  client,
}: {
  client: Client;
}) {
  const [tab, setTab] = useState<Tab>("info");

  const tabs = [
    {
      id: "info",
      label: "Info",
    },
    {
      id: "measurements",
      label: "Mjerenja",
    },
    {
      id: "plans",
      label: "Planovi",
    },
  ] as const;

  return (
    <Card>

      <div className="flex gap-2 border-b pb-3 mb-5">

        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`
              px-4
              py-2
              rounded-lg
              text-sm
              font-medium
              transition
              ${
                tab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            {item.label}
          </button>
        ))}

      </div>


      {tab === "info" && (
        <div className="space-y-3">

          <div>
            <p className="text-sm text-gray-500">
              Ime
            </p>
            <p className="font-medium">
              {client.name}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>
            <p className="font-medium">
              {client.email || "Nema email"}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Cilj
            </p>
            <p className="font-medium">
              {client.goal || "Nije postavljen"}
            </p>
          </div>

        </div>
      )}



      {tab === "measurements" && (
        <div>

          <p className="text-gray-600 mb-3">
            Pregled tjelesnih mjerenja
          </p>

          <Link
            href={`/dashboard/clients/${client.id}/measurements`}
            className="text-blue-600 font-medium hover:underline"
          >
            Otvori mjerenja →
          </Link>

        </div>
      )}



      {tab === "plans" && (
        <div>

          <p className="text-gray-600 mb-3">
            Trening planovi klijenta
          </p>

          <Link
            href={`/dashboard/clients/${client.id}/plans`}
            className="text-blue-600 font-medium hover:underline"
          >
            Otvori planove →
          </Link>

        </div>
      )}

    </Card>
  );
}