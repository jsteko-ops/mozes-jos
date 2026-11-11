"use client";

import { useEffect, useState, type FormEvent } from "react";
import { auth } from "@/lib/firebase";

type TrainerOption = {
  uid: string;
  name?: string;
  displayName?: string;
  email?: string;
};

type Props = {
  clientId: string;
  currentTrainerId?: string;
  trainers: TrainerOption[];
  onSaved: () => void;
};

export default function TrainerAssignmentForm({
  clientId,
  currentTrainerId,
  trainers,
  onSaved,
}: Props) {
  const [trainerId, setTrainerId] = useState(currentTrainerId ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTrainerId(currentTrainerId ?? "");
  }, [currentTrainerId]);

  async function saveAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Prijava je potrebna.");

      const token = await user.getIdToken();
      const response = await fetch(
        `/api/clients/${encodeURIComponent(clientId)}/trainer`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trainerId: trainerId || null }),
          cache: "no-store",
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Dodjelu trenera nije moguće spremiti.");
      }

      setMessage("Dodjela trenera je spremljena.");
      onSaved();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Dodjelu trenera nije moguće spremiti."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#15171A] outline-none transition focus:border-[#16A6A1] focus:ring-4 focus:ring-[#16A6A1]/10";

  return (
    <form
      onSubmit={saveAssignment}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#16A6A1]">
          Upravljanje klijentom
        </p>
        <h3 className="mt-1 text-lg font-black text-[#15171A]">
          Dodijeli trenera
        </h3>
        <p className="mt-1 text-sm text-[#667085]">
          Odaberi trenera koji će voditi ovog klijenta.
        </p>
      </div>

      <label
        htmlFor="client-trainer"
        className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#667085]"
      >
        Trener
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          id="client-trainer"
          className={inputClass}
          value={trainerId}
          onChange={(event) => setTrainerId(event.target.value)}
          disabled={saving || trainers.length === 0}
        >
          <option value="">
            Nije dodijeljen
          </option>
          {trainers.map((trainer) => (
            <option key={trainer.uid} value={trainer.uid}>
              {trainer.name || trainer.displayName || trainer.email || "Trener"}
              {trainer.email ? ` · ${trainer.email}` : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving || trainers.length === 0}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#111317] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#202328] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Spremanje..." : "Spremi dodjelu"}
        </button>
      </div>

      {trainers.length === 0 && (
        <p className="mt-3 text-sm text-[#667085]">
          Najprije dodaj trenera u tim teretane.
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-[#128D89]">
          {message}
        </p>
      )}
    </form>
  );
}
