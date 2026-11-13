"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import Link from "next/link";


interface Checkin {
  id: string;

  weight?: number;

  energy?:
    | number
    | string;

  sleep?:
    | number
    | string;

  hunger?:
    | number
    | string;

  water?: string;

  comment?: string;

  trainerComment?: string;

  createdAt?: any;

  reviewed?: boolean;
}


interface Props {
  checkins: Checkin[];

  selectedCheckin?:
    | string
    | null;

}


function formatDate(
  timestamp: any
) {
  if (!timestamp) {
    return "-";
  }


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(
          timestamp
        );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }


  return date.toLocaleString(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


export default function ClientCheckins({
  checkins,
  selectedCheckin,
}: Props) {
  const selectedRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const sortedCheckins =
    useMemo(
      () =>
        [...checkins].sort(
          (a, b) =>
            getTimestamp(
              b.createdAt
            ) -
            getTimestamp(
              a.createdAt
            )
        ),
      [checkins]
    );


  const repliedCount =
    useMemo(
      () =>
        checkins.filter(
          (item) =>
            Boolean(
              item.trainerComment
            )
        ).length,
      [checkins]
    );


  useEffect(() => {
    if (
      selectedCheckin &&
      selectedRef.current
    ) {
      selectedRef.current.scrollIntoView({
        behavior:
          "smooth",

        block:
          "center",
      });
    }
  }, [
    selectedCheckin,
    sortedCheckins,
  ]);


  if (
    checkins.length === 0
  ) {
    return (
      <section
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
          C
        </div>


        <h2
          className="
            mt-4
            text-lg
            font-black
            text-[#15171A]
          "
        >
          Još nema Check-inova
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
          Nakon što pošalješ prvi
          Check-in, ovdje ćeš moći
          pratiti svoje unose i
          odgovore trenera.
        </p>
      </section>
    );
  }


  return (
    <section className="space-y-5">

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
            Moji Check-inovi
          </h2>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Pregledaj svoje unose,
            odgovore trenera i
            nastavak komunikacije.
          </p>
        </div>


        <div
          className="
            flex
            w-fit
            gap-2
          "
        >
          <MiniStat
            value={
              checkins.length
            }
            label="Ukupno"
            accent="dark"
          />


          <MiniStat
            value={
              repliedCount
            }
            label="Odgovori"
            accent="lime"
          />
        </div>
      </div>


      {/* CHECKINS */}

      <div className="space-y-5">
        {sortedCheckins.map(
          (
            checkin,
            index
          ) => {
            const isSelected =
              selectedCheckin ===
              checkin.id;


            const hasTrainerReply =
              Boolean(
                checkin.trainerComment
              );


            return (
              <div
                key={
                  checkin.id
                }
                ref={
                  isSelected
                    ? selectedRef
                    : null
                }
                className={`
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  bg-white
                  shadow-sm
                  transition
                  ${
                    isSelected
                      ? "border-[#16A6A1] ring-4 ring-[#16A6A1]/10"
                      : "border-[#E5E7EB]"
                  }
                `}
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
                    sm:p-6
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
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#111317]
                        text-sm
                        font-black
                        text-[#C8D52B]
                      "
                    >
                      {String(
                        sortedCheckins.length -
                          index
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>


                    <div>
                      <p
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[#98A2B3]
                        "
                      >
                        Check-in
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          font-black
                          text-[#15171A]
                        "
                      >
                        {formatDate(
                          checkin.createdAt
                        )}
                      </p>
                    </div>
                  </div>


                  <StatusBadge
                    hasTrainerReply={
                      hasTrainerReply
                    }
                  />
                </div>


                {/* METRICS */}

                <div
                  className="
                    grid
                    gap-3
                    p-5
                    sm:grid-cols-2
                    sm:p-6
                    lg:grid-cols-4
                  "
                >
                  <MetricCard
                    label="Težina"
                    value={
                      checkin.weight !=
                      null
                        ? `${checkin.weight} kg`
                        : "—"
                    }
                    accent="lime"
                  />


                  <MetricCard
                    label="Energija"
                    value={
                      checkin.energy !=
                      null
                        ? `${checkin.energy}/5`
                        : "—"
                    }
                    accent="teal"
                  />


                  <MetricCard
                    label="San"
                    value={
                      checkin.sleep !=
                      null
                        ? `${checkin.sleep}/5`
                        : "—"
                    }
                    accent="dark"
                  />


                  <MetricCard
                    label="Glad"
                    value={
                      checkin.hunger !=
                      null
                        ? `${checkin.hunger}/5`
                        : "—"
                    }
                    accent="light"
                  />
                </div>


                {/* WATER */}

                {checkin.water && (
                  <div
                    className="
                      px-5
                      pb-5
                      sm:px-6
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        bg-[#F6F7F3]
                        px-4
                        py-3
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-bold
                          text-[#667085]
                        "
                      >
                        Unos vode
                      </span>


                      <span
                        className="
                          text-sm
                          font-black
                          text-[#15171A]
                        "
                      >
                        {
                          checkin.water
                        }
                      </span>
                    </div>
                  </div>
                )}


                {/* MY COMMENT */}

                {checkin.comment && (
                  <div
                    className="
                      border-t
                      border-[#EEF0EC]
                      p-5
                      sm:p-6
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#98A2B3]
                      "
                    >
                      Moj komentar
                    </p>


                    <p
                      className="
                        mt-2
                        whitespace-pre-wrap
                        text-sm
                        font-semibold
                        leading-6
                        text-[#344054]
                      "
                    >
                      {
                        checkin.comment
                      }
                    </p>
                  </div>
                )}


                {/* TRAINER REPLY */}

                {hasTrainerReply ? (
                  <div
                    className="
                      border-t
                      border-[#EEF0EC]
                      bg-[#16A6A1]/[0.04]
                      p-5
                      sm:p-6
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
                          bg-[#16A6A1]
                          text-xs
                          font-black
                          text-white
                        "
                      >
                        T
                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-[#128D89]
                          "
                        >
                          Odgovor trenera
                        </p>


                        <p
                          className="
                            mt-2
                            whitespace-pre-wrap
                            text-sm
                            font-semibold
                            leading-6
                            text-[#344054]
                          "
                        >
                          {
                            checkin.trainerComment
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="
                      border-t
                      border-[#EEF0EC]
                      bg-[#FFF8E7]
                      px-5
                      py-4
                      sm:px-6
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0
                          rounded-full
                          bg-amber-500
                        "
                      />


                      <p
                        className="
                          text-xs
                          font-bold
                          text-amber-800
                        "
                      >
                        Trener još nije
                        odgovorio na ovaj
                        Check-in.
                      </p>
                    </div>
                  </div>
                )}


                {/* CHAT FOLLOW-UP */}

                {hasTrainerReply && (
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      border-t
                      border-[#EEF0EC]
                      p-5
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:p-6
                    "
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[#16A6A1]/10
                          text-xl
                        "
                      >
                        💬
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#15171A]">
                          Daljnja pitanja?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#667085]">
                          Za nastavak razgovora s trenerom otvori Chat.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/chat"
                      className="
                        inline-flex
                        min-h-11
                        shrink-0
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
                        transition
                        hover:-translate-y-0.5
                        hover:bg-[#202328]
                      "
                    >
                      Otvori Chat
                      <span className="text-[#C8D52B]">→</span>
                    </Link>
                  </div>
                )}


                {/* SELECTED MARKER */}

                {isSelected && (
                  <div
                    className="
                      absolute
                      right-5
                      top-5
                      rounded-full
                      bg-[#16A6A1]
                      px-3
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-wider
                      text-white
                      shadow-lg
                    "
                  >
                    Odabrano
                  </div>
                )}


                <div
                  className="
                    h-1
                    bg-gradient-to-r
                    from-[#C8D52B]
                    via-[#16A6A1]
                    to-transparent
                  "
                />

              </div>
            );
          }
        )}
      </div>

    </section>
  );
}


function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "lime"
    | "teal"
    | "dark"
    | "light";
}) {
  const colors = {
    lime:
      "bg-[#C8D52B]/15 text-[#68720F]",

    teal:
      "bg-[#16A6A1]/10 text-[#128D89]",

    dark:
      "bg-[#111317] text-[#C8D52B]",

    light:
      "bg-[#F4F6F2] text-[#344054]",
  };


  return (
    <div
      className="
        rounded-2xl
        border
        border-[#EEF0EC]
        bg-white
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-[#98A2B3]
        "
      >
        {label}
      </p>


      <div
        className={`
          mt-3
          inline-flex
          min-h-9
          items-center
          rounded-xl
          px-3
          py-2
          text-sm
          font-black
          ${colors[accent]}
        `}
      >
        {value}
      </div>
    </div>
  );
}


function StatusBadge({
  hasTrainerReply,
}: {
  hasTrainerReply: boolean;
}) {
  return (
    <div
      className={`
        inline-flex
        w-fit
        items-center
        gap-2
        rounded-full
        px-3
        py-2
        text-[9px]
        font-bold
        uppercase
        tracking-wider
        ${
          hasTrainerReply
            ? "bg-[#C8D52B]/15 text-[#68720F]"
            : "bg-amber-50 text-amber-700"
        }
      `}
    >
      <span
        className={`
          h-2
          w-2
          rounded-full
          ${
            hasTrainerReply
              ? "bg-[#C8D52B]"
              : "bg-amber-500"
          }
        `}
      />


      {hasTrainerReply
        ? "Trener odgovorio"
        : "Čeka odgovor"}
    </div>
  );
}


function MiniStat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent:
    | "dark"
    | "lime";
}) {
  return (
    <div
      className={`
        min-w-[86px]
        rounded-2xl
        px-4
        py-3
        ${
          accent === "dark"
            ? "bg-[#111317]"
            : "bg-[#C8D52B]/15"
        }
      `}
    >
      <p
        className={`
          text-lg
          font-black
          ${
            accent === "dark"
              ? "text-[#C8D52B]"
              : "text-[#68720F]"
          }
        `}
      >
        {value}
      </p>


      <p
        className={`
          mt-0.5
          text-[8px]
          font-bold
          uppercase
          tracking-wider
          ${
            accent === "dark"
              ? "text-white/40"
              : "text-[#68720F]/70"
          }
        `}
      >
        {label}
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


  try {
    if (
      typeof value.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .getTime();
    }


    const date =
      new Date(
        value
      );


    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  } catch {
    return 0;
  }
}