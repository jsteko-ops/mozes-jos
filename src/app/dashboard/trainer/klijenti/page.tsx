"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  getClients,
} from "@/lib/services/klijentiService";


export default function TrainerClientsPage() {
  const {
    user,
  } = useAuth();


  const [
    clients,
    setClients,
  ] = useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    async function loadClients() {
      if (!user) {
        return;
      }

      const data =
        await getClients(
          user.uid
        );

      setClients(data);

      setLoading(false);
    }

    loadClients();
  }, [user]);


  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return "K";
    }

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .toUpperCase();
  };


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
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
              Klijenti
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
              Moji klijenti
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
              Pregledaj profile,
              mjerenja, planove,
              check-inove i napredak
              svojih klijenata.
            </p>
          </div>


          {!loading && (
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
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8D52B]/20
                  text-sm
                  font-black
                  text-[#15171A]
                "
              >
                {clients.length}
              </div>

              <div>
                <p
                  className="
                    text-[10px]
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
                    text-sm
                    font-bold
                    text-[#15171A]
                  "
                >
                  {clients.length === 1
                    ? "klijent"
                    : "klijenata"}
                </p>
              </div>
            </div>
          )}
        </div>


        {/* ACCENT LINE */}

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
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-36
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


        {/* EMPTY STATE */}

        {!loading &&
          clients.length === 0 && (
            <div
              className="
                rounded-[24px]
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
                  text-2xl
                "
              >
                👥
              </div>

              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Još nema klijenata
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
                Kada dodaš prvog
                klijenta, njegov profil
                pojavit će se ovdje.
              </p>
            </div>
          )}


        {/* CLIENTS */}

        {!loading &&
          clients.length > 0 && (
            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {clients.map(
                (client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/trainer/klijenti/${client.id}`}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      p-5
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
                        absolute
                        right-0
                        top-0
                        h-20
                        w-20
                        rounded-bl-[70px]
                        bg-[#C8D52B]/10
                        transition
                        group-hover:bg-[#C8D52B]/20
                      "
                    />


                    <div
                      className="
                        relative
                        z-10
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
                          bg-[#111317]
                          text-sm
                          font-black
                          tracking-wide
                          text-[#C8D52B]
                        "
                      >
                        {getInitials(
                          client.name
                        )}
                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
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
                          {client.name ||
                            "Klijent"}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-sm
                            text-[#667085]
                          "
                        >
                          {client.email ||
                            "Email nije unesen"}
                        </p>
                      </div>


                      <span
                        className="
                          relative
                          z-10
                          text-lg
                          font-bold
                          text-[#16A6A1]
                          transition-transform
                          duration-200
                          group-hover:translate-x-1
                        "
                      >
                        →
                      </span>
                    </div>


                    <div
                      className="
                        relative
                        z-10
                        mt-5
                        flex
                        items-center
                        justify-between
                        border-t
                        border-[#F0F1EE]
                        pt-4
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-semibold
                          text-[#98A2B3]
                        "
                      >
                        Profil klijenta
                      </span>

                      <span
                        className="
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
                        Otvori
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

      </div>
    </RoleGuard>
  );
}