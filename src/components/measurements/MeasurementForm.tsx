"use client";

import {
  useState,
} from "react";

import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


export default function MeasurementForm({
  clientId,
  onCreated,
}: {
  clientId: string;
  onCreated: () => void;
}) {

 const {
  user,
  userProfile,
} = useAuth();


  const [
    weight,
    setWeight,
  ] = useState("");


  const [
    bodyFat,
    setBodyFat,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  async function addMeasurement() {

    if (!user) {

      alert(
        "Moraš biti prijavljen."
      );

      return;

    }


    const cleanClientId =
      clientId.trim();


    if (!cleanClientId) {

      alert(
        "Nedostaje oznaka klijenta."
      );

      return;

    }


    const parsedWeight =
      Number(
        weight.replace(
          ",",
          "."
        )
      );


    if (
      !Number.isFinite(
        parsedWeight
      ) ||
      parsedWeight <= 0
    ) {

      alert(
        "Upiši ispravnu težinu."
      );

      return;

    }


    const parsedBodyFat =
      bodyFat.trim()
        ? Number(
            bodyFat.replace(
              ",",
              "."
            )
          )
        : null;


    if (
      parsedBodyFat !== null &&
      (
        !Number.isFinite(
          parsedBodyFat
        ) ||
        parsedBodyFat < 0 ||
        parsedBodyFat > 100
      )
    ) {

      alert(
        "Postotak tjelesne masti mora biti između 0 i 100."
      );

      return;

    }

const existingMeasurements =
  await getDocs(
    collection(
      db,
      "clients",
      cleanClientId,
      "measurements"
    )
  );

const hasExistingMeasurement =
  !existingMeasurements.empty;

const hasPro =
  userProfile?.isPremium === true &&
  userProfile?.subscriptionStatus === "active";

if (
  hasExistingMeasurement &&
  !hasPro
) {
  alert(
    "Prvo mjerenje je besplatno. Za dodatna mjerenja i praćenje napretka potreban je Možeš Još Pro."
  );

  return;
}

    try {

      setSaving(
        true
      );


      const measurementsReference =
        collection(
          db,
          "clients",
          cleanClientId,
          "measurements"
        );


      await addDoc(
        measurementsReference,
        {
          weight:
            parsedWeight,

          bodyFat:
            parsedBodyFat,

          notes:
            notes.trim(),

          trainerId:
            user.uid,

          createdBy:
            user.uid,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );


      setWeight(
        ""
      );

      setBodyFat(
        ""
      );

      setNotes(
        ""
      );


      await Promise.resolve(
        onCreated()
      );


      alert(
        "Mjerenje je uspješno dodano ✅"
      );

    } catch (
      error
    ) {

      console.error(
        "Greška kod dodavanja mjerenja:",
        error
      );


      alert(
        "Mjerenje nije moguće spremiti."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  return (

    <div className="space-y-3 rounded-xl border bg-white p-4">


      <input
        type="number"
        min="0"
        step="0.1"
        placeholder="Težina (kg)"
        value={
          weight
        }
        onChange={(
          event
        ) =>
          setWeight(
            event.target.value
          )
        }
        disabled={
          saving
        }
        className="w-full rounded border p-2 disabled:bg-gray-100"
      />


      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        placeholder="Tjelesna mast % (opcionalno)"
        value={
          bodyFat
        }
        onChange={(
          event
        ) =>
          setBodyFat(
            event.target.value
          )
        }
        disabled={
          saving
        }
        className="w-full rounded border p-2 disabled:bg-gray-100"
      />


      <textarea
        placeholder="Bilješke"
        value={
          notes
        }
        onChange={(
          event
        ) =>
          setNotes(
            event.target.value
          )
        }
        disabled={
          saving
        }
        className="w-full rounded border p-2 disabled:bg-gray-100"
      />


      <button
        type="button"
        onClick={() =>
          void addMeasurement()
        }
        disabled={
          saving
        }
        className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >

        {saving
          ? "Spremanje..."
          : "Dodaj mjerenje"}

      </button>


    </div>

  );

}