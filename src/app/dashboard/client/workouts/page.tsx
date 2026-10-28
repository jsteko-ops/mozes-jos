"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  onAuthStateChanged,
} from "firebase/auth";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  auth,
} from "@/lib/firebase";

import {
  getClientByEmail,
  getWorkouts,
} from "@/lib/services/klijentiService";


type Workout = {
  id: string;
  title?: string;
  exercises?: string;
  createdAt?: any;
  updatedAt?: any;
};


type ClientProfile = {
  id: string;
  name?: string;
  email?: string;
  goal?: string;
};


export default function ClientWorkoutsPage() {
  const [
    client,
    setClient,
  ] =
    useState<ClientProfile | null>(
      null
    );


  const [
    workouts,
    setWorkouts,
  ] =
    useState<Workout[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const sortedWorkouts =
    useMemo(
      () =>
        [...workouts].sort(
          (a, b) =>
            getWorkoutTimestamp(
              b
            ) -
            getWorkoutTimestamp(
              a
            )
        ),
      [workouts]
    );


  useEffect(() => {
    let cancelled = false;
    let stopPolling: (() => void) | null = null;
    let generation = 0;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      generation++;
      const current = generation;
      stopPolling?.();
      stopPolling = null;

      if (!user) {
        if (!cancelled) {
          setClient(null);
          setWorkouts([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        if (!user.email) throw new Error("Tvoj korisnički račun nema email adresu.");
        const foundClient = await getClientByEmail(user.email);
        if (cancelled || current !== generation) return;
        if (!foundClient) {
          setClient(null);
          setWorkouts([]);
          setError("Klijentski profil nije pronađen. Obrati se svom treneru.");
          setLoading(false);
          return;
        }
        const clientData = foundClient as ClientProfile;
        setClient(clientData);
        let busy = false;
        let stopped = false;
        const refresh = async () => {
          if (cancelled || stopped || busy || current !== generation) return;
          busy = true;
          try {
            const data = await getWorkouts(clientData.id);
            if (!cancelled && !stopped && current === generation) {
              setWorkouts(data);
              setError("");
              setLoading(false);
            }
          } catch (loadError) {
            if (!cancelled && !stopped && current === generation) {
              setError(loadError instanceof Error ? loadError.message :
                "Trening planove trenutno nije moguće učitati.");
              setLoading(false);
            }
          } finally {
            busy = false;
          }
        };
        await refresh();
        if (cancelled || current !== generation) return;
        const interval = setInterval(() => void refresh(), 8000);
        stopPolling = () => { stopped = true; clearInterval(interval); };
      } catch (loadError) {
        if (!cancelled && current === generation) {
          setError(loadError instanceof Error ? loadError.message :
            "Trening planove trenutno nije moguće učitati.");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      generation++;
      unsubscribeAuth();
      stopPolling?.();
    };
  }, []);


  return (
    <RoleGuard
      allowedRoles={[
        "client",
      ]}
    >
      <div className="space-y-7">

        {/* BACK */}

        <Link
          href="/dashboard/client"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#667085]
            transition
            hover:text-[#15171A]
          "
        >
          <span className="text-[#16A6A1]">
            ←
          </span>

          Natrag na Moj napredak
        </Link>


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
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#16A6A1]
              "
            >
              Moj program
            </p>


            <h1
              className="
                mt-1
                text-3xl
                font-black
                tracking-tight
                text-[#15171A]
                sm:text-4xl
              "
            >
              Moji treninzi
            </h1>


            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Pregledaj trening planove
              koje ti je trener
              pripremio i uvijek imaj
              svoj program pri ruci.
            </p>
          </div>


          {!loading &&
            client && (
              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-3
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    h-10
                    min-w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8D52B]
                    px-2
                    text-sm
                    font-black
                    text-[#111317]
                  "
                >
                  {
                    sortedWorkouts.length
                  }
                </div>


                <div>
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#98A2B3]
                    "
                  >
                    Ukupno
                  </p>


                  <p
                    className="
                      text-xs
                      font-black
                      text-[#15171A]
                    "
                  >
                    {sortedWorkouts.length ===
                    1
                      ? "plan"
                      : "planova"}
                  </p>
                </div>
              </div>
            )}
        </div>


        <div
          className="
            h-1
            w-20
            rounded-full
            bg-gradient-to-r
            from-[#C8D52B]
            to-[#16A6A1]
          "
        />


        {/* LOADING */}

        {loading && (
          <div className="space-y-4">
            <div
              className="
                h-52
                animate-pulse
                rounded-[28px]
                bg-[#111317]
              "
            />


            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {[1, 2].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="
                      h-72
                      animate-pulse
                      rounded-[28px]
                      border
                      border-[#E5E7EB]
                      bg-white
                    "
                  />
                )
              )}
            </div>
          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <section
              className="
                rounded-[28px]
                border
                border-red-200
                bg-red-50
                p-6
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
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
                    rounded-2xl
                    bg-white
                    font-black
                    text-red-600
                  "
                >
                  !
                </div>


                <div>
                  <h2
                    className="
                      text-lg
                      font-black
                      text-red-800
                    "
                  >
                    Treninzi nisu
                    dostupni
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-red-700
                    "
                  >
                    {error}
                  </p>
                </div>
              </div>
            </section>
          )}


        {!loading &&
          !error &&
          client && (
            <>

              {/* INTRO */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[28px]
                  bg-[#111317]
                  p-6
                  text-white
                  sm:p-7
                "
              >
                <div
                  className="
                    absolute
                    -right-16
                    -top-20
                    h-56
                    w-56
                    rounded-full
                    bg-[#C8D52B]/15
                    blur-3xl
                  "
                />


                <div
                  className="
                    absolute
                    -bottom-24
                    left-1/3
                    h-44
                    w-44
                    rounded-full
                    bg-[#16A6A1]/10
                    blur-3xl
                  "
                />


                <div
                  className="
                    relative
                    z-10
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[#C8D52B]
                      "
                    >
                      Program treninga
                    </p>


                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-black
                        text-white
                      "
                    >
                      Tvoj plan,
                      uvijek pri ruci
                    </h2>


                    <p
                      className="
                        mt-2
                        max-w-xl
                        text-sm
                        leading-6
                        text-white/50
                      "
                    >
                      Trener može
                      ažurirati tvoj
                      program, a promjene
                      će se ovdje pojaviti
                      automatski.
                    </p>


                    {client.goal && (
                      <div
                        className="
                          mt-5
                          inline-flex
                          max-w-full
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.04]
                          px-4
                          py-3
                        "
                      >
                        <span
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-white/35
                          "
                        >
                          Cilj
                        </span>


                        <span
                          className="
                            truncate
                            text-sm
                            font-black
                            text-white/80
                          "
                        >
                          {
                            client.goal
                          }
                        </span>
                      </div>
                    )}
                  </div>


                  <div
                    className="
                      flex
                      h-16
                      min-w-16
                      items-center
                      justify-center
                      rounded-[20px]
                      bg-[#C8D52B]
                      px-4
                      text-2xl
                      font-black
                      text-[#111317]
                    "
                  >
                    {
                      sortedWorkouts.length
                    }
                  </div>
                </div>
              </section>


              {/* EMPTY */}

              {sortedWorkouts.length ===
              0 ? (
                <section
                  className="
                    rounded-[28px]
                    border
                    border-dashed
                    border-[#D8DDD0]
                    bg-white
                    px-6
                    py-14
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#C8D52B]/15
                      text-xl
                      font-black
                      text-[#68720F]
                    "
                  >
                    T
                  </div>


                  <h2
                    className="
                      mt-5
                      text-xl
                      font-black
                      text-[#15171A]
                    "
                  >
                    Još nema trening
                    plana
                  </h2>


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
                    Kada ti trener
                    dodijeli prvi
                    trening plan,
                    automatski će se
                    pojaviti ovdje.
                  </p>
                </section>
              ) : (

                /* WORKOUT LIST */

                <section>
                  <div
                    className="
                      mb-5
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[#16A6A1]
                      "
                    >
                      Aktivni program
                    </p>


                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-black
                        tracking-tight
                        text-[#15171A]
                      "
                    >
                      Trening planovi
                    </h2>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-[#667085]
                      "
                    >
                      Najnoviji planovi
                      prikazani su prvi.
                    </p>
                  </div>


                  <div
                    className="
                      grid
                      gap-5
                      xl:grid-cols-2
                    "
                  >
                    {sortedWorkouts.map(
                      (
                        workout,
                        index
                      ) => (
                        <WorkoutCard
                          key={
                            workout.id
                          }
                          workout={
                            workout
                          }
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )}

            </>
          )}

      </div>
    </RoleGuard>
  );
}


function WorkoutCard({
  workout,
  index,
}: {
  workout: Workout;
  index: number;
}) {
  const title = workout.title?.trim() || "Trening plan";
  const [expanded, setExpanded] = useState(false);

  // Kad klijent otvori obavijest, automatski otvori tocno taj plan.
  useEffect(() => {
    const showLinkedPlan = () => {
      if (window.location.hash !== `#plan-${encodeURIComponent(workout.id)}`) return;
      setExpanded(true);
      window.requestAnimationFrame(() => {
        document.getElementById(`plan-${workout.id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };
    showLinkedPlan();
    window.addEventListener("hashchange", showLinkedPlan);
    return () => window.removeEventListener("hashchange", showLinkedPlan);
  }, [workout.id]);

  return (
    <article
      id={`plan-${workout.id}`}
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`program-${workout.id}`}
        onClick={() => setExpanded((old) => !old)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-[#FBFCF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#16A6A1]"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111317] text-sm font-black text-[#C8D52B]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#98A2B3]">Trening plan</span>
            <span className="mt-1 block break-words text-xl font-black tracking-tight text-[#15171A]">{title}</span>
            <span className="mt-2 block text-xs font-bold text-[#16847F]">
              {expanded ? "Zatvori plan ↑" : "Otvori plan ↓"}
            </span>
          </span>
        </span>
        {index === 0 && (
          <span className="shrink-0 rounded-full bg-[#C8D52B]/15 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#68720F]">
            Najnovije
          </span>
        )}
      </button>

      {expanded && (
        <div id={`program-${workout.id}`} className="border-t border-[#EEF0EC] p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#16A6A1]">Program treninga</p>
          <div className="mt-4 rounded-2xl bg-[#F6F7F3] p-5">
            <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-[#344054]">
              {workout.exercises?.trim() || "Vježbe nisu unesene."}
            </p>
          </div>
          <p className="mt-5 text-xs font-bold text-[#667085]">
            Zadnja izmjena: {formatDate(workout.updatedAt || workout.createdAt)}
          </p>
        </div>
      )}
      <div className="h-1 bg-gradient-to-r from-[#C8D52B] via-[#16A6A1] to-transparent" />
    </article>
  );
}


function getWorkoutTimestamp(
  workout: Workout
) {
  return getTimestamp(
    workout.updatedAt ||
      workout.createdAt
  );
}


function getTimestamp(
  value: any
) {
  if (!value) {
    return 0;
  }


  try {
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
      new Date(
        value
      );


    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  } catch {
    return 0;
  }
}


function formatDate(
  value: any
) {
  if (!value) {
    return "Datum nije dostupan";
  }


  try {
    const date =
      typeof value.toDate ===
      "function"
        ? value.toDate()
        : new Date(
            value
          );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Datum nije dostupan";
    }


    return date.toLocaleDateString(
      "hr-HR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  } catch {
    return "Datum nije dostupan";
  }
}