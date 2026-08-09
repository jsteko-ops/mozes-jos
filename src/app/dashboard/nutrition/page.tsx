"use client";

import {
  useEffect,
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
import ClientNutrition from "@/components/client/ClientNutrition";

import {
  auth,
} from "@/lib/firebase";

import {
  getClientByEmail,
} from "@/lib/services/klijentiService";


type ClientProfile = {
  id: string;
  name?: string;
  email?: string;
  goal?: string;
};


export default function NutritionPage() {
  const searchParams =
    useSearchParams();


  const selectedPlanId =
    searchParams.get(
      "plan"
    );


  const [
    client,
    setClient,
  ] =
    useState<ClientProfile | null>(
      null
    );


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


    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            if (!cancelled) {
              setError(
                "Korisnik nije prijavljen."
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


            if (!user.email) {
              throw new Error(
                "Tvoj korisnički račun nema email adresu."
              );
            }


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

              setError(
                "Klijentski profil nije pronađen. Obrati se svom treneru."
              );

              return;
            }


            setClient(
              foundClient as ClientProfile
            );
          } catch (
            loadError
          ) {
            console.error(
              "Greška kod učitavanja prehrane:",
              loadError
            );


            if (!cancelled) {
              setError(
                loadError instanceof Error
                  ? loadError.message
                  : "Nije moguće učitati plan prehrane."
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
              Moja prehrana
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
              Pregledaj planove
              prehrane, obroke i
              smjernice koje ti je
              pripremio trener.
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
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8D52B]/15
                    text-xs
                    font-black
                    text-[#68720F]
                  "
                >
                  {getInitials(
                    client.name ||
                      client.email ||
                      "K"
                  )}
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
                    Klijent
                  </p>


                  <p
                    className="
                      max-w-48
                      truncate
                      text-xs
                      font-black
                      text-[#15171A]
                    "
                  >
                    {client.name ||
                      client.email ||
                      "Moj profil"}
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
          <div className="space-y-5">

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
                h-80
                animate-pulse
                rounded-[28px]
                border
                border-[#E5E7EB]
                bg-white
              "
            />

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
                    Prehrana nije
                    dostupna
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


        {/* CONTENT */}

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
                      Plan prehrane
                    </p>


                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-black
                        text-white
                      "
                    >
                      Prehrana koja prati
                      tvoj cilj
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
                      ažurirati tvoj plan,
                      a sve promjene i
                      nove smjernice bit
                      će dostupne ovdje.
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
                          {client.goal}
                        </span>
                      </div>
                    )}
                  </div>


                  <div
                    className="
                      flex
                      h-16
                      w-16
                      shrink-0
                      items-center
                      justify-center
                      rounded-[20px]
                      bg-[#C8D52B]
                      text-xl
                      font-black
                      text-[#111317]
                    "
                  >
                    P
                  </div>
                </div>
              </section>


              {/* NUTRITION MODULE */}

              <section>
                <div className="mb-5">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-[#16A6A1]
                    "
                  >
                    Moji planovi
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
                    Planovi prehrane
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
                    Odaberi plan i
                    pregledaj detalje,
                    obroke i upute
                    trenera.
                  </p>
                </div>


                <ClientNutrition
                  clientId={
                    client.id
                  }
                  selectedPlanId={
                    selectedPlanId
                  }
                />
              </section>

            </>
          )}

      </div>
    </RoleGuard>
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