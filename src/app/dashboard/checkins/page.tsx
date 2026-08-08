"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import RoleGuard from "@/components/auth/RoleGuard";

import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  listenCheckins,
} from "@/lib/services/klijentiService";


export default function ClientCheckinPage() {
  const [
    clientId,
    setClientId,
  ] =
    useState<
      string | null
    >(null);


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


  const [
    sentMessage,
    setSentMessage,
  ] =
    useState("");


  useEffect(() => {
    let cancelled =
      false;


    let unsubscribeCheckins:
      | (() => void)
      | undefined;


    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (user) => {
          /*
           * Ako se auth korisnik
           * promijeni, prvo ugasi
           * prethodni Check-in
           * listener.
           */

          if (
            unsubscribeCheckins
          ) {
            unsubscribeCheckins();

            unsubscribeCheckins =
              undefined;
          }


          if (!user) {
            if (!cancelled) {
              setClientId(
                null
              );

              setCheckins(
                []
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


            const snap =
              await getDoc(
                doc(
                  db,
                  "clients",
                  user.uid
                )
              );


            if (cancelled) {
              return;
            }


            if (
              !snap.exists()
            ) {
              setClientId(
                null
              );

              setCheckins(
                []
              );

              setError(
                "Klijentski profil nije pronađen."
              );

              return;
            }


            setClientId(
              user.uid
            );


            unsubscribeCheckins =
              listenCheckins(
                user.uid,
                (
                  items: any[]
                ) => {
                  if (
                    !cancelled
                  ) {
                    setCheckins(
                      items
                    );
                  }
                }
              );
          } catch (
            loadError
          ) {
            console.error(
              "Greška kod učitavanja Check-inova:",
              loadError
            );


            if (!cancelled) {
              setClientId(
                null
              );

              setCheckins(
                []
              );

              setError(
                "Check-in trenutno nije moguće učitati."
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

      unsubscribeAuth();

      if (
        unsubscribeCheckins
      ) {
        unsubscribeCheckins();
      }
    };
  }, []);


  function handleSaved() {
    setSentMessage(
      "Check-in je uspješno poslan treneru."
    );


    window.setTimeout(
      () => {
        setSentMessage(
          ""
        );
      },
      4500
    );
  }


  return (
    <RoleGuard
      allowedRoles={[
        "client",
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
              Moj napredak
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
              Check-in
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
              Pošalji treneru
              informacije o svom
              trenutnom stanju i
              prati prethodne
              Check-inove na jednom
              mjestu.
            </p>
          </div>


          {!loading &&
            clientId && (
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
                  Praćenje aktivno
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


        {/* SUCCESS */}

        {sentMessage && (
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-[#C8D52B]/30
              bg-[#C8D52B]/10
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#C8D52B]
                font-black
                text-[#111317]
              "
            >
              ✓
            </div>


            <div>
              <p
                className="
                  text-sm
                  font-black
                  text-[#15171A]
                "
              >
                Check-in poslan
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-[#667085]
                "
              >
                {sentMessage}
              </p>
            </div>
          </div>
        )}


        {/* LOADING */}

        {loading && (
          <div
            className="
              space-y-5
            "
          >
            <div
              className="
                h-96
                animate-pulse
                rounded-[28px]
                border
                border-[#E5E7EB]
                bg-white
              "
            />

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
                    Check-in nije
                    dostupan
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


        {/* CONTENT */}

        {!loading &&
          !error &&
          clientId && (
            <div
              className="
                space-y-7
              "
            >

              <CheckinForm
                clientId={
                  clientId
                }
                onSaveAction={
                  handleSaved
                }
              />


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
                      Prethodni
                      Check-inovi
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-[#667085]
                      "
                    >
                      Pregled poslanih
                      Check-inova i
                      odgovora trenera.
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
                  onReviewed={() => {}}
                />
              </section>

            </div>
          )}


        {/* CLIENT NOT FOUND FALLBACK */}

        {!loading &&
          !error &&
          !clientId && (
            <div
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
                  bg-[#F4F6F2]
                  text-2xl
                  font-black
                  text-[#98A2B3]
                "
              >
                ?
              </div>


              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Klijent nije
                pronađen
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
                Tvoj korisnički račun
                trenutno nije povezan
                s klijentskim profilom.
              </p>
            </div>
          )}

      </div>
    </RoleGuard>
  );
}