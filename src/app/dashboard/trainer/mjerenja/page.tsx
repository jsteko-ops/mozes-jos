"use client";

import {
  useEffect,
  useMemo,
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
} from "@/lib/services/klijentiService";


type MeasurementItem = {
  id?: string;

  clientId: string;
  clientName: string;

  weight?: number | null;

  // Novi format
  bodyFat?: number | null;
  notes?: string;

  // Stari format
  height?: number | null;
  waist?: number | null;
  chest?: number | null;
  arm?: number | null;

  createdAt?: any;
};


export default function MjerenjaPage() {
  const {
    user,
  } = useAuth();


  const [
    data,
    setData,
  ] =
    useState<
      MeasurementItem[]
    >([]);


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


        const measurementsByClient =
          await Promise.all(
            clients.map(
              async (
                client: any
              ) => {
                const measurements =
                  await getMeasurements(
                    client.id
                  );


                return measurements.map(
                  (
                    measurement: any
                  ) => ({
                    ...measurement,

                    clientId:
                      client.id,

                    clientName:
                      client.name ||
                      "Klijent",
                  })
                );
              }
            )
          );


        const allMeasurements =
          measurementsByClient.flat();


        allMeasurements.sort(
          (a, b) =>
            getTimestamp(
              b.createdAt
            ) -
            getTimestamp(
              a.createdAt
            )
        );


        if (!cancelled) {
          setData(
            allMeasurements
          );
        }
      } catch (loadError) {
        console.error(
          "Greška kod učitavanja mjerenja:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Mjerenja trenutno nije moguće učitati."
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


  const measuredClients =
    useMemo(() => {
      return new Set(
        data.map(
          (measurement) =>
            measurement.clientId
        )
      ).size;
    }, [data]);


  const latestMeasurement =
    data[0];


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
                Mjerenja klijenata
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
                Pregledaj sva
                evidentirana mjerenja
                svojih klijenata na
                jednom mjestu.
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


          {/* SUMMARY */}

          {!loading &&
            !error &&
            data.length > 0 && (
              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-3
                "
              >

                <SummaryCard
                  label="Ukupno mjerenja"
                  value={String(
                    data.length
                  )}
                  accent="lime"
                />


                <SummaryCard
                  label="Klijenata praćeno"
                  value={String(
                    measuredClients
                  )}
                  accent="teal"
                />


                <SummaryCard
                  label="Posljednje mjerenje"
                  value={
                    latestMeasurement
                      ? formatDate(
                          latestMeasurement
                            .createdAt
                        )
                      : "—"
                  }
                  accent="dark"
                />

              </div>
            )}


          {/* LOADING */}

          {loading && (
            <div
              className="
                space-y-4
              "
            >
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-48
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


          {/* ERROR */}

          {!loading &&
            error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-red-700
                  "
                >
                  {error}
                </p>
              </div>
            )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            data.length ===
              0 && (
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
                    bg-[#C8D52B]/15
                    text-2xl
                  "
                >
                  ⚖
                </div>


                <h2
                  className="
                    mt-5
                    text-xl
                    font-black
                    text-[#15171A]
                  "
                >
                  Još nema mjerenja
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
                  Kada zabilježiš
                  prvo mjerenje
                  klijenta, pojavit će
                  se ovdje.
                </p>


                <Link
                  href="/dashboard/trainer/klijenti"
                  className="
                    mt-6
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
                    font-bold
                    text-white
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#202328]
                  "
                >
                  Otvori klijente

                  <span
                    className="
                      text-[#C8D52B]
                    "
                  >
                    →
                  </span>
                </Link>
              </div>
            )}


          {/* MEASUREMENTS */}

          {!loading &&
            !error &&
            data.length > 0 && (
              <div
                className="
                  space-y-4
                "
              >
                {data.map(
                  (
                    measurement,
                    index
                  ) => {
                    const isLatest =
                      index === 0;


                    const hasLegacyData =
                      hasPositiveValue(
                        measurement.height
                      ) ||
                      hasPositiveValue(
                        measurement.waist
                      ) ||
                      hasPositiveValue(
                        measurement.chest
                      ) ||
                      hasPositiveValue(
                        measurement.arm
                      );


                    return (
                      <article
                        key={
                          measurement.id ||
                          `${measurement.clientId}-${index}`
                        }
                        className="
                          group
                          overflow-hidden
                          rounded-2xl
                          border
                          border-[#E5E7EB]
                          bg-white
                          shadow-sm
                          transition-all
                          duration-200
                          hover:border-[#C8D52B]
                          hover:shadow-md
                        "
                      >

                        {/* TOP */}

                        <div
                          className="
                            flex
                            flex-col
                            gap-4
                            border-b
                            border-[#EEF0EC]
                            p-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div
                            className="
                              flex
                              min-w-0
                              items-center
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
                                measurement
                                  .clientName
                              )}
                            </div>


                            <div
                              className="
                                min-w-0
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >
                                <h2
                                  className="
                                    truncate
                                    text-lg
                                    font-black
                                    text-[#15171A]
                                  "
                                >
                                  {
                                    measurement
                                      .clientName
                                  }
                                </h2>


                                {isLatest && (
                                  <span
                                    className="
                                      rounded-full
                                      bg-[#C8D52B]/15
                                      px-2.5
                                      py-1
                                      text-[9px]
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


                              <p
                                className="
                                  mt-1
                                  text-xs
                                  font-medium
                                  text-[#98A2B3]
                                "
                              >
                                {formatDate(
                                  measurement
                                    .createdAt
                                )}
                              </p>
                            </div>
                          </div>


                          <Link
                            href={`/dashboard/trainer/klijenti/${measurement.clientId}?tab=measurements`}
                            className="
                              inline-flex
                              w-fit
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[#E5E7EB]
                              bg-white
                              px-4
                              py-2.5
                              text-xs
                              font-bold
                              text-[#15171A]
                              transition
                              hover:border-[#16A6A1]
                              hover:text-[#128D89]
                            "
                          >
                            Profil klijenta

                            <span>
                              →
                            </span>
                          </Link>
                        </div>


                        {/* VALUES */}

                        <div
                          className="
                            grid
                            gap-3
                            p-5
                            sm:grid-cols-2
                            xl:grid-cols-3
                          "
                        >

                          <MeasurementValue
                            label="Težina"
                            value={
                              hasValue(
                                measurement.weight
                              )
                                ? `${formatNumber(
                                    measurement.weight
                                  )} kg`
                                : "—"
                            }
                            featured
                          />


                          {hasValue(
                            measurement.bodyFat
                          ) && (
                            <MeasurementValue
                              label="Tjelesna mast"
                              value={`${formatNumber(
                                measurement.bodyFat
                              )} %`}
                            />
                          )}


                          {hasPositiveValue(
                            measurement.height
                          ) && (
                            <MeasurementValue
                              label="Visina"
                              value={`${formatNumber(
                                measurement.height
                              )} cm`}
                            />
                          )}


                          {hasPositiveValue(
                            measurement.waist
                          ) && (
                            <MeasurementValue
                              label="Struk"
                              value={`${formatNumber(
                                measurement.waist
                              )} cm`}
                            />
                          )}


                          {hasPositiveValue(
                            measurement.chest
                          ) && (
                            <MeasurementValue
                              label="Prsa"
                              value={`${formatNumber(
                                measurement.chest
                              )} cm`}
                            />
                          )}


                          {hasPositiveValue(
                            measurement.arm
                          ) && (
                            <MeasurementValue
                              label="Ruka"
                              value={`${formatNumber(
                                measurement.arm
                              )} cm`}
                            />
                          )}

                        </div>


                        {/* NOTES */}

                        {measurement.notes
                          ?.trim() && (
                          <div
                            className="
                              border-t
                              border-[#EEF0EC]
                              px-5
                              py-4
                            "
                          >
                            <p
                              className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-[#98A2B3]
                              "
                            >
                              Bilješke
                            </p>

                            <p
                              className="
                                mt-2
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


                        {/* LEGACY MARKER */}

                        {hasLegacyData && (
                          <div
                            className="
                              border-t
                              border-[#EEF0EC]
                              bg-[#F8F9F6]
                              px-5
                              py-3
                            "
                          >
                            <p
                              className="
                                text-[10px]
                                font-semibold
                                text-[#98A2B3]
                              "
                            >
                              Ovo mjerenje
                              sadrži dodatne
                              vrijednosti iz
                              ranijeg sustava
                              mjerenja.
                            </p>
                          </div>
                        )}


                        <div
                          className="
                            h-1
                            bg-gradient-to-r
                            from-[#C8D52B]
                            via-[#16A6A1]
                            to-transparent
                            opacity-0
                            transition-opacity
                            group-hover:opacity-100
                          "
                        />

                      </article>
                    );
                  }
                )}
              </div>
            )}

        </div>

      </PremiumGuard>
    </RoleGuard>
  );
}


function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "lime"
    | "teal"
    | "dark";
}) {
  const accentClass =
    accent === "lime"
      ? "bg-[#C8D52B]/20 text-[#5F6810]"
      : accent === "teal"
      ? "bg-[#16A6A1]/10 text-[#128D89]"
      : "bg-[#111317] text-white";


  return (
    <div
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
        className={`
          inline-flex
          rounded-lg
          px-2.5
          py-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          ${accentClass}
        `}
      >
        {label}
      </div>


      <p
        className="
          mt-4
          text-2xl
          font-black
          tracking-tight
          text-[#15171A]
        "
      >
        {value}
      </p>
    </div>
  );
}


function MeasurementValue({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4

        ${
          featured
            ? `
              border-[#C8D52B]/40
              bg-[#C8D52B]/10
            `
            : `
              border-[#EEF0EC]
              bg-[#F8F9F6]
            `
        }
      `}
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
        {label}
      </p>


      <p
        className="
          mt-1.5
          text-lg
          font-black
          text-[#15171A]
        "
      >
        {value}
      </p>
    </div>
  );
}


function getTimestamp(
  value: any
) {
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


  if (
    typeof value.seconds ===
    "number"
  ) {
    return (
      value.seconds * 1000
    );
  }


  const parsed =
    new Date(
      value
    ).getTime();


  return Number.isNaN(parsed)
    ? 0
    : parsed;
}


function formatDate(
  value: any
) {
  if (!value) {
    return "Datum nije dostupan";
  }


  try {
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
  } catch {
    return "Datum nije dostupan";
  }
}


function formatNumber(
  value:
    | number
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }


  return String(
    value
  ).replace(
    ".",
    ","
  );
}


function hasValue(
  value:
    | number
    | null
    | undefined
) {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(
      Number(value)
    )
  );
}


function hasPositiveValue(
  value:
    | number
    | null
    | undefined
) {
  return (
    hasValue(value) &&
    Number(value) > 0
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