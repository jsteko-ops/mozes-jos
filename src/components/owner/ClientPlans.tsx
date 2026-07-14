"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Plan = {
  id: string;
  title: string;
  exercises: string;
  createdAt?: any;
};

export default function ClientPlans({
  clientId,
}: {
  clientId: string;
}) {

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, [clientId]);

  async function loadPlans() {

    try {

      const q = query(
        collection(
          db,
          "clients",
          clientId,
          "workouts"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

      const snap = await getDocs(q);

      setPlans(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Plan[]
      );

    } catch (error) {

      console.error(
        "Greška planovi:",
        error
      );

    }

    setLoading(false);

  }

  if (loading) {
    return (
      <p>
        Učitavanje planova...
      </p>
    );
  }

  return (

    <div className="mt-6 rounded-xl border bg-white p-6">

      <h2 className="text-xl font-bold mb-4">
        🏋️ Trening planovi
      </h2>

      {plans.length === 0 ? (

        <p>
          Nema trening planova.
        </p>

      ) : (

        <div className="space-y-3">

          {plans.map((plan) => (

            <div
              key={plan.id}
              className="border rounded-lg p-4"
            >

              <h3 className="font-bold text-lg">
                {plan.title}
              </h3>

              <p className="text-gray-600 whitespace-pre-line">
                {plan.exercises}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Dodano:{" "}
                {plan.createdAt?.toDate
                  ? plan.createdAt
                      .toDate()
                      .toLocaleDateString("hr-HR")
                  : "-"}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}