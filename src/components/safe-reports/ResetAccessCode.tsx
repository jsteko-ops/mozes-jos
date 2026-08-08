"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


type ResetApiResponse = {
  ok?: boolean;

  reportNumber?: string;

  accessCode?: string;

  error?: string;
};


export default function ResetAccessCode() {
  const {
    user,
  } = useAuth();


  const [
    open,
    setOpen,
  ] =
    useState(false);


  const [
    reportNumber,
    setReportNumber,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    result,
    setResult,
  ] =
    useState<
      ResetApiResponse | null
    >(null);


  async function resetCode(
    event: FormEvent
  ) {
    event.preventDefault();


    if (!user) {
      setError(
        "Moraš biti prijavljen."
      );

      return;
    }


    const normalizedReportNumber =
      reportNumber
        .trim()
        .toUpperCase();


    if (
      !normalizedReportNumber
    ) {
      setError(
        "Upiši broj prijave."
      );

      return;
    }


    try {
      setLoading(true);

      setError("");

      setResult(null);


      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/safe-reports/reset-code",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                reportNumber:
                  normalizedReportNumber,
              }),
          }
        );


      const data =
        (
          await response.json()
        ) as ResetApiResponse;


      if (!response.ok) {
        throw new Error(
          data.error ||
            "Novi kod nije moguće izraditi."
        );
      }


      setReportNumber(
        normalizedReportNumber
      );


      setResult(data);
    } catch (
      resetError: unknown
    ) {
      console.error(
        "Greška kod izrade novog pristupnog koda:",
        resetError
      );


      setError(
        resetError
          instanceof Error
          ? resetError.message
          : "Novi kod nije moguće izraditi."
      );
    } finally {
      setLoading(false);
    }
  }


  function toggleOpen() {
    setOpen(
      (current) =>
        !current
    );

    setError("");

    setResult(null);
  }


  return (
    <div className="space-y-4">

      {/* TOGGLE */}

      <button
        type="button"
        onClick={
          toggleOpen
        }
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-[#128D89]
          transition
          hover:text-[#0F7773]
        "
      >
        <span
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-[#16A6A1]/10
            text-[#16A6A1]
          "
        >
          {open
            ? "−"
            : "?"}
        </span>


        <span>
          {open
            ? "Zatvori obnovu pristupnog koda"
            : "Izgubio sam tajni pristupni kod"}
        </span>
      </button>


      {/* RESET PANEL */}

      {open && (
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-amber-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
              border-b
              border-amber-100
              bg-amber-50
              p-5
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
                bg-amber-100
                font-black
                text-amber-800
              "
            >
              ↻
            </div>


            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-amber-700
                "
              >
                Obnova pristupa
              </p>


              <h3
                className="
                  mt-1
                  text-lg
                  font-black
                  text-[#15171A]
                "
              >
                Izradi novi pristupni kod
              </h3>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[#667085]
                "
              >
                Upiši broj svoje prijave.
                Nakon izrade novog koda,
                prethodni pristupni kod
                odmah prestaje vrijediti.
              </p>
            </div>
          </div>


          <form
            onSubmit={
              resetCode
            }
            className="
              space-y-5
              p-5
            "
          >

            {/* REPORT NUMBER */}

            <div>
              <label
                htmlFor="reset-report-number"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  text-[#344054]
                "
              >
                Broj prijave
              </label>


              <input
                id="reset-report-number"
                type="text"
                value={
                  reportNumber
                }
                onChange={(
                  event
                ) =>
                  setReportNumber(
                    event.target
                      .value
                      .toUpperCase()
                  )
                }
                placeholder="MJ-20260801-A0F216"
                autoComplete="off"
                disabled={
                  loading
                }
                className="
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-3
                  font-mono
                  text-sm
                  font-semibold
                  uppercase
                  text-[#15171A]
                  outline-none
                  transition
                  placeholder:font-normal
                  placeholder:text-[#98A2B3]
                  focus:border-[#16A6A1]
                  focus:ring-4
                  focus:ring-[#16A6A1]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#F8F9F6]
                "
              />
            </div>


            {/* ERROR */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  text-sm
                  text-red-700
                "
              >
                <span
                  className="
                    font-black
                  "
                >
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}


            {/* RESULT */}

            {result?.accessCode && (
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#C8D52B]/40
                  bg-[#C8D52B]/10
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[#C8D52B]/20
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
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
                      Novi pristupni kod
                      je izrađen
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-[#667085]
                      "
                    >
                      Stari kod više ne
                      vrijedi.
                    </p>
                  </div>
                </div>


                <div
                  className="
                    space-y-4
                    p-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#667085]
                      "
                    >
                      Broj prijave
                    </p>


                    <p
                      className="
                        mt-1
                        break-all
                        font-mono
                        text-sm
                        font-black
                        text-[#15171A]
                      "
                    >
                      {
                        result.reportNumber
                      }
                    </p>
                  </div>


                  <div
                    className="
                      rounded-xl
                      bg-[#111317]
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#C8D52B]
                      "
                    >
                      Novi tajni pristupni kod
                    </p>


                    <p
                      className="
                        mt-2
                        break-all
                        font-mono
                        text-xl
                        font-black
                        tracking-wider
                        text-white
                      "
                    >
                      {
                        result.accessCode
                      }
                    </p>
                  </div>


                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      p-4
                    "
                  >
                    <span
                      className="
                        font-black
                        text-red-600
                      "
                    >
                      !
                    </span>

                    <p
                      className="
                        text-xs
                        font-semibold
                        leading-5
                        text-red-700
                      "
                    >
                      Spremi ili fotografiraj
                      novi pristupni kod.
                      Nakon zatvaranja neće
                      se ponovno prikazati,
                      a stari kod više ne
                      vrijedi.
                    </p>
                  </div>
                </div>
              </div>
            )}


            {/* SUBMIT */}

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
                  max-w-md
                  text-xs
                  leading-5
                  text-[#98A2B3]
                "
              >
                Novi kod može se izraditi
                samo za prijavu kojoj tvoj
                račun smije pristupiti.
              </p>


              <button
                type="submit"
                disabled={
                  loading
                }
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
                  font-black
                  text-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#202328]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
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

                    Izrada...
                  </>
                ) : (
                  <>
                    Izradi novi kod

                    <span
                      className="
                        text-[#C8D52B]
                      "
                    >
                      →
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>

        </section>
      )}

    </div>
  );
}