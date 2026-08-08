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


function formatDate(
  timestamp: any
) {
  if (!timestamp) {
    return "-";
  }

  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

  return date.toLocaleDateString(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


export default function NutritionList({
  clientId,
  refresh,
}: Props) {
  const [
    plans,
    setPlans,
  ] =
    useState<NutritionPlan[]>(
      []
    );


  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );


  const [
    editTitle,
    setEditTitle,
  ] =
    useState("");


  const [
    editMeals,
    setEditMeals,
  ] =
    useState("");


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  async function load() {
    if (!clientId) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getNutritionPlans(
          clientId
        );

      setPlans(
        data as NutritionPlan[]
      );
    } catch (error) {
      console.error(
        "Greška kod učitavanja planova prehrane:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void load();
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
    if (!editingId) {
      return;
    }


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
      !window.confirm(
        "Obrisati plan prehrane?"
      )
    ) {
      return;
    }


    try {
      await deleteNutritionPlan(
        clientId,
        id
      );

      if (
        editingId === id
      ) {
        cancelEdit();
      }

      await load();
    } catch (error) {
      console.error(
        "Greška kod brisanja plana prehrane:",
        error
      );

      alert(
        "Plan prehrane nije moguće obrisati."
      );
    }
  }


  const inputClass = `
    w-full
    rounded-xl
    border
    border-[#E5E7EB]
    bg-white
    px-4
    py-3
    text-sm
    text-[#15171A]
    outline-none
    transition
    placeholder:text-[#98A2B3]
    focus:border-[#16A6A1]
    focus:ring-4
    focus:ring-[#16A6A1]/10
    disabled:cursor-not-allowed
    disabled:bg-[#F4F6F2]
  `;


  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Biblioteka prehrane
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              tracking-tight
              text-[#15171A]
            "
          >
            Planovi prehrane
          </h2>

          <p
            className="
              mt-1
              max-w-xl
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Pregledaj, izmijeni ili
            ukloni spremljene planove
            prehrane ovog klijenta.
          </p>
        </div>


        {!loading && (
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-[#16A6A1]/10
              px-3
              py-2
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#16A6A1]
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-[#128D89]
              "
            >
              {plans.length}{" "}
              {plans.length === 1
                ? "plan"
                : "planova"}
            </span>
          </div>
        )}
      </div>


      {/* LOADING */}

      {loading && (
        <div
          className="
            grid
            gap-4
            lg:grid-cols-2
          "
        >
          {[1, 2].map(
            (item) => (
              <div
                key={item}
                className="
                  h-56
                  animate-pulse
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  bg-white
                "
              />
            )
          )}
        </div>
      )}


      {/* EMPTY */}

      {!loading &&
        plans.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D8DDD0]
              bg-white
              px-6
              py-12
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]/15
                text-xl
              "
            >
              🥗
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Još nema planova prehrane
            </h3>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Kreiraj prvi plan prehrane
              pomoću obrasca iznad.
            </p>
          </div>
        )}


      {/* PLANOVI */}

      {!loading &&
        plans.length > 0 && (
          <div
            className="
              grid
              gap-4
              lg:grid-cols-2
            "
          >
            {plans.map(
              (
                plan,
                index
              ) => (
                <div
                  key={plan.id}
                  className="
                    group
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-[#C8D52B]
                    hover:shadow-md
                  "
                >

                  {/* CARD HEADER */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                      border-b
                      border-[#EEF0EC]
                      bg-[#FBFCFA]
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#111317]
                          text-base
                          font-black
                          text-[#C8D52B]
                        "
                      >
                        🥗
                      </div>


                      <div
                        className="
                          min-w-0
                        "
                      >
                        <p
                          className="
                            truncate
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          {plan.title}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#98A2B3]
                          "
                        >
                          {formatDate(
                            plan.createdAt
                          )}
                        </p>
                      </div>
                    </div>


                    {index === 0 && (
                      <span
                        className="
                          shrink-0
                          rounded-full
                          bg-[#C8D52B]/15
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-[#5F6810]
                        "
                      >
                        Najnoviji
                      </span>
                    )}
                  </div>


                  {/* EDIT */}

                  {editingId ===
                  plan.id ? (
                    <div
                      className="
                        space-y-5
                        p-5
                      "
                    >
                      <div
                        className="
                          rounded-xl
                          border
                          border-[#C8D52B]/40
                          bg-[#C8D52B]/10
                          px-4
                          py-3
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-black
                            text-[#15171A]
                          "
                        >
                          Uređuješ plan prehrane
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#667085]
                          "
                        >
                          Spremanje će ažurirati
                          postojeći plan.
                        </p>
                      </div>


                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#667085]
                          "
                        >
                          Naziv plana
                        </label>

                        <input
                          type="text"
                          value={
                            editTitle
                          }
                          disabled={
                            saving
                          }
                          onChange={(
                            event
                          ) =>
                            setEditTitle(
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </div>


                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#667085]
                          "
                        >
                          Obroci i upute
                        </label>

                        <textarea
                          value={
                            editMeals
                          }
                          disabled={
                            saving
                          }
                          onChange={(
                            event
                          ) =>
                            setEditMeals(
                              event
                                .target
                                .value
                            )
                          }
                          rows={10}
                          className={`
                            ${inputClass}
                            min-h-52
                            resize-y
                          `}
                        />
                      </div>


                      <div
                        className="
                          flex
                          flex-wrap
                          gap-2
                          border-t
                          border-[#EEF0EC]
                          pt-4
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            void saveEdit()
                          }
                          disabled={
                            saving
                          }
                          className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-[#111317]
                            px-4
                            py-2.5
                            text-xs
                            font-bold
                            text-white
                            transition
                            hover:bg-[#202328]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {saving ? (
                            <>
                              <span
                                className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-white/30
                                  border-t-[#C8D52B]
                                "
                              />

                              Spremanje...
                            </>
                          ) : (
                            <>
                              <span
                                className="
                                  text-[#C8D52B]
                                "
                              >
                                ✓
                              </span>

                              Spremi izmjene
                            </>
                          )}
                        </button>


                        <button
                          type="button"
                          onClick={
                            cancelEdit
                          }
                          disabled={
                            saving
                          }
                          className="
                            min-h-10
                            rounded-xl
                            border
                            border-[#E5E7EB]
                            bg-white
                            px-4
                            py-2.5
                            text-xs
                            font-bold
                            text-[#667085]
                            transition
                            hover:bg-[#F4F6F2]
                            hover:text-[#15171A]
                            disabled:opacity-50
                          "
                        >
                          Odustani
                        </button>
                      </div>
                    </div>
                  ) : (

                    /* VIEW */

                    <div className="p-5">
                      <div
                        className="
                          min-h-28
                          whitespace-pre-line
                          text-sm
                          leading-7
                          text-[#667085]
                        "
                      >
                        {plan.meals}
                      </div>


                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-2
                          border-t
                          border-[#EEF0EC]
                          pt-4
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              plan
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#16A6A1]/10
                            px-4
                            py-2.5
                            text-xs
                            font-bold
                            text-[#128D89]
                            transition
                            hover:bg-[#16A6A1]
                            hover:text-white
                          "
                        >
                          Uredi
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            void remove(
                              plan.id
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-red-50
                            px-4
                            py-2.5
                            text-xs
                            font-bold
                            text-red-600
                            transition
                            hover:bg-red-600
                            hover:text-white
                          "
                        >
                          Obriši
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

    </div>
  );
}