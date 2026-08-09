"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import {
  onAuthStateChanged,
} from "firebase/auth";

import RoleGuard from "@/components/auth/RoleGuard";

import ClientCheckins from "@/components/client/ClientCheckins";
import ClientNutrition from "@/components/client/ClientNutrition";

import {
  auth,
} from "@/lib/firebase";

import {
  getCheckins,
  getClientByEmail,
} from "@/lib/services/klijentiService";


type ClientProfile = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  goal?: string;
  trainerId?: string;
};


export default function ClientDashboard() {
  const searchParams =
    useSearchParams();


  const openCheckin =
    searchParams.get(
      "tab"
    ) === "checkin";


  const selectedCheckin =
    searchParams.get(
      "checkin"
    );


  const checkinSectionRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const [
    client,
    setClient,
  ] =
    useState<ClientProfile | null>(
      null
    );


  const [
    checkins,
    setCheckins,
  ] =
    useState<any[]>([]);


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


  const sortedCheckins =
    useMemo(
      () =>
        [...checkins].sort(
          (a, b) =>
            getTimestamp(
              b.createdAt
            ) -
            getTimestamp(
              a.createdAt
            )
        ),
      [checkins]
    );


  const latest =
    sortedCheckins[0];


  const trainerReplies =
    useMemo(
      () =>
        checkins.filter(
          (item) =>
            Boolean(
              item.trainerComment
            )
        ).length,
      [checkins]
    );


  const waitingReplies =
    Math.max(
      checkins.length -
        trainerReplies,
      0
    );


  useEffect(() => {
    let cancelled =
      false;


    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            if (!cancelled) {
              setLoading(
                false
              );
            }

            return;
          }


          try {
            if (!cancelled) {
              setLoading(
                true
              );

              setError(
                ""
              );
            }


            if (!user.email) {
              throw new Error(
                "Tvoj korisnički račun nema email adresu."
              );
            }


            /*
             * Prvo pronalazimo pravi
             * zapis klijenta u
             * kolekciji clients.
             */
            const foundClient =
              await getClientByEmail(
                user.email
              );


            if (cancelled) {
              return;
            }


            if (!foundClient) {
              setClient(
                null
              );

              setCheckins(
                []
              );

              setError(
                "Klijentski profil nije pronađen. Obrati se svom treneru."
              );

              return;
            }


            const clientData =
              foundClient as ClientProfile;


            setClient(
              clientData
            );


            /*
             * BITNA ISPRAVKA:
             *
             * Check-inovi su spremljeni
             * pod:
             *
             * clients/{clientId}/checkins
             *
             * zato koristimo
             * clientData.id,
             * a ne Firebase user.uid.
             */
            const data =
              await getCheckins(
                clientData.id
              );


            if (cancelled) {
              return;
            }


            setCheckins(
              data
            );
          } catch (
            loadError
          ) {
            console.error(
              "Greška kod učitavanja Client dashboarda:",
              loadError
            );


            if (!cancelled) {
              setError(
                loadError instanceof Error
                  ? loadError.message
                  : "Dashboard trenutno nije moguće učitati."
              );
            }
          } finally {
            if (!cancelled) {
              setLoading(
                false
              );
            }
          }
        }
      );


    return () => {
      cancelled = true;

      unsubscribe();
    };
  }, []);


  useEffect(() => {
    if (
      !loading &&
      openCheckin &&
      checkinSectionRef.current
    ) {
      window.setTimeout(
        () => {
          checkinSectionRef.current?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
        },
        150
      );
    }
  }, [
    loading,
    openCheckin,
  ]);


  return (
    <RoleGuard
      allowedRoles={[
        "client",
      ]}
    >
      <div className="space-y-8">

        {/* LOADING */}

        {loading && (
          <div className="space-y-5">

            <div
              className="
                h-80
                animate-pulse
                rounded-[32px]
                bg-[#111317]
              "
            />


            <div
              className="
                grid
                gap-4
                md:grid-cols-3
              "
            >
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="
                      h-36
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
                  <h1
                    className="
                      text-lg
                      font-black
                      text-red-800
                    "
                  >
                    Dashboard nije
                    dostupan
                  </h1>


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

              {/* HERO */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  bg-[#111317]
                  px-6
                  py-8
                  text-white
                  shadow-xl
                  shadow-black/5
                  sm:px-8
                  sm:py-10
                "
              >
                <div
                  className="
                    absolute
                    -right-24
                    -top-28
                    h-80
                    w-80
                    rounded-full
                    bg-[#16A6A1]/15
                    blur-3xl
                  "
                />


                <div
                  className="
                    absolute
                    -bottom-32
                    left-1/4
                    h-64
                    w-64
                    rounded-full
                    bg-[#C8D52B]/10
                    blur-3xl
                  "
                />


                <div
                  className="
                    relative
                    z-10
                  "
                >
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.05]
                      px-3
                      py-2
                    "
                  >
                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                        bg-[#C8D52B]
                      "
                    />


                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-white/60
                      "
                    >
                      Moj napredak
                    </span>
                  </div>


                  <div
                    className="
                      mt-6
                      flex
                      flex-col
                      gap-6
                      lg:flex-row
                      lg:items-end
                      lg:justify-between
                    "
                  >
                    <div
                      className="
                        max-w-2xl
                      "
                    >
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-[#C8D52B]
                        "
                      >
                        Dobro došao
                      </p>


                      <h1
                        className="
                          mt-1
                          text-3xl
                          font-black
                          tracking-tight
                          text-white
                          sm:text-5xl
                        "
                      >
                        {getFirstName(
                          client.name
                        )}
                      </h1>


                      <p
                        className="
                          mt-4
                          max-w-xl
                          text-sm
                          leading-6
                          text-white/50
                          sm:text-base
                        "
                      >
                        Prati svoje
                        Check-inove,
                        mjerenja, planove
                        i komunikaciju s
                        trenerom na jednom
                        mjestu.
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


                    <Link
                      href="/dashboard/checkins"
                      className="
                        inline-flex
                        min-h-13
                        w-fit
                        items-center
                        justify-center
                        gap-3
                        rounded-2xl
                        bg-[#C8D52B]
                        px-6
                        py-4
                        text-sm
                        font-black
                        text-[#111317]
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-[#D4E036]
                      "
                    >
                      Novi Check-in

                      <span>
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </section>


              {/* STATS */}

              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-3
                "
              >
                <DashboardStat
                  eyebrow="Check-inovi"
                  value={String(
                    checkins.length
                  )}
                  description="Ukupno poslanih Check-inova"
                  accent="dark"
                />


                <DashboardStat
                  eyebrow="Zadnja težina"
                  value={
                    latest?.weight !=
                    null
                      ? `${latest.weight} kg`
                      : "—"
                  }
                  description="Težina iz posljednjeg Check-ina"
                  accent="lime"
                />


                <DashboardStat
                  eyebrow="Odgovor trenera"
                  value={
                    waitingReplies > 0
                      ? `${waitingReplies} čeka`
                      : checkins.length >
                          0
                        ? "Sve riješeno"
                        : "—"
                  }
                  description={
                    trainerReplies > 0
                      ? `${trainerReplies} odgovora trenera`
                      : "Još nema odgovora trenera"
                  }
                  accent="teal"
                />
              </section>


              {/* QUICK LINKS */}

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
                    Moj program
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
                    Brzi pristup
                  </h2>


                  <p
                    className="
                      mt-2
                      text-sm
                      text-[#667085]
                    "
                  >
                    Sve najvažnije za
                    tvoj napredak.
                  </p>
                </div>


                <div
                  className="
                    grid
                    gap-4
                    md:grid-cols-3
                  "
                >
                  <QuickLink
                    href="/dashboard/checkins"
                    title="Check-in"
                    description="Pošalji novi tjedni Check-in treneru."
                    accent="lime"
                    badge="Praćenje"
                  />


                  <QuickLink
                    href="/dashboard/client/measurements"
                    title="Mjerenja"
                    description="Pregledaj svoja spremljena mjerenja i napredak."
                    accent="teal"
                    badge="Napredak"
                  />


                  <QuickLink
                    href="/dashboard/client/workouts"
                    title="Treninzi"
                    description="Otvori trening planove koje ti je pripremio trener."
                    accent="dark"
                    badge="Program"
                  />
                </div>
              </section>


              {/* CHECKINS */}

              <div
                ref={
                  checkinSectionRef
                }
                className="
                  scroll-mt-24
                "
              >
                <ClientCheckins
                  checkins={
                    sortedCheckins
                  }
                  selectedCheckin={
                    selectedCheckin
                  }
                  clientId={
                    client.id
                  }
                />
              </div>


              {/* NUTRITION */}

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
                    Prehrana
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
                    Moj plan prehrane
                  </h2>


                  <p
                    className="
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-6
                      text-[#667085]
                    "
                  >
                    Pregledaj plan i
                    prehrambene upute
                    koje ti je pripremio
                    trener.
                  </p>
                </div>


                <ClientNutrition
                  clientId={
                    client.id
                  }
                />
              </section>

            </>
          )}

      </div>
    </RoleGuard>
  );
}


function DashboardStat({
  eyebrow,
  value,
  description,
  accent,
}: {
  eyebrow: string;
  value: string;
  description: string;
  accent:
    | "dark"
    | "lime"
    | "teal";
}) {
  const colors = {
    dark:
      "bg-[#111317] text-[#C8D52B]",

    lime:
      "bg-[#C8D52B]/15 text-[#68720F]",

    teal:
      "bg-[#16A6A1]/10 text-[#128D89]",
  };


  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-[#98A2B3]
        "
      >
        {eyebrow}
      </p>


      <div
        className={`
          mt-4
          inline-flex
          min-h-11
          max-w-full
          items-center
          rounded-xl
          px-4
          py-2.5
          text-xl
          font-black
          ${colors[accent]}
        `}
      >
        <span
          className="
            truncate
          "
        >
          {value}
        </span>
      </div>


      <p
        className="
          mt-4
          text-xs
          leading-5
          text-[#98A2B3]
        "
      >
        {description}
      </p>
    </div>
  );
}


function QuickLink({
  href,
  title,
  description,
  accent,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  accent:
    | "lime"
    | "teal"
    | "dark";
  badge: string;
}) {
  const colors = {
    lime: {
      badge:
        "bg-[#C8D52B]/15 text-[#68720F]",

      arrow:
        "bg-[#C8D52B] text-[#111317]",
    },

    teal: {
      badge:
        "bg-[#16A6A1]/10 text-[#128D89]",

      arrow:
        "bg-[#16A6A1] text-white",
    },

    dark: {
      badge:
        "bg-[#111317]/5 text-[#344054]",

      arrow:
        "bg-[#111317] text-[#C8D52B]",
    },
  };


  return (
    <Link
      href={href}
      className="
        group
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-xl
        hover:shadow-black/5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <span
          className={`
            rounded-full
            px-3
            py-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            ${colors[accent].badge}
          `}
        >
          {badge}
        </span>


        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            font-black
            transition-transform
            group-hover:translate-x-1
            ${colors[accent].arrow}
          `}
        >
          →
        </div>
      </div>


      <h3
        className="
          mt-6
          text-xl
          font-black
          text-[#15171A]
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-2
          text-sm
          leading-6
          text-[#667085]
        "
      >
        {description}
      </p>
    </Link>
  );
}


function getFirstName(
  name?: string
) {
  if (!name) {
    return "Dobro došao";
  }


  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)[0] ||
    "Dobro došao"
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