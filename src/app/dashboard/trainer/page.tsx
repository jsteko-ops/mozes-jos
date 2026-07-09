"use client";

import Link from "next/link";
import RoleGuard from "@/components/auth/RoleGuard";

export default function TrainerPage() {
  return (
    <RoleGuard allowedRoles={["trainer"]}>
      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Trainer Dashboard 🏋️
          </h1>

          <p className="text-gray-600 mt-2">
            Upravljaj svojim klijentima, treninzima i napretkom.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="border rounded-xl p-5">
            <h2 className="font-semibold">
              Klijenti
            </h2>

            <p className="text-3xl font-bold mt-2">
              0
            </p>

            <p className="text-gray-500">
              Aktivnih klijenata
            </p>
          </div>


          <div className="border rounded-xl p-5">
            <h2 className="font-semibold">
              Treninzi
            </h2>

            <p className="text-3xl font-bold mt-2">
              0
            </p>

            <p className="text-gray-500">
              Kreiranih planova
            </p>
          </div>


          <div className="border rounded-xl p-5">
            <h2 className="font-semibold">
              Napredak
            </h2>

            <p className="text-3xl font-bold mt-2">
              📈
            </p>

            <p className="text-gray-500">
              Praćenje rezultata
            </p>
          </div>

        </div>


        <div className="border rounded-xl p-5">

          <h2 className="text-xl font-bold mb-4">
            Brze akcije
          </h2>


          <Link
            href="/dashboard/trainer/klijenti"
            className="bg-black text-white px-5 py-2 rounded-lg inline-block"
          >
            + Dodaj klijenta
          </Link>


        </div>


      </div>
    </RoleGuard>
  );
}