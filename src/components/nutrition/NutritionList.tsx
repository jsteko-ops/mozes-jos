"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  deleteNutritionPlan,
  getNutritionPlans,
  updateNutritionPlan,
} from "@/lib/services/klijentiService";


type NutritionPlan = {

  id: string;

  title: string;

  meals: string;

  createdAt?: any;

};


type Props = {

  clientId: string;

  refresh?: boolean;

};


function formatDate(timestamp: any) {

  if (!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleDateString(
    "hr-HR"
  );

}


export default function NutritionList({

  clientId,

  refresh,

}: Props) {


  const [
    plans,
    setPlans,
  ] = useState<NutritionPlan[]>([]);


  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(null);


  const [
    editTitle,
    setEditTitle,
  ] = useState("");


  const [
    editMeals,
    setEditMeals,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);



  async function load() {

    const data =
      await getNutritionPlans(
        clientId
      );


    setPlans(
      data as NutritionPlan[]
    );

  }



  useEffect(() => {

    load();

  }, [
    clientId,
    refresh,
  ]);



  function startEdit(
    plan: NutritionPlan
  ) {

    setEditingId(
      plan.id
    );

    setEditTitle(
      plan.title
    );

    setEditMeals(
      plan.meals
    );

  }



  function cancelEdit() {

    setEditingId(null);

    setEditTitle("");

    setEditMeals("");

  }



  async function saveEdit() {

    if (!editingId) return;


    if (!editTitle.trim()) {

      alert(
        "Upiši naziv plana prehrane."
      );

      return;

    }


    if (!editMeals.trim()) {

      alert(
        "Upiši sadržaj plana prehrane."
      );

      return;

    }


    try {

      setSaving(true);


      await updateNutritionPlan(

        clientId,

        editingId,

        {
          title:
            editTitle.trim(),

          meals:
            editMeals.trim(),
        }

      );


      cancelEdit();

      await load();

    } catch (error) {

      console.error(
        "Greška kod uređivanja plana prehrane:",
        error
      );


      alert(
        "Plan prehrane nije moguće spremiti."
      );

    } finally {

      setSaving(false);

    }

  }



  async function remove(
    id: string
  ) {

    if (
      !confirm(
        "Obrisati plan prehrane?"
      )
    ) {

      return;

    }


    await deleteNutritionPlan(

      clientId,

      id

    );


    if (editingId === id) {

      cancelEdit();

    }


    await load();

  }



  return (

    <div className="border rounded-xl bg-white p-6 space-y-5">


      <h2 className="text-xl font-bold">

        📋 Planovi prehrane

      </h2>


      {
        plans.length === 0

          ? (

            <p>
              Nema spremljenih planova prehrane.
            </p>

          )

          : plans.map((plan) => (


            <div

              key={plan.id}

              className="border rounded-xl p-5 space-y-4"

            >


              {
                editingId === plan.id

                  ? (

                    <div className="space-y-4">


                      <div>

                        <label className="block font-semibold mb-2">

                          Naziv plana

                        </label>


                        <input

                          type="text"

                          value={editTitle}

                          onChange={(event) =>
                            setEditTitle(
                              event.target.value
                            )
                          }

                          className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                          "

                        />

                      </div>


                      <div>

                        <label className="block font-semibold mb-2">

                          Obroci i upute

                        </label>


                        <textarea

                          value={editMeals}

                          onChange={(event) =>
                            setEditMeals(
                              event.target.value
                            )
                          }

                          rows={10}

                          className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                          "

                        />

                      </div>


                      <div className="flex flex-wrap gap-3">

                        <button

                          type="button"

                          onClick={saveEdit}

                          disabled={saving}

                          className="
                            bg-blue-600
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            hover:bg-blue-700
                            disabled:opacity-50
                          "

                        >

                          {
                            saving
                              ? "Spremanje..."
                              : "💾 Spremi izmjene"
                          }

                        </button>


                        <button

                          type="button"

                          onClick={cancelEdit}

                          disabled={saving}

                          className="
                            bg-gray-200
                            text-gray-800
                            px-4
                            py-2
                            rounded-lg
                            hover:bg-gray-300
                            disabled:opacity-50
                          "

                        >

                          Odustani

                        </button>

                      </div>


                    </div>

                  )

                  : (

                    <>


                      <div className="flex justify-between gap-4">

                        <h3 className="font-bold text-lg">

                          🥗 {plan.title}

                        </h3>


                        <span className="text-sm text-gray-500">

                          {formatDate(plan.createdAt)}

                        </span>

                      </div>


                      <div className="whitespace-pre-line">

                        {plan.meals}

                      </div>


                      <div className="flex flex-wrap gap-3">

                        <button

                          type="button"

                          onClick={() =>
                            startEdit(plan)
                          }

                          className="
                            bg-blue-600
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            hover:bg-blue-700
                          "

                        >

                          ✏️ Uredi

                        </button>


                        <button

                          type="button"

                          onClick={() =>
                            remove(plan.id)
                          }

                          className="
                            bg-red-600
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            hover:bg-red-700
                          "

                        >

                          🗑 Obriši

                        </button>

                      </div>


                    </>

                  )
              }


            </div>


          ))
      }


    </div>

  );

}