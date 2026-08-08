"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  markCheckinReviewed,
  saveTrainerComment,
} from "@/lib/services/klijentiService";


interface Checkin {
  id: string;

  weight: number;
  energy: number;
  sleep: number;
  hunger: number;
  water: string;

  comment: string;

  createdAt?: any;

  reviewed?: boolean;

  trainerComment?: string;

  clientReply?: string;
}


interface CheckinHistoryProps {
  checkins: Checkin[];

  clientId: string;

  onReviewed: () => void;

  targetCheckinId?: string | null;
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


export default function CheckinHistory({
  checkins,
  clientId,
  onReviewed,
  targetCheckinId,
}: CheckinHistoryProps) {
  const [
    highlightedCheckin,
    setHighlightedCheckin,
  ] =
    useState<string | null>(
      null
    );

  const [
    comments,
    setComments,
  ] =
    useState<
      Record<string, string>
    >({});

  const [
    saving,
    setSaving,
  ] =
    useState<string | null>(
      null
    );

  const [
    editing,
    setEditing,
  ] =
    useState<string | null>(
      null
    );


  async function handleReviewed(
    checkinId: string
  ) {
    await markCheckinReviewed(
      clientId,
      checkinId
    );

    onReviewed();
  }


  async function handleSaveComment(
    checkinId: string
  ) {
    try {
      setSaving(
        checkinId
      );

      await saveTrainerComment(
        clientId,
        checkinId,
        comments[
          checkinId
        ] || ""
      );

      setEditing(null);

      onReviewed();
    } catch (error) {
      console.error(
        "Greška kod spremanja komentara:",
        error
      );

      alert(
        "Komentar se nije mogao spremiti."
      );
    } finally {
      setSaving(null);
    }
  }


  useEffect(() => {
    if (!targetCheckinId) {
      return;
    }

    const element =
      document.getElementById(
        targetCheckinId
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlightedCheckin(
      targetCheckinId
    );

    const timer =
      setTimeout(() => {
        setHighlightedCheckin(
          null
        );
      }, 10000);

    return () =>
      clearTimeout(
        timer
      );
  }, [
    targetCheckinId,
    checkins,
  ]);


  const sortedCheckins =
    [...checkins].sort(
      (
        a: any,
        b: any
      ) =>
        (
          b.createdAt
            ?.seconds || 0
        ) -
        (
          a.createdAt
            ?.seconds || 0
        )
    );


  const pendingCount =
    checkins.filter(
      (checkin) =>
        !checkin.reviewed
    ).length;


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
            Praćenje napretka
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#15171A]
            "
          >
            Povijest Check-inova
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[#667085]
            "
          >
            Pregledaj stanje klijenta,
            odgovori komentarom i
            označi Check-in kao
            pregledan.
          </p>
        </div>


        <div
          className="
            flex
            gap-2
          "
        >
          <div
            className="
              rounded-xl
              bg-[#F4F6F2]
              px-4
              py-2.5
              text-center
            "
          >
            <p
              className="
                text-lg
                font-black
                text-[#15171A]
              "
            >
              {checkins.length}
            </p>

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
          </div>


          <div
            className="
              rounded-xl
              bg-[#C8D52B]/15
              px-4
              py-2.5
              text-center
            "
          >
            <p
              className="
                text-lg
                font-black
                text-[#5F6810]
              "
            >
              {pendingCount}
            </p>

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-[#5F6810]
              "
            >
              Čeka
            </p>
          </div>
        </div>
      </div>


      {/* EMPTY */}

      {checkins.length ===
        0 && (
        <div
          className="
            rounded-2xl
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
              text-xl
            "
          >
            ✓
          </div>

          <h3
            className="
              mt-4
              text-lg
              font-black
              text-[#15171A]
            "
          >
            Još nema Check-inova
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-[#667085]
            "
          >
            Novi Check-inovi klijenta
            pojavit će se ovdje.
          </p>
        </div>
      )}


      {/* CHECKINS */}

      <div className="space-y-4">
        {sortedCheckins.map(
          (checkin) => {
            const highlighted =
              highlightedCheckin ===
              checkin.id;

            const pending =
              !checkin.reviewed;


            return (
              <div
                id={checkin.id}
                key={checkin.id}
                className={`
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                  shadow-sm
                  transition-all
                  duration-500

                  ${
                    highlighted
                      ? `
                        border-[#C8D52B]
                        ring-4
                        ring-[#C8D52B]/20
                      `
                      : pending
                      ? `
                        border-[#F2D675]
                      `
                      : `
                        border-[#E5E7EB]
                      `
                  }
                `}
              >

                {/* CARD HEADER */}

                <div
                  className={`
                    flex
                    flex-col
                    gap-3
                    border-b
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    ${
                      pending
                        ? `
                          border-[#F4E8B8]
                          bg-[#FFFDF5]
                        `
                        : `
                          border-[#EEF0EC]
                          bg-[#FBFCFA]
                        `
                    }
                  `}
                >
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


                  {checkin.reviewed ? (
                    <span
                      className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-full
                        bg-[#16A6A1]/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#128D89]
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-[#16A6A1]
                        "
                      />

                      Pregledano
                    </span>
                  ) : (
                    <span
                      className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-full
                        bg-[#C8D52B]/20
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#5F6810]
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          animate-pulse
                          rounded-full
                          bg-[#C8D52B]
                        "
                      />

                      Čeka pregled
                    </span>
                  )}
                </div>


                <div
                  className="
                    space-y-5
                    p-5
                  "
                >

                  {/* STATS */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      md:grid-cols-5
                    "
                  >
                    <Stat
                      label="Težina"
                      value={`${String(
                        checkin.weight
                      ).replace(
                        ".",
                        ","
                      )} kg`}
                      icon="⚖️"
                    />

                    <Stat
                      label="Energija"
                      value={`${checkin.energy}/5`}
                      icon="⚡"
                    />

                    <Stat
                      label="San"
                      value={`${checkin.sleep}/5`}
                      icon="😴"
                    />

                    <Stat
                      label="Glad"
                      value={`${checkin.hunger}/5`}
                      icon="🍽️"
                    />

                    <Stat
                      label="Voda"
                      value={
                        checkin.water
                      }
                      icon="💧"
                    />
                  </div>


                  {/* CLIENT COMMENT */}

                  {checkin.comment && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-[#E5E7EB]
                        bg-[#F4F6F2]
                        p-4
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
                        Komentar klijenta
                      </p>

                      <p
                        className="
                          mt-2
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          text-[#15171A]
                        "
                      >
                        {checkin.comment}
                      </p>
                    </div>
                  )}


                  {/* TRAINER COMMENT */}

                  <div
                    className="
                      rounded-xl
                      border
                      border-[#16A6A1]/20
                      bg-[#16A6A1]/5
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-black
                          text-[#128D89]
                        "
                      >
                        Komentar trenera
                      </p>


                      {checkin.trainerComment &&
                        editing !==
                          checkin.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setComments({
                                ...comments,

                                [checkin.id]:
                                  checkin.trainerComment ||
                                  "",
                              });

                              setEditing(
                                checkin.id
                              );
                            }}
                            className="
                              text-xs
                              font-bold
                              text-[#16A6A1]
                              hover:text-[#111317]
                            "
                          >
                            Uredi
                          </button>
                        )}
                    </div>


                    {checkin.trainerComment &&
                    editing !==
                      checkin.id ? (
                      <p
                        className="
                          mt-3
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          text-[#15171A]
                        "
                      >
                        {
                          checkin.trainerComment
                        }
                      </p>
                    ) : (
                      <textarea
                        className="
                          mt-3
                          min-h-28
                          w-full
                          resize-y
                          rounded-xl
                          border
                          border-[#E5E7EB]
                          bg-white
                          px-4
                          py-3
                          text-sm
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#98A2B3]
                          focus:border-[#16A6A1]
                          focus:ring-4
                          focus:ring-[#16A6A1]/10
                        "
                        placeholder="Napiši komentar klijentu..."
                        value={
                          comments[
                            checkin.id
                          ] || ""
                        }
                        onChange={(
                          event
                        ) =>
                          setComments({
                            ...comments,

                            [checkin.id]:
                              event
                                .target
                                .value,
                          })
                        }
                      />
                    )}


                    {(!checkin.trainerComment ||
                      editing ===
                        checkin.id) && (
                      <div
                        className="
                          mt-3
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            saving ===
                            checkin.id
                          }
                          onClick={() =>
                            void handleSaveComment(
                              checkin.id
                            )
                          }
                          className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#111317]
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-white
                            transition
                            hover:bg-[#202328]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {saving ===
                          checkin.id
                            ? "Spremanje..."
                            : "Spremi komentar"}
                        </button>


                        {editing ===
                          checkin.id && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditing(
                                null
                              )
                            }
                            className="
                              rounded-xl
                              border
                              border-[#E5E7EB]
                              bg-white
                              px-4
                              py-2
                              text-xs
                              font-bold
                              text-[#667085]
                              hover:bg-[#F4F6F2]
                            "
                          >
                            Odustani
                          </button>
                        )}
                      </div>
                    )}
                  </div>


                  {/* CLIENT REPLY */}

                  {checkin.clientReply && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-[#C8D52B]/30
                        bg-[#C8D52B]/10
                        p-4
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-[#5F6810]
                        "
                      >
                        Odgovor klijenta
                      </p>

                      <p
                        className="
                          mt-2
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          text-[#15171A]
                        "
                      >
                        {
                          checkin.clientReply
                        }
                      </p>
                    </div>
                  )}


                  {/* REVIEW BUTTON */}

                  {!checkin.reviewed && (
                    <div
                      className="
                        flex
                        justify-end
                        border-t
                        border-[#EEF0EC]
                        pt-4
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void handleReviewed(
                            checkin.id
                          )
                        }
                        className="
                          inline-flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2
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
                        ✓ Označi pregledano
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          }
        )}
      </div>

    </div>
  );
}


function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      className="
        rounded-xl
        bg-[#F4F6F2]
        p-3
      "
    >
      <div
        className="
          mb-2
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-white
          text-sm
        "
      >
        {icon}
      </div>

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

      <p
        className="
          mt-1
          text-sm
          font-black
          text-[#15171A]
        "
      >
        {value}
      </p>
    </div>
  );
}