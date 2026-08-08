"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  listenUnreadCheckins,
} from "@/lib/services/notificationService";

import {
  listenUnreadTrainerMessages,
} from "@/lib/services/chat/chatNotifications";

import {
  getTrainerStats,
} from "@/lib/services/klijentiService";


export default function TrainerPage() {
  const {
    user,
  } = useAuth();

  const router =
    useRouter();


  const [
    stats,
    setStats,
  ] = useState({
    clientsCount: 0,
    measurementsCount: 0,
  });


  const [
    checkinCount,
    setCheckinCount,
  ] = useState(0);


  const [
    messageCount,
    setMessageCount,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    async function loadStats() {
      if (!user) {
        return;
      }

      const data =
        await getTrainerStats(
          user.uid
        );

      setStats(data);

      setLoading(false);
    }

    loadStats();
  }, [user]);


  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe =
      listenUnreadCheckins(
        user.uid,
        (count) => {
          setCheckinCount(
            count
          );
        }
      );

    return () =>
      unsubscribe();
  }, [user]);


  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe =
      listenUnreadTrainerMessages(
        user.uid,
        (count) => {
          setMessageCount(
            count
          );
        }
      );

    return () =>
      unsubscribe();
  }, [user]);


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
      <div
        className="
          space-y-7
        "
      >

        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#111317]
            px-6
            py-7
            text-white
            shadow-xl
            shadow-black/5
            sm:px-8
            sm:py-8
          "
        >
          <div
            className="
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#C8D52B]/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-28
              right-20
              h-64
              w-64
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
              gap-6
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-3
                  py-1.5
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
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-white/70
                  "
                >
                  Trenerski centar
                </span>
              </div>


              <h1
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                Možeš Još.
              </h1>


              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/60
                  sm:text-base
                "
              >
                Sve što ti treba za
                praćenje klijenata,
                napretka i komunikacije
                na jednom mjestu.
              </p>
            </div>


            <div
              className="
                flex
                items-center
                gap-3
                self-start
                rounded-2xl
                border
                border-white/10
                bg-white/[0.05]
                px-4
                py-3
                md:self-auto
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8D52B]
                  text-lg
                "
              >
                ✓
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-white/40
                  "
                >
                  Status
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Aktivan trener
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION TITLE */}

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
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
              Pregled
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
              Aktivnost danas
            </h2>
          </div>

          <p
            className="
              hidden
              text-sm
              text-[#667085]
              sm:block
            "
          >
            Pregled aktivnosti i
            napretka klijenata
          </p>
        </div>


        {/* STAT CARDS */}

        {loading ? (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-44
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
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            {/* CLIENTS */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/trainer/klijenti"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
                p-5
                text-left
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-[#C8D52B]
                hover:shadow-lg
                hover:shadow-black/5
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8D52B]/20
                    text-xl
                  "
                >
                  👥
                </div>

                <span
                  className="
                    text-sm
                    font-bold
                    text-[#C8D52B]
                    transition
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </div>

              <p
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#15171A]
                "
              >
                {stats.clientsCount}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-[#15171A]
                "
              >
                Klijenti
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#667085]
                "
              >
                Aktivni klijenti
              </p>
            </button>


            {/* MEASUREMENTS */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/trainer/mjerenja"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
                p-5
                text-left
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-[#16A6A1]
                hover:shadow-lg
                hover:shadow-black/5
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#16A6A1]/10
                    text-xl
                  "
                >
                  ⚖️
                </div>

                <span
                  className="
                    text-sm
                    font-bold
                    text-[#16A6A1]
                    transition
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </div>

              <p
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#15171A]
                "
              >
                {stats.measurementsCount}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-[#15171A]
                "
              >
                Mjerenja
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#667085]
                "
              >
                Ukupno mjerenja
              </p>
            </button>


            {/* MESSAGES */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/chat"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
                p-5
                text-left
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-[#16A6A1]
                hover:shadow-lg
                hover:shadow-black/5
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#16A6A1]/10
                    text-xl
                  "
                >
                  💬
                </div>

                <span
                  className="
                    text-sm
                    font-bold
                    text-[#16A6A1]
                    transition
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </div>

              <p
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#15171A]
                "
              >
                {messageCount}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-[#15171A]
                "
              >
                Poruke
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#667085]
                "
              >
                Nove poruke
              </p>
            </button>


            {/* CHECKINS */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/trainer/checkin"
                )
              }
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
                p-5
                text-left
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-[#C8D52B]
                hover:shadow-lg
                hover:shadow-black/5
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8D52B]/20
                    text-xl
                  "
                >
                  ✓
                </div>

                <span
                  className="
                    text-sm
                    font-bold
                    text-[#C8D52B]
                    transition
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </div>

              <p
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#15171A]
                "
              >
                {checkinCount}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-[#15171A]
                "
              >
                Check-in
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#667085]
                "
              >
                Novi za pregled
              </p>
            </button>

          </div>
        )}


        {/* BOTTOM CARDS */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-2
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#C8D52B]
                  text-xl
                "
              >
                🏆
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#667085]
                  "
                >
                  Status računa
                </p>

                <h3
                  className="
                    mt-1
                    text-lg
                    font-black
                    text-[#15171A]
                  "
                >
                  Aktivan trener
                </h3>
              </div>
            </div>

            <p
              className="
                mt-5
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Upravljaj klijentima,
              planovima, mjerenjima i
              komunikacijom iz jednog
              centralnog mjesta.
            </p>
          </div>


          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              bg-[#16A6A1]
              p-6
              text-white
              shadow-sm
            "
          >
            <div
              className="
                absolute
                -right-10
                -top-10
                h-32
                w-32
                rounded-full
                bg-white/10
              "
            />

            <div className="relative z-10">
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-white/60
                "
              >
                Možeš Još
              </p>

              <h3
                className="
                  mt-2
                  text-2xl
                  font-black
                  text-white
                "
              >
                JoŠ bolje.
                <br />
                JoŠ jače.
              </h3>

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-white/75
                "
              >
                Fokus na ono što je
                najvažnije — napredak
                tvojih klijenata.
              </p>
            </div>
          </div>

        </div>

      </div>
    </RoleGuard>
  );
}