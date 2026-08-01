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
  ] = useState(false);


  const [
    reportNumber,
    setReportNumber,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    result,
    setResult,
  ] = useState<ResetApiResponse | null>(null);



  async function resetCode(
    event: FormEvent<HTMLFormElement>
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


    if (!normalizedReportNumber) {

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
        await response.json() as
          ResetApiResponse;


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


    } catch (error: unknown) {


      console.error(
        "Greška kod izrade novog pristupnog koda:",
        error
      );


      setError(

        error instanceof Error

          ? error.message

          : "Novi kod nije moguće izraditi."

      );


    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="space-y-4">


      <button
        type="button"
        onClick={() => {

          setOpen(
            (current) => !current
          );

          setError("");

          setResult(null);

        }}
        className="
          text-sm
          font-semibold
          text-violet-800
          underline
          hover:text-violet-950
        "
      >

        {
          open

            ? "Zatvori obnovu pristupnog koda"

            : "Izgubio sam tajni pristupni kod"
        }

      </button>



      {
        open && (

          <div
            className="
              space-y-4
              rounded-xl
              border
              border-amber-300
              bg-amber-50
              p-5
            "
          >


            <div>

              <h3 className="font-bold text-amber-950">

                Izrada novog pristupnog koda

              </h3>


              <p className="mt-1 text-sm text-amber-900">

                Upiši broj svoje prijave.
                Stari pristupni kod odmah će prestati vrijediti.

              </p>

            </div>



            <form
              onSubmit={resetCode}
              className="space-y-4"
            >


              <div>

                <label className="mb-2 block font-semibold">

                  Broj prijave

                </label>


                <input
                  type="text"
                  value={reportNumber}
                  onChange={(event) =>
                    setReportNumber(
                      event.target.value
                        .toUpperCase()
                    )
                  }
                  placeholder="MJ-20260801-A0F216"
                  autoComplete="off"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-amber-300
                    bg-white
                    px-4
                    py-3
                    font-mono
                    uppercase
                  "
                />

              </div>



              {
                error && (

                  <div
                    className="
                      rounded-lg
                      border
                      border-red-200
                      bg-red-50
                      p-4
                      text-red-700
                    "
                  >

                    {error}

                  </div>

                )
              }



              {
                result?.accessCode && (

                  <div
                    className="
                      space-y-3
                      rounded-lg
                      border
                      border-green-300
                      bg-green-50
                      p-5
                    "
                  >

                    <p className="font-bold text-green-900">

                      Novi pristupni kod je izrađen ✅

                    </p>


                    <p>

                      <b>Broj prijave:</b>{" "}

                      <span className="font-mono">

                        {result.reportNumber}

                      </span>

                    </p>


                    <p>

                      <b>Novi pristupni kod:</b>{" "}

                      <span className="font-mono text-lg">

                        {result.accessCode}

                      </span>

                    </p>


                    <p className="font-semibold text-red-700">

                      Spremi ili fotografiraj novi kod.
                      Stari kod više ne vrijedi.

                    </p>

                  </div>

                )
              }



              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  bg-amber-700
                  px-5
                  py-3
                  font-bold
                  text-white
                  hover:bg-amber-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {
                  loading

                    ? "Izrada novog koda..."

                    : "Izradi novi pristupni kod"
                }

              </button>


            </form>


          </div>

        )
      }


    </div>

  );

}