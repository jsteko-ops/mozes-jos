"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getGymMembers,
} from "@/lib/getGymMembers";


type OwnerClient = {
  uid: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  gymRole?: string;
  trainerId?: string;
};


export default function OwnerClientsPage() {
  const {
    userProfile,
    loading: authLoading,
  } = useAuth();


  const [
    clients,
    setClients,
  ] =
    useState<OwnerClient[]>([]);


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


  const sortedClients =
    useMemo(
      () =>
        [...clients].sort(
          (a, b) =>
            getClientName(a)
              .localeCompare(
                getClientName(b),
                "hr"
              )
        ),
      [clients]
    );


  useEffect(() => {
    let cancelled =
      false;


    async function loadClients() {
      if (authLoading) {
        return;
      }


      if (!userProfile) {
        if (!cancelled) {
          setLoading(
            false
          );
        }

        return;
      }


      if (
        !userProfile.gymId
      ) {
        if (!cancelled) {
          setClients(
            []
          );

          setError(
            "Tvoj vlasnički račun još nije povezan s teretanom."
          );

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


        const members =
          await getGymMembers(
            userProfile.gymId
          );


        if (cancelled) {
          return;
        }


        const onlyClients =
          members.filter(
            (
              member: any
            ) =>
              member.gymRole ===
              "client"
          );


        setClients(
          onlyClients as OwnerClient[]
        );
      } catch (
        loadError
      ) {
        console.error(
          "Greška kod učitavanja klijenata:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Klijente trenutno nije moguće učitati."
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


    void loadClients();


    return () => {
      cancelled = true;
    };
  }, [
    userProfile,
    authLoading,
  ]);


  return (
    <ProtectedRoute
      allowedRoles={[
        "gym_owner",
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
              Članovi teretane
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
              Pregledaj klijente
              povezane s teretanom i
              otvori njihov profil,
              mjerenja, planove i
              napredak.
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
                  min-w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#16A6A1]
                  px-2
                  text-sm
                  font-black
                  text-white
                "
              >
                {clients.length}
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
                  {clients.length === 1
                    ? "klijent"
                    : "klijenata"}
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
                    h-64
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
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-5
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  font-black
                  text-red-600
                "
              >
                !
              </div>


              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-red-800
                  "
                >
                  Došlo je do problema
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-red-700
                  "
                >
                  {error}
                </p>
              </div>
            </div>
          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          clients.length === 0 && (
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
                  bg-[#16A6A1]/10
                  text-xl
                  font-black
                  text-[#128D89]
                "
              >
                K
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
                Klijenta možeš dodati
                putem glavnog Owner
                dashboarda koristeći
                njegovu email adresu.
              </p>


              <Link
                href="/dashboard/owner"
                className="
                  mt-6
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#111317]
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#202328]
                "
              >
                Otvori Moju teretanu

                <span
                  className="
                    text-[#C8D52B]
                  "
                >
                  →
                </span>
              </Link>
            </section>
          )}


        {/* CLIENTS */}

        {!loading &&
          !error &&
          sortedClients.length > 0 && (
            <>

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[28px]
                  bg-[#111317]
                  p-6
                  text-white
                "
              >
                <div
                  className="
                    absolute
                    -right-16
                    -top-20
                    h-52
                    w-52
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
                    gap-4
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
                      Aktivno članstvo
                    </p>


                    <h2
                      className="
                        mt-1
                        text-xl
                        font-black
                        text-white
                      "
                    >
                      Klijenti teretane
                    </h2>


                    <p
                      className="
                        mt-2
                        max-w-xl
                        text-xs
                        leading-5
                        text-white/45
                      "
                    >
                      Otvori profil
                      pojedinog klijenta
                      za detaljniji
                      pregled njegovih
                      podataka i
                      napretka.
                    </p>
                  </div>


                  <div
                    className="
                      flex
                      h-14
                      min-w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#16A6A1]
                      px-4
                      text-xl
                      font-black
                      text-white
                    "
                  >
                    {clients.length}
                  </div>
                </div>
              </section>


              <div
                className="
                  grid
                  gap-4
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {sortedClients.map(
                  (
                    client,
                    index
                  ) => (
                    <ClientCard
                      key={
                        client.uid
                      }
                      client={
                        client
                      }
                      index={
                        index
                      }
                    />
                  )
                )}
              </div>

            </>
          )}

      </div>
    </ProtectedRoute>
  );
}


function ClientCard({
  client,
  index,
}: {
  client: OwnerClient;
  index: number;
}) {
  const name =
    getClientName(
      client
    );


  return (
    <Link
      href={`/dashboard/owner/clients/${client.uid}`}
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
        hover:-translate-y-1
        hover:border-[#16A6A1]/40
        hover:shadow-xl
        hover:shadow-black/5
      "
    >
      <div
        className="
          absolute
          right-0
          top-0
          h-28
          w-28
          rounded-bl-full
          bg-[#16A6A1]/5
          transition
          group-hover:bg-[#16A6A1]/10
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
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#16A6A1]/10
              text-sm
              font-black
              text-[#128D89]
            "
          >
            {getInitials(
              name
            )}
          </div>


          <span
            className="
              rounded-full
              bg-[#16A6A1]/10
              px-3
              py-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-[#128D89]
            "
          >
            Klijent
          </span>
        </div>


        <p
          className="
            mt-5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-[#98A2B3]
          "
        >
          Član{" "}
          {String(
            index + 1
          ).padStart(
            2,
            "0"
          )}
        </p>


        <h2
          className="
            mt-1
            truncate
            text-xl
            font-black
            tracking-tight
            text-[#15171A]
          "
        >
          {name}
        </h2>


        <p
          className="
            mt-2
            min-h-5
            truncate
            text-sm
            text-[#667085]
          "
        >
          {client.email ||
            "Email nije dostupan"}
        </p>


        {client.phone && (
          <p
            className="
              mt-1
              truncate
              text-xs
              text-[#98A2B3]
            "
          >
            {client.phone}
          </p>
        )}


        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[#EEF0EC]
            pt-5
          "
        >
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
              Profil
            </p>


            <p
              className="
                mt-0.5
                text-xs
                font-bold
                text-[#344054]
              "
            >
              Pregled napretka
            </p>
          </div>


          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#F4F6F2]
              font-black
              text-[#15171A]
              transition-all
              group-hover:translate-x-1
              group-hover:bg-[#16A6A1]
              group-hover:text-white
            "
          >
            →
          </div>
        </div>
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
          from-[#16A6A1]
          to-[#C8D52B]
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
      />
    </Link>
  );
}


function getClientName(
  client: OwnerClient
) {
  return (
    client.name ||
    client.displayName ||
    client.email ||
    "Klijent"
  );
}


function getInitials(
  value: string
) {
  return (
    value
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .toUpperCase() ||
    "K"
  );
}