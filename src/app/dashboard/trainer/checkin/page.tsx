"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";
import PremiumGuard from "@/components/auth/PremiumGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import ClientSelect from "@/components/checkins/ClientSelect";
import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  getClients,
  getCheckins,
} from "@/lib/services/klijentiService";


type Client = {
  id: string;
  name: string;
  email?: string;
};


export default function CheckinPage() {
  const {
    user,
  } = useAuth();


  const searchParams =
    useSearchParams();


  const urlClientId =
    searchParams.get(
      "client"
    );


  const [
    clients,
    setClients,
  ] =
    useState<Client[]>([]);


  const [
    clientId,
    setClientId,
  ] =
    useState("");


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
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (client) =>
            client.id ===
            clientId
        ),
      [
        clients,
        clientId,
      ]
    );


  useEffect(() => {
    let cancelled =
      false;


    async function loadClients() {
      if (!user) {
        return;
      }


      try {
        setLoading(
          true
        );

        setError(
          ""
        );


        const data =
          await getClients(
            user.uid
          );


        if (cancelled) {
          return;
        }


        setClients(
          data as Client[]
        );


        if (
          urlClientId
        ) {
          const clientExists =
            data.some(
              (
                client: any
              ) =>
                client.id ===
                urlClientId
            );


          if (
            clientExists
          ) {
            setClientId(
              urlClientId
            );


            try {
              const dataCheckins =
                await getCheckins(
                  urlClientId
                );


              if (
                !cancelled
              ) {
                setCheckins(
                  dataCheckins
                );
              }
            } catch (
              checkinError
            ) {
              console.error(
                "Greška kod učitavanja Check-inova:",
                checkinError
              );


              if (
                !cancelled
              ) {
                setError(
                  "Check-inove odabranog klijenta nije moguće učitati."
                );
              }
            }
          }
        }
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
    user,
    urlClientId,
  ]);


  async function loadCheckins(
    id?: string
  ) {
    const selectedId =
      id ||
      clientId;


    if (
      !selectedId
    ) {
      setCheckins(
        []
      );

      return;
    }


    try {
      setLoadingHistory(
        true
      );

      setError(
        ""
      );


      const data =
        await getCheckins(
          selectedId
        );


      setCheckins(
        data
      );
    } catch (
      loadError
    ) {
      console.error(
        "Greška kod učitavanja Check-inova:",
        loadError
      );


      setError(
        "Povijest Check-inova trenutno nije moguće učitati."
      );
    } finally {
      setLoadingHistory(
        false
      );
    }
  }


  function handleClientChange(
    id: string
  ) {
    setClientId(
      id
    );


    /*
     * Brišemo prikaz prethodnog
     * klijenta kako se stari
     * Check-inovi ne bi prikazivali
     * uz novo odabranog klijenta.
     */
    setCheckins(
      []
    );

    setError(
      ""
    );
  }


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
                Pro praćenje
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
                Check-in klijenata
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
                Odaberi klijenta,
                pregledaj njegovu
                povijest i evidentiraj
                novi Check-in kada je
                potrebno.
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
                space-y-5
              "
            >
              <div
                className="
                  h-72
                  animate-pulse
                  rounded-[28px]
                  border
                  border-[#E5E7EB]
                  bg-white
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
                    Došlo je do
                    problema
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


          {!loading && (
            <>

              {/* CLIENT SELECT */}

              <ClientSelect
                clients={
                  clients
                }
                value={
                  clientId
                }
                onChange={
                  handleClientChange
                }
                onLoadHistory={() =>
                  void loadCheckins()
                }
              />


              {/* NO CLIENTS */}

              {clients.length ===
                0 && (
                <div
                  className="
                    rounded-[28px]
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
                      bg-[#F4F6F2]
                      font-black
                      text-[#98A2B3]
                    "
                  >
                    K
                  </div>


                  <h2
                    className="
                      mt-4
                      text-lg
                      font-black
                      text-[#15171A]
                    "
                  >
                    Nema klijenata
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
                    Dodaj klijenta prije
                    korištenja Check-in
                    modula.
                  </p>
                </div>
              )}


              {/* SELECTED CLIENT SUMMARY */}

              {selectedClient && (
                <section
                  className="
                    relative
                    overflow-hidden
                    rounded-[28px]
                    bg-[#111317]
                    p-6
                    text-white
                    shadow-xl
                    shadow-black/5
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
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[#C8D52B]
                          text-sm
                          font-black
                          text-[#111317]
                        "
                      >
                        {getInitials(
                          selectedClient.name
                        )}
                      </div>


                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.15em]
                            text-[#C8D52B]
                          "
                        >
                          Aktivni klijent
                        </p>


                        <h2
                          className="
                            mt-1
                            text-xl
                            font-black
                            text-white
                          "
                        >
                          {
                            selectedClient.name
                          }
                        </h2>


                        {selectedClient.email && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-white/45
                            "
                          >
                            {
                              selectedClient.email
                            }
                          </p>
                        )}
                      </div>
                    </div>


                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.05]
                          px-4
                          py-3
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
                          {
                            checkins.length
                          }
                        </p>


                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-white/40
                          "
                        >
                          Check-inova
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}


              {/* HISTORY LOADING */}

              {loadingHistory && (
                <div
                  className="
                    h-52
                    animate-pulse
                    rounded-[28px]
                    border
                    border-[#E5E7EB]
                    bg-white
                  "
                />
              )}


              {/* SELECT CLIENT MESSAGE */}

              {!clientId &&
                clients.length >
                  0 && (
                  <div
                    className="
                      rounded-[28px]
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
                        bg-[#16A6A1]/10
                        font-black
                        text-[#128D89]
                      "
                    >
                      ↓
                    </div>


                    <h2
                      className="
                        mt-4
                        text-lg
                        font-black
                        text-[#15171A]
                      "
                    >
                      Odaberi klijenta
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
                      Nakon odabira
                      možeš učitati
                      povijest i dodati
                      novi Check-in.
                    </p>
                  </div>
                )}


              {/* CHECK-IN CONTENT */}

              {clientId &&
                !loadingHistory && (
                  <div
                    className="
                      space-y-7
                    "
                  >

                    {/* NEW CHECKIN */}

                    <div>
                      <div
                        className="
                          mb-4
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
                          Novi unos
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
                          Evidentiraj
                          Check-in
                        </h2>


                        <p
                          className="
                            mt-1
                            text-sm
                            text-[#667085]
                          "
                        >
                          Check-in će biti
                          spremljen uz
                          odabranog
                          klijenta.
                        </p>
                      </div>


                      <CheckinForm
                        clientId={
                          clientId
                        }
                        onSaveAction={() =>
                          loadCheckins(
                            clientId
                          )
                        }
                      />
                    </div>


                    {/* HISTORY */}

                    <section
                      className="
                        space-y-4
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-end
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
                              text-[#16A6A1]
                            "
                          >
                            Povijest
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
                            Check-inovi
                            klijenta
                          </h2>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-[#667085]
                            "
                          >
                            Pregledaj
                            prethodne unose,
                            odgovore i status
                            obrade.
                          </p>
                        </div>


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
                              h-9
                              min-w-9
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#111317]
                              px-2
                              text-sm
                              font-black
                              text-[#C8D52B]
                            "
                          >
                            {
                              checkins.length
                            }
                          </div>


                          <span
                            className="
                              text-xs
                              font-bold
                              text-[#667085]
                            "
                          >
                            {checkins.length ===
                            1
                              ? "Check-in"
                              : "Check-inova"}
                          </span>
                        </div>
                      </div>


                      <CheckinHistory
                        checkins={
                          checkins
                        }
                        clientId={
                          clientId
                        }
                        onReviewed={() =>
                          loadCheckins(
                            clientId
                          )
                        }
                      />
                    </section>

                  </div>
                )}

            </>
          )}

        </div>

      </PremiumGuard>
    </RoleGuard>
  );
}


function getInitials(
  name: string
) {
  if (!name) {
    return "K";
  }


  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase();
}