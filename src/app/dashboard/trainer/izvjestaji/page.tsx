"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import PremiumGuard from "@/components/auth/PremiumGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  getClients,
  getMeasurements,
  getCheckins,
} from "@/lib/services/klijentiService";


type Stats = {
  clients: number;
  measurements: number;
  checkins: number;
};


export default function IzvjestajiPage() {
  const {
    user,
  } = useAuth();


  const [
    stats,
    setStats,
  ] =
    useState<Stats>({
      clients: 0,
      measurements: 0,
      checkins: 0,
    });


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


  useEffect(() => {
    let cancelled =
      false;


    async function load() {
      if (!user) {
        return;
      }


      try {
        setLoading(true);
        setError("");


        const clients =
          await getClients(
            user.uid
          );


        const activity =
          await Promise.all(
            clients.map(
              async (
                client: any
              ) => {
                const [
                  measurements,
                  checkins,
                ] =
                  await Promise.all([
                    getMeasurements(
                      client.id
                    ),

                    getCheckins(
                      client.id
                    ),
                  ]);


                return {
                  measurements:
                    measurements.length,

                  checkins:
                    checkins.length,
                };
              }
            )
          );


        const totals =
          activity.reduce(
            (
              current,
              item
            ) => ({
              measurements:
                current.measurements +
                item.measurements,

              checkins:
                current.checkins +
                item.checkins,
            }),
            {
              measurements: 0,
              checkins: 0,
            }
          );


        if (!cancelled) {
          setStats({
            clients:
              clients.length,

            measurements:
              totals.measurements,

            checkins:
              totals.checkins,
          });
        }
      } catch (
        loadError
      ) {
        console.error(
          "Greška kod učitavanja izvještaja:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Statistiku trenutno nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    void load();


    return () => {
      cancelled = true;
    };
  }, [user]);


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
      <PremiumGuard>

        <div className="space-y-7">

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
                Pro analitika
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
                Pregled aktivnosti
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
                Brzi pregled broja
                klijenata, spremljenih
                mjerenja i Check-inova
                u tvom trenerskom
                sustavu.
              </p>
            </div>


            {!loading &&
              !error && (
                <div
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    bg-[#C8D52B]/15
                    px-3
                    py-2
                    text-[#5F6810]
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
                      tracking-wider
                    "
                  >
                    Pro aktivan
                  </span>
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
            <div
              className="
                grid
                gap-5
                md:grid-cols-3
              "
            >
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-52
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
          )}


          {/* ERROR */}

          {!loading &&
            error && (
              <div
                className="
                  rounded-[28px]
                  border
                  border-red-200
                  bg-white
                  p-6
                  shadow-sm
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
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-red-50
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
                        text-[#15171A]
                      "
                    >
                      Analitika nije
                      dostupna
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-[#667085]
                      "
                    >
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}


          {/* STATS */}

          {!loading &&
            !error && (
              <>
                <div
                  className="
                    grid
                    gap-5
                    md:grid-cols-3
                  "
                >
                  <StatCard
                    href="/dashboard/trainer/klijenti"
                    eyebrow="Baza"
                    title="Klijenti"
                    value={
                      stats.clients
                    }
                    description="Ukupan broj klijenata povezanih s tvojim trenerskim računom."
                    symbol="K"
                    variant="dark"
                  />


                  <StatCard
                    href="/dashboard/trainer/mjerenja"
                    eyebrow="Napredak"
                    title="Mjerenja"
                    value={
                      stats.measurements
                    }
                    description="Ukupan broj evidentiranih mjerenja svih tvojih klijenata."
                    symbol="M"
                    variant="lime"
                  />


                  <StatCard
                    href="/dashboard/trainer/checkin"
                    eyebrow="Praćenje"
                    title="Check-inovi"
                    value={
                      stats.checkins
                    }
                    description="Ukupan broj spremljenih Check-inova kroz praćenje klijenata."
                    symbol="C"
                    variant="teal"
                  />
                </div>


                {/* OVERVIEW */}

                <section
                  className="
                    overflow-hidden
                    rounded-[28px]
                    bg-[#111317]
                    text-white
                    shadow-xl
                    shadow-black/5
                  "
                >
                  <div
                    className="
                      grid
                      gap-8
                      p-6
                      lg:grid-cols-[minmax(0,1fr)_auto]
                      lg:items-center
                      sm:p-8
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
                        Možeš Još Pro
                      </p>


                      <h2
                        className="
                          mt-2
                          text-2xl
                          font-black
                          tracking-tight
                          text-white
                          sm:text-3xl
                        "
                      >
                        Sve ključne
                        aktivnosti na
                        jednom mjestu.
                      </h2>


                      <p
                        className="
                          mt-3
                          max-w-2xl
                          text-sm
                          leading-6
                          text-white/55
                        "
                      >
                        Ovaj pregled daje
                        brzu sliku količine
                        podataka koje pratiš.
                        Detalje svakog modula
                        možeš otvoriti iz
                        kartica iznad.
                      </p>
                    </div>


                    <div
                      className="
                        grid
                        grid-cols-3
                        gap-2
                      "
                    >
                      <MiniStat
                        value={
                          stats.clients
                        }
                        label="Klijenti"
                      />

                      <MiniStat
                        value={
                          stats.measurements
                        }
                        label="Mjerenja"
                      />

                      <MiniStat
                        value={
                          stats.checkins
                        }
                        label="Check-in"
                      />
                    </div>
                  </div>


                  <div
                    className="
                      h-1
                      bg-gradient-to-r
                      from-[#C8D52B]
                      via-[#16A6A1]
                      to-transparent
                    "
                  />
                </section>


                {/* QUICK ACTIONS */}

                <section>
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
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[#16A6A1]
                        "
                      >
                        Brzi pristup
                      </p>


                      <h2
                        className="
                          mt-1
                          text-xl
                          font-black
                          text-[#15171A]
                        "
                      >
                        Nastavi s radom
                      </h2>
                    </div>
                  </div>


                  <div
                    className="
                      grid
                      gap-3
                      md:grid-cols-3
                    "
                  >
                    <QuickLink
                      href="/dashboard/trainer/klijenti"
                      title="Otvori klijente"
                      description="Profili, planovi i napredak."
                    />


                    <QuickLink
                      href="/dashboard/trainer/mjerenja"
                      title="Pregledaj mjerenja"
                      description="Sva evidentirana mjerenja."
                    />


                    <QuickLink
                      href="/dashboard/reports"
                      title="Generiraj PDF"
                      description="Izradi izvještaj za klijenta."
                    />
                  </div>
                </section>
              </>
            )}

        </div>

      </PremiumGuard>
    </RoleGuard>
  );
}


function StatCard({
  href,
  eyebrow,
  title,
  value,
  description,
  symbol,
  variant,
}: {
  href: string;
  eyebrow: string;
  title: string;
  value: number;
  description: string;
  symbol: string;
  variant:
    | "dark"
    | "lime"
    | "teal";
}) {
  const iconClass =
    variant === "dark"
      ? `
        bg-[#111317]
        text-[#C8D52B]
      `
      : variant === "lime"
      ? `
        bg-[#C8D52B]
        text-[#111317]
      `
      : `
        bg-[#16A6A1]
        text-white
      `;


  return (
    <Link
      href={href}
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-[#C8D52B]
        hover:shadow-lg
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
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#98A2B3]
            "
          >
            {eyebrow}
          </p>


          <h2
            className="
              mt-1
              text-lg
              font-black
              text-[#15171A]
            "
          >
            {title}
          </h2>
        </div>


        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-sm
            font-black
            ${iconClass}
          `}
        >
          {symbol}
        </div>
      </div>


      <p
        className="
          mt-6
          text-5xl
          font-black
          tracking-tight
          text-[#15171A]
        "
      >
        {value}
      </p>


      <p
        className="
          mt-3
          min-h-10
          text-xs
          leading-5
          text-[#667085]
        "
      >
        {description}
      </p>


      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          border-t
          border-[#EEF0EC]
          pt-4
        "
      >
        <span
          className="
            text-xs
            font-bold
            text-[#128D89]
          "
        >
          Otvori
        </span>


        <span
          className="
            text-lg
            font-black
            text-[#C8D52B]
            transition-transform
            group-hover:translate-x-1
          "
        >
          →
        </span>
      </div>


      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-full
          origin-left
          scale-x-0
          bg-gradient-to-r
          from-[#C8D52B]
          to-[#16A6A1]
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
      />
    </Link>
  );
}


function MiniStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="
        min-w-[84px]
        rounded-2xl
        border
        border-white/10
        bg-white/[0.05]
        px-3
        py-4
        text-center
      "
    >
      <p
        className="
          text-xl
          font-black
          text-[#C8D52B]
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/40
        "
      >
        {label}
      </p>
    </div>
  );
}


function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white
        p-4
        shadow-sm
        transition-all
        hover:border-[#16A6A1]/40
        hover:shadow-md
      "
    >
      <div>
        <p
          className="
            text-sm
            font-black
            text-[#15171A]
          "
        >
          {title}
        </p>


        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[#667085]
          "
        >
          {description}
        </p>
      </div>


      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#F4F6F2]
          font-black
          text-[#16A6A1]
          transition-all
          group-hover:bg-[#16A6A1]
          group-hover:text-white
        "
      >
        →
      </div>
    </Link>
  );
}