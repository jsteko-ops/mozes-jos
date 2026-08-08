"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import MeasurementForm from "@/components/measurements/MeasurementForm";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  getMeasurements,
} from "@/lib/services/klijentiService";


type Measurement = {
  id: string;
  weight?: number;
  bodyFat?: number | null;
  notes?: string;
  createdAt?: any;
};


export default function ClientMeasurements({
  clientId,
}: {
  clientId: string;
}) {
  const {
    userProfile,
  } = useAuth();


  const [
    measurements,
    setMeasurements,
  ] = useState<Measurement[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const hasPro =
    userProfile?.isPremium ===
      true &&
    userProfile
      ?.subscriptionStatus ===
      "active";


  async function loadMeasurements() {
    if (!clientId) {
      return;
    }

    setLoading(true);

    try {
      const data =
        await getMeasurements(
          clientId
        );

      const sorted = [
        ...(data as Measurement[]),
      ].sort(
        (a, b) =>
          getTimestamp(b) -
          getTimestamp(a)
      );

      setMeasurements(
        sorted
      );
    } catch (error) {
      console.error(
        "Greška kod učitavanja mjerenja:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadMeasurements();
  }, [clientId]);


  function getTimestamp(
    measurement: Measurement
  ) {
    const value =
      measurement.createdAt;

    if (!value) {
      return 0;
    }

    if (
      typeof value.toMillis ===
      "function"
    ) {
      return value.toMillis();
    }

    if (
      typeof value.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .getTime();
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  }


  function formatDate(
    value: any
  ) {
    if (!value) {
      return "Datum nije dostupan";
    }

    const date =
      typeof value.toDate ===
      "function"
        ? value.toDate()
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Datum nije dostupan";
    }

    return date.toLocaleDateString(
      "hr-HR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }


  const initialMeasurement =
    [...measurements].sort(
      (a, b) =>
        getTimestamp(a) -
        getTimestamp(b)
    )[0];


  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-5
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-6
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Napredak
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#15171A]
            "
          >
            Mjerenja klijenta
          </h2>

          <p
            className="
              mt-1
              max-w-xl
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Evidentiraj težinu,
            tjelesnu mast i bilješke
            kroz vrijeme.
          </p>
        </div>


        <div
          className={`
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            px-3
            py-2
            ${
              hasPro
                ? `
                  bg-[#C8D52B]/15
                  text-[#5F6810]
                `
                : `
                  bg-[#F4F6F2]
                  text-[#667085]
                `
            }
          `}
        >
          <span
            className={`
              h-2
              w-2
              rounded-full
              ${
                hasPro
                  ? "bg-[#C8D52B]"
                  : "bg-[#98A2B3]"
              }
            `}
          />

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wider
            "
          >
            {hasPro
              ? "Pro mjerenja"
              : "Free mjerenje"}
          </span>
        </div>
      </div>


      {/* NEW MEASUREMENT */}

      {loading ? (
        <div
          className="
            h-48
            animate-pulse
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
          "
        />
      ) : measurements.length ===
          0 ||
        hasPro ? (
        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-1
                w-10
                rounded-full
                bg-[#C8D52B]
              "
            />

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#16A6A1]
              "
            >
              Novo mjerenje
            </p>
          </div>


          <MeasurementForm
            clientId={
              clientId
            }
            onCreated={() => {
              void loadMeasurements();
            }}
          />


          {!hasPro &&
            measurements.length ===
              0 && (
              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-[#667085]
                "
              >
                Prvo mjerenje je
                besplatno. Za daljnje
                praćenje napretka
                potreban je Možeš Još
                Pro.
              </p>
            )}
        </div>
      ) : (
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-[#C8D52B]/40
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              absolute
              right-0
              top-0
              h-32
              w-32
              rounded-bl-full
              bg-[#C8D52B]/10
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
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#111317]
                  text-lg
                "
              >
                🔒
              </div>

              <h3
                className="
                  mt-4
                  text-lg
                  font-black
                  text-[#15171A]
                "
              >
                Nastavi pratiti
                napredak
              </h3>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[#667085]
                "
              >
                Prvo mjerenje je
                spremljeno. Dodatna
                mjerenja i puna
                povijest dostupni su
                uz Možeš Još Pro.
              </p>
            </div>


            <Link
              href="/dashboard/trainer/naplata"
              className="
                inline-flex
                min-h-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#C8D52B]
                px-5
                py-3
                text-sm
                font-black
                text-[#111317]
                transition
                hover:-translate-y-0.5
                hover:bg-[#B8C525]
              "
            >
              Otključaj Pro
            </Link>
          </div>
        </div>
      )}


      {/* HISTORY */}

      {!loading &&
        measurements.length >
          0 && (
          <div className="space-y-4">

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[#16A6A1]
                  "
                >
                  Evidencija
                </p>

                <h3
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-[#15171A]
                  "
                >
                  {hasPro
                    ? "Povijest mjerenja"
                    : "Početno mjerenje"}
                </h3>
              </div>


              {hasPro && (
                <span
                  className="
                    rounded-full
                    bg-[#F4F6F2]
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-[#667085]
                  "
                >
                  {
                    measurements.length
                  }{" "}
                  mjerenja
                </span>
              )}
            </div>


            <div
              className="
                grid
                gap-4
                lg:grid-cols-2
              "
            >
              {(hasPro
                ? measurements
                : initialMeasurement
                  ? [
                      initialMeasurement,
                    ]
                  : []
              ).map(
                (
                  measurement,
                  index
                ) => (
                  <div
                    key={
                      measurement.id
                    }
                    className="
                      rounded-2xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      p-5
                      shadow-sm
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
                          items-center
                          gap-3
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
                            text-lg
                          "
                        >
                          ⚖️
                        </div>

                        <div>
                          <p
                            className="
                              text-2xl
                              font-black
                              tracking-tight
                              text-[#15171A]
                            "
                          >
                            {measurement.weight ??
                              "-"}{" "}
                            kg
                          </p>

                          <p
                            className="
                              text-xs
                              text-[#98A2B3]
                            "
                          >
                            {formatDate(
                              measurement.createdAt
                            )}
                          </p>
                        </div>
                      </div>


                      {hasPro &&
                        index ===
                          0 && (
                          <span
                            className="
                              rounded-full
                              bg-[#C8D52B]/15
                              px-2.5
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-[#5F6810]
                            "
                          >
                            Najnovije
                          </span>
                        )}
                    </div>


                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-2
                        gap-3
                      "
                    >
                      <div
                        className="
                          rounded-xl
                          bg-[#F4F6F2]
                          p-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-[#98A2B3]
                          "
                        >
                          Težina
                        </p>

                        <p
                          className="
                            mt-1
                            font-black
                            text-[#15171A]
                          "
                        >
                          {measurement.weight ??
                            "-"}{" "}
                          kg
                        </p>
                      </div>


                      <div
                        className="
                          rounded-xl
                          bg-[#F4F6F2]
                          p-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-[#98A2B3]
                          "
                        >
                          Tjelesna mast
                        </p>

                        <p
                          className="
                            mt-1
                            font-black
                            text-[#15171A]
                          "
                        >
                          {measurement.bodyFat !==
                            null &&
                          measurement.bodyFat !==
                            undefined
                            ? `${measurement.bodyFat}%`
                            : "—"}
                        </p>
                      </div>
                    </div>


                    {measurement.notes && (
                      <div
                        className="
                          mt-3
                          rounded-xl
                          border
                          border-[#EEF0EC]
                          bg-[#FBFCFA]
                          p-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-[#98A2B3]
                          "
                        >
                          Bilješka
                        </p>

                        <p
                          className="
                            mt-1
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                            text-[#667085]
                          "
                        >
                          {
                            measurement.notes
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

          </div>
        )}


      {/* EMPTY */}

      {!loading &&
        measurements.length ===
          0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D8DDD0]
              bg-white
              px-6
              py-10
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
                text-xl
              "
            >
              📏
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Još nema mjerenja
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-[#667085]
              "
            >
              Dodaj početno mjerenje
              klijenta iz obrasca
              iznad.
            </p>
          </div>
        )}

    </div>
  );
}