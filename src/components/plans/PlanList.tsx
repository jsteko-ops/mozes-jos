"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";

type Plan = {
  id: string;
  name: string;
  description?: string;
};


export default function PlanList({
  plans,
  clientId,
}: {
  plans: Plan[];
  clientId: string;
}) {

  if (plans.length === 0) {
    return (
      <Card>
        <p className="text-gray-500">
          Nema trening planova.
        </p>
      </Card>
    );
  }


  return (
    <div className="space-y-4">

      {plans.map((plan) => (

        <Link
          key={plan.id}
          href={`/dashboard/clients/${clientId}/plans/${plan.id}`}
          className="block hover:-translate-y-1 transition"
        >

          <Card>

            <h3 className="font-semibold text-lg">
              {plan.name}
            </h3>

            <p className="text-gray-600 mt-1">
              {plan.description || "Bez opisa"}
            </p>

            <p className="text-blue-600 text-sm mt-3">
              Otvori plan →
            </p>

          </Card>

        </Link>

      ))}

    </div>
  );
}