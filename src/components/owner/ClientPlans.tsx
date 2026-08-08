"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";


type Plan = {
  id: string;
  title: string;
  exercises: string;
  createdAt?: any;
  updatedAt?: any;
};


export default function ClientPlans({
  clientId,
}: {
  clientId: string;
}) {
  const [
    plans,
    setPlans,
  ] = useState<Plan[]>([]);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    exercises,
    setExercises,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingPlans,
    setLoadingPlans,
  ] = useState(true);

  const [
    editingPlanId,
    setEditingPlanId,
  ] =
    useState<string | null>(
      null
    );


  useEffect(() => {
    void loadPlans();
  }, [clientId]);


  function getTimestamp(
    plan: Plan
  ) {
    const value =
      plan.updatedAt ||
      plan.createdAt;

    if (!value) {
      return 0;
    }

    if (
      typeof value.toMillis ===
      "function"
    ) {
      return value.toMillis();
    }

    if (
      typeof value.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .getTime();
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  }


  function formatDate(
    value: any
  ) {
    if (!value) {
      return null;
    }

    const date =
      typeof value.toDate ===
      "function"
        ? value.toDate()
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date.toLocaleDateString(
      "hr-HR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }


  async function loadPlans() {
    if (!clientId) {
      return;
    }

    setLoadingPlans(true);

    try {
      const snap =
        await getDocs(
          collection(
            db,
            "clients",
            clientId,
            "workouts"
          )
        );

      const data =
        snap.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        ) as Plan[];

      data.sort(
        (a, b) =>
          getTimestamp(b) -
          getTimestamp(a)
      );

      setPlans(data);
    } catch (error) {
      console.error(
        "Greška kod učitavanja planova:",
        error
      );
    } finally {
      setLoadingPlans(false);
    }
  }


  async function savePlan() {
    if (!title.trim()) {
      alert(
        "Upiši naziv plana."
      );

      return;
    }

    if (!exercises.trim()) {
      alert(
        "Upiši vježbe."
      );

      return;
    }


    try {
      setLoading(true);

      if (editingPlanId) {
        await updateDoc(
          doc(
            db,
            "clients",
            clientId,
            "workouts",
            editingPlanId
          ),
          {
            title:
              title.trim(),

            exercises:
              exercises.trim(),

            updatedAt:
              serverTimestamp(),
          }
        );
      } else {
        await addDoc(
          collection(
            db,
            "clients",
            clientId,
            "workouts"
          ),
          {
            title:
              title.trim(),

            exercises:
              exercises.trim(),

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );
      }


      const wasEditing =
        Boolean(
          editingPlanId
        );

      setTitle("");
      setExercises("");
      setEditingPlanId(null);

      await loadPlans();

      alert(
        wasEditing
          ? "Trening plan je izmijenjen ✅"
          : "Trening plan je spremljen ✅"
      );
    } catch (error) {
      console.error(
        "Greška kod spremanja plana:",
        error
      );

      alert(
        "Plan se nije mogao spremiti."
      );
    } finally {
      setLoading(false);
    }
  }


  function editPlan(
    plan: Plan
  ) {
    setEditingPlanId(
      plan.id
    );

    setTitle(
      plan.title || ""
    );

    setExercises(
      plan.exercises || ""
    );
  }


  function cancelEditing() {
    setEditingPlanId(null);

    setTitle("");

    setExercises("");
  }


  async function removePlan(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Želiš li obrisati ovaj trening plan?"
      );

    if (!confirmed) {
      return;
    }


    try {
      await deleteDoc(
        doc(
          db,
          "clients",
          clientId,
          "workouts",
          id
        )
      );

      if (
        editingPlanId === id
      ) {
        cancelEditing();
      }

      await loadPlans();
    } catch (error) {
      console.error(
        "Greška kod brisanja plana:",
        error
      );

      alert(
        "Plan se nije mogao obrisati."
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
    disabled:bg-[#F4F6F2]
  `;


  return (
    <div className="space-y-5">

      {/* FORM */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-[#EEF0EC]
            bg-[#FBFCFA]
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
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
              Program treninga
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-[#15171A]
              "
            >
              {editingPlanId
                ? "Uredi trening plan"
                : "Novi trening plan"}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#667085]
              "
            >
              Kreiraj i upravljaj
              programima treninga
              za ovog klijenta.
            </p>
          </div>


          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-[#16A6A1]/10
              px-3
              py-1.5
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
        </div>


        <div
          className="
            space-y-5
            p-5
            sm:p-6
          "
        >
          {editingPlanId && (
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-[#C8D52B]/40
                bg-[#C8D52B]/10
                px-4
                py-3
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    text-[#15171A]
                  "
                >
                  Uređuješ postojeći
                  plan
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-[#667085]
                  "
                >
                  Spremanje će
                  ažurirati ovaj plan.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cancelEditing
                }
                className="
                  shrink-0
                  text-xs
                  font-bold
                  text-[#15171A]
                  hover:text-[#16A6A1]
                "
              >
                Odustani
              </button>
            </div>
          )}


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
              className={
                inputClass
              }
              placeholder="Npr. Snaga, hipertrofija, povratak u formu..."
              value={title}
              disabled={loading}
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
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
              Vježbe i upute
            </label>

            <textarea
              className={`
                ${inputClass}
                min-h-44
                resize-y
              `}
              placeholder={
                "Npr.\nČučanj — 4 x 8\nBench press — 4 x 10\nVeslanje — 3 x 12"
              }
              value={
                exercises
              }
              disabled={loading}
              onChange={(
                event
              ) =>
                setExercises(
                  event.target
                    .value
                )
              }
            />
          </div>


          <div
            className="
              flex
              flex-col
              gap-3
              border-t
              border-[#EEF0EC]
              pt-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-[#98A2B3]
              "
            >
              Plan će biti spremljen
              na profil ovog klijenta.
            </p>


            <button
              type="button"
              onClick={() =>
                void savePlan()
              }
              disabled={loading}
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#111317]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:bg-[#202328]
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:translate-y-0
              "
            >
              {loading ? (
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
                    +
                  </span>

                  {editingPlanId
                    ? "Spremi promjene"
                    : "Spremi plan"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* PLAN LIST */}

      <div>
        <div
          className="
            mb-4
            flex
            items-end
            justify-between
            gap-4
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
              Biblioteka
            </p>

            <h3
              className="
                mt-1
                text-xl
                font-black
                text-[#15171A]
              "
            >
              Trening planovi
            </h3>
          </div>
        </div>


        {loadingPlans ? (
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
                    h-48
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
        ) : plans.length === 0 ? (
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
              🏋️
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Još nema trening
              planova
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
              Kreiraj prvi plan
              treninga pomoću obrasca
              iznad.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              gap-4
              lg:grid-cols-2
            "
          >
            {plans.map(
              (plan, index) => (
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
                    transition
                    hover:border-[#C8D52B]
                    hover:shadow-md
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                      border-b
                      border-[#EEF0EC]
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
                          font-black
                          text-[#C8D52B]
                        "
                      >
                        {index + 1}
                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <h4
                          className="
                            truncate
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          {plan.title}
                        </h4>

                        {formatDate(
                          plan.updatedAt ||
                            plan.createdAt
                        ) && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-[#98A2B3]
                            "
                          >
                            {formatDate(
                              plan.updatedAt ||
                                plan.createdAt
                            )}
                          </p>
                        )}
                      </div>
                    </div>


                    {index === 0 && (
                      <span
                        className="
                          shrink-0
                          rounded-full
                          bg-[#16A6A1]/10
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-[#128D89]
                        "
                      >
                        Najnoviji
                      </span>
                    )}
                  </div>


                  <div className="p-5">
                    <div
                      className="
                        min-h-24
                        whitespace-pre-line
                        text-sm
                        leading-7
                        text-[#667085]
                      "
                    >
                      {plan.exercises}
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
                          editPlan(
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
                          void removePlan(
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
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
}