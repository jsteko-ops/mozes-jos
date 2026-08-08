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

import {
  useAuth,
} from "@/components/auth/AuthProvider";


type EditableStatus =
  | "in_review"
  | "resolved"
  | "closed";


type SafeReport = {
  id: string;

  reportNumber: string;

  anonymous: boolean;

  reporter: {
    name: string | null;
    email: string | null;
  } | null;

  accused: {
    role: string;
    name: string;
  };

  category: string;

  description: string;

  occurredAt: string | null;

  location: string | null;

  status: string;

  assignmentStatus: string;

  response: string | null;

  respondedByRole:
    string | null;

  responseAt: string | null;

  statusChangedAt:
    string | null;

  createdAt: string | null;

  updatedAt: string | null;
};


type ApiResponse = {
  reports?: SafeReport[];
  error?: string;
};


type UpdateApiResponse = {
  ok?: boolean;
  status?: string;
  response?: string | null;
  error?: string;
};


function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleString(
    "hr-HR"
  );
}


function formatOccurredAt(
  value: string | null
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleString(
    "hr-HR"
  );
}


function formatAccusedRole(
  role: string
) {
  switch (role) {
    case "trainer":
      return "Trener";

    case "gym_owner":
      return "Vlasnik teretane";

    case "staff":
      return "Drugi zaposlenik";

    default:
      return "Druga osoba";
  }
}


function formatCategory(
  category: string
) {
  switch (category) {
    case "inappropriate_comments":
      return "Neprimjereni komentari";

    case "sexual_harassment":
      return "Seksualno uznemiravanje";

    case "unwanted_touching":
      return "Neželjeno dodirivanje";

    case "threats":
      return "Prijetnje ili zastrašivanje";

    case "discrimination":
      return "Diskriminacija";

    case "violence":
      return "Fizičko nasilje";

    case "privacy":
      return "Narušavanje privatnosti";

    case "unsafe_behavior":
      return "Nesigurno ponašanje ili ugrožavanje";

    default:
      return "Drugo";
  }
}


function formatStatus(
  status: string
) {
  switch (status) {
    case "submitted":
      return "Nova prijava";

    case "pending_admin":
      return "Čeka administratora";

    case "in_review":
      return "U obradi";

    case "resolved":
      return "Riješeno";

    case "closed":
      return "Zatvoreno";

    default:
      return status;
  }
}


function formatResponderRole(
  role: string | null
) {
  switch (role) {
    case "gym_owner":
      return "Vlasnik teretane";

    case "admin":
      return "Administrator platforme";

    case "trainer":
      return "Trener";

    default:
      return "Ovlaštena osoba";
  }
}


function canSetStatus(
  currentStatus: string,
  newStatus: EditableStatus
) {
  if (
    currentStatus ===
      "submitted" ||
    currentStatus ===
      "pending_admin"
  ) {
    return true;
  }


  if (
    currentStatus ===
    "in_review"
  ) {
    return (
      newStatus ===
        "resolved" ||
      newStatus ===
        "closed"
    );
  }


  if (
    currentStatus ===
    "resolved"
  ) {
    return (
      newStatus ===
        "in_review" ||
      newStatus ===
        "closed"
    );
  }


  if (
    currentStatus ===
    "closed"
  ) {
    return (
      newStatus ===
      "in_review"
    );
  }


  return false;
}


function statusBadgeClass(
  status: string
) {
  switch (status) {
    case "in_review":
      return `
        border-[#16A6A1]/20
        bg-[#16A6A1]/10
        text-[#128D89]
      `;

    case "resolved":
      return `
        border-[#C8D52B]/30
        bg-[#C8D52B]/15
        text-[#5F6810]
      `;

    case "closed":
      return `
        border-[#E5E7EB]
        bg-[#F4F6F2]
        text-[#667085]
      `;

    case "pending_admin":
      return `
        border-amber-200
        bg-amber-50
        text-amber-700
      `;

    default:
      return `
        border-red-200
        bg-red-50
        text-red-700
      `;
  }
}


export default function SafeReportsInboxPage() {
  const searchParams =
    useSearchParams();


  const selectedReportId =
    searchParams.get(
      "report"
    );


  const {
    user,
  } = useAuth();


  const [
    reports,
    setReports,
  ] =
    useState<
      SafeReport[]
    >([]);


  const [
    responseDrafts,
    setResponseDrafts,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});


  const [
    savingReportId,
    setSavingReportId,
  ] =
    useState<
      string | null
    >(null);


  const [
    actionErrors,
    setActionErrors,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});


  const [
    actionMessages,
    setActionMessages,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});


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
    if (!user) {
      return;
    }


    let cancelled =
      false;


    async function loadReports() {
      try {
        setLoading(true);
        setError("");


        const token =
          await user!.getIdToken();


        const response =
          await fetch(
            "/api/safe-reports/inbox",
            {
              method:
                "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache:
                "no-store",
            }
          );


      const data =
  (await response.json()) as ApiResponse;


        if (!response.ok) {
          throw new Error(
            data.error ||
              "Prijave nije moguće učitati."
          );
        }


        if (!cancelled) {
          const loadedReports =
            data.reports ||
            [];


          setReports(
            loadedReports
          );


          setResponseDrafts(
            (
              currentDrafts
            ) => {
              const nextDrafts = {
                ...currentDrafts,
              };


              for (
                const report
                of loadedReports
              ) {
                if (
                  nextDrafts[
                    report.id
                  ] === undefined
                ) {
                  nextDrafts[
                    report.id
                  ] =
                    report.response ||
                    "";
                }
              }


              return nextDrafts;
            }
          );
        }
      } catch (
        loadError: unknown
      ) {
        console.error(
          "Greška kod učitavanja prijava:",
          loadError
        );


        if (!cancelled) {
          setError(
            loadError
              instanceof Error
              ? loadError.message
              : "Prijave nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    void loadReports();


    return () => {
      cancelled = true;
    };
  }, [user]);


  useEffect(() => {
    if (
      !selectedReportId ||
      loading ||
      reports.length === 0
    ) {
      return;
    }


    const timeout =
      window.setTimeout(
        () => {
          const selectedElement =
            document.getElementById(
              `safe-report-${selectedReportId}`
            );


          selectedElement
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "center",
            });
        },
        150
      );


    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [
    selectedReportId,
    loading,
    reports,
  ]);


  async function updateReport(
    reportId: string,
    options: {
      status?:
        EditableStatus;
      response?: string;
    }
  ) {
    if (!user) {
      return;
    }


    const trimmedResponse =
      options.response
        ?.trim();


    if (
      options.response !==
        undefined &&
      (
        !trimmedResponse ||
        trimmedResponse.length <
          2 ||
        trimmedResponse.length >
          3000
      )
    ) {
      setActionErrors(
        (current) => ({
          ...current,

          [reportId]:
            "Odgovor mora imati između 2 i 3000 znakova.",
        })
      );


      return;
    }


    try {
      setSavingReportId(
        reportId
      );


      setActionErrors(
        (current) => ({
          ...current,

          [reportId]:
            "",
        })
      );


      setActionMessages(
        (current) => ({
          ...current,

          [reportId]:
            "",
        })
      );


      const token =
        await user.getIdToken();


      const body:
        Record<
          string,
          string
        > = {};


      if (options.status) {
        body.status =
          options.status;
      }


      if (
        trimmedResponse !==
        undefined
      ) {
        body.response =
          trimmedResponse;
      }


      const response =
        await fetch(
          `/api/safe-reports/${reportId}`,
          {
            method:
              "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body
              ),
          }
        );


const data =
  (await response.json()) as UpdateApiResponse;


      if (!response.ok) {
        throw new Error(
          data.error ||
            "Promjene nije moguće spremiti."
        );
      }


      const now =
        new Date()
          .toISOString();


      setReports(
        (
          currentReports
        ) =>
          currentReports.map(
            (report) => {
              if (
                report.id !==
                reportId
              ) {
                return report;
              }


              return {
                ...report,

                status:
                  data.status ||
                  options.status ||
                  report.status,

                response:
                  trimmedResponse !==
                  undefined
                    ? (
                        data.response ??
                        trimmedResponse
                      )
                    : report.response,

                responseAt:
                  trimmedResponse !==
                  undefined
                    ? now
                    : report.responseAt,

                statusChangedAt:
                  options.status
                    ? now
                    : report.statusChangedAt,

                updatedAt:
                  now,
              };
            }
          )
      );


      if (
        trimmedResponse !==
        undefined
      ) {
        setResponseDrafts(
          (current) => ({
            ...current,

            [reportId]:
              data.response ??
              trimmedResponse,
          })
        );
      }


      setActionMessages(
        (current) => ({
          ...current,

          [reportId]:
            options.status &&
            trimmedResponse !==
              undefined
              ? "Status i odgovor su spremljeni."
              : options.status
              ? "Status prijave je promijenjen."
              : "Povjerljivi odgovor je spremljen.",
        })
      );
    } catch (
      updateError: unknown
    ) {
      console.error(
        "Greška kod spremanja prijave:",
        updateError
      );


      setActionErrors(
        (current) => ({
          ...current,

          [reportId]:
            updateError
              instanceof Error
              ? updateError.message
              : "Promjene nije moguće spremiti.",
        })
      );
    } finally {
      setSavingReportId(
        null
      );
    }
  }


  const summary =
    useMemo(() => {
      return {
        total:
          reports.length,

        new:
          reports.filter(
            (report) =>
              report.status ===
                "submitted" ||
              report.status ===
                "pending_admin"
          ).length,

        inReview:
          reports.filter(
            (report) =>
              report.status ===
              "in_review"
          ).length,

        resolved:
          reports.filter(
            (report) =>
              report.status ===
                "resolved" ||
              report.status ===
                "closed"
          ).length,
      };
    }, [reports]);


  return (
    <RoleGuard
      allowedRoles={[
        "gym_owner",
        "trainer",
        "admin",
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
              Povjerljivi kanal
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
              Sigurne prijave
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
              Ovdje se prikazuju
              samo prijave za koje
              tvoj račun ima
              odgovarajuće
              ovlaštenje.
            </p>
          </div>


          {!loading &&
            !error && (
              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  bg-[#111317]
                  px-3
                  py-2
                  text-white
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
                  Povjerljivo
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


        {/* CONFIDENTIAL NOTICE */}

        <div
          className="
            flex
            items-start
            gap-4
            rounded-2xl
            border
            border-amber-200
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
              text-lg
            "
          >
            🔒
          </div>


          <div>
            <p
              className="
                text-sm
                font-black
                text-amber-950
              "
            >
              Povjerljivi podaci
            </p>


            <p
              className="
                mt-1
                max-w-3xl
                text-xs
                leading-5
                text-amber-800
              "
            >
              Podatke iz prijave
              nemoj dijeliti s
              osobom protiv koje je
              prijava podnesena niti
              s neovlaštenim
              osobama.
            </p>
          </div>
        </div>


        {/* SUMMARY */}

        {!loading &&
          !error &&
          reports.length >
            0 && (
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <SummaryCard
                label="Ukupno"
                value={
                  summary.total
                }
                variant="dark"
              />

              <SummaryCard
                label="Nove"
                value={
                  summary.new
                }
                variant="red"
              />

              <SummaryCard
                label="U obradi"
                value={
                  summary.inReview
                }
                variant="teal"
              />

              <SummaryCard
                label="Riješene"
                value={
                  summary.resolved
                }
                variant="lime"
              />
            </div>
          )}


        {/* LOADING */}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-72
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
                    Prijave nije
                    moguće učitati
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


        {/* EMPTY */}

        {!loading &&
          !error &&
          reports.length ===
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
                  bg-[#F4F6F2]
                  text-2xl
                "
              >
                🛡️
              </div>


              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Nema sigurnih
                prijava
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
                Trenutačno nema
                prijava koje su
                dodijeljene tebi ili
                za koje imaš
                ovlaštenje.
              </p>
            </div>
          )}


        {/* REPORTS */}

        {!loading &&
          !error &&
          reports.map(
            (report) => {
              const isSelected =
                selectedReportId ===
                report.id;


              const isSaving =
                savingReportId ===
                report.id;


              const draft =
                responseDrafts[
                  report.id
                ] ?? "";


              const responseChanged =
                draft.trim() !==
                (
                  report.response ||
                  ""
                ).trim();


              return (
                <article
                  id={`safe-report-${report.id}`}
                  key={report.id}
                  className={`
                    overflow-hidden
                    rounded-[28px]
                    border
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300

                    ${
                      isSelected
                        ? `
                          border-[#C8D52B]
                          ring-4
                          ring-[#C8D52B]/15
                        `
                        : `
                          border-[#E5E7EB]
                        `
                    }
                  `}
                >

                  {/* SELECTED */}

                  {isSelected && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        border-b
                        border-[#C8D52B]/20
                        bg-[#C8D52B]/10
                        px-5
                        py-3
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
                          tracking-[0.14em]
                          text-[#5F6810]
                        "
                      >
                        Otvoreno iz
                        obavijesti
                      </span>
                    </div>
                  )}


                  {/* REPORT HEADER */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      border-b
                      border-[#EEF0EC]
                      p-5
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
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
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[#111317]
                          text-lg
                          text-[#C8D52B]
                        "
                      >
                        🛡
                      </div>


                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-[#98A2B3]
                          "
                        >
                          Broj prijave
                        </p>


                        <h2
                          className="
                            mt-1
                            font-mono
                            text-xl
                            font-black
                            tracking-tight
                            text-[#15171A]
                          "
                        >
                          {
                            report.reportNumber
                          }
                        </h2>


                        <p
                          className="
                            mt-2
                            text-xs
                            text-[#98A2B3]
                          "
                        >
                          Zaprimljeno{" "}
                          {formatDate(
                            report.createdAt
                          )}
                        </p>
                      </div>
                    </div>


                    <span
                      className={`
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-3
                        py-2
                        text-xs
                        font-bold
                        ${statusBadgeClass(
                          report.status
                        )}
                      `}
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-current
                        "
                      />

                      {formatStatus(
                        report.status
                      )}
                    </span>
                  </div>


                  <div
                    className="
                      space-y-6
                      p-5
                      sm:p-6
                    "
                  >

                    {/* BASIC INFO */}

                    <div
                      className="
                        grid
                        gap-3
                        md:grid-cols-2
                        xl:grid-cols-4
                      "
                    >
                      <InfoCard
                        label="Prijava se odnosi na"
                        value={
                          formatAccusedRole(
                            report
                              .accused
                              .role
                          )
                        }
                        subvalue={
                          report
                            .accused
                            .name
                        }
                      />


                      <InfoCard
                        label="Vrsta ponašanja"
                        value={
                          formatCategory(
                            report.category
                          )
                        }
                      />


                      <InfoCard
                        label="Datum događaja"
                        value={
                          formatOccurredAt(
                            report.occurredAt
                          )
                        }
                      />


                      <InfoCard
                        label="Mjesto događaja"
                        value={
                          report.location ||
                          "Nije navedeno"
                        }
                      />
                    </div>


                    {/* DESCRIPTION */}

                    <section>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[#98A2B3]
                        "
                      >
                        Opis događaja
                      </p>


                      <div
                        className="
                          mt-2
                          whitespace-pre-line
                          rounded-2xl
                          border
                          border-[#E5E7EB]
                          bg-[#F8F9F6]
                          p-5
                          text-sm
                          leading-7
                          text-[#344054]
                        "
                      >
                        {
                          report.description
                        }
                      </div>
                    </section>


                    {/* REPORTER */}

                    <section
                      className="
                        rounded-2xl
                        border
                        border-[#E5E7EB]
                        bg-white
                        p-5
                      "
                    >
                      {report.anonymous ? (
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
                              rounded-xl
                              bg-[#111317]
                              text-white
                            "
                          >
                            🔒
                          </div>


                          <div>
                            <p
                              className="
                                text-sm
                                font-black
                                text-[#15171A]
                              "
                            >
                              Anonimna
                              prijava
                            </p>


                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-[#667085]
                              "
                            >
                              Identitet
                              prijavitelja
                              nije
                              dostupan.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="
                              flex
                              items-center
                              gap-2
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

                            <p
                              className="
                                text-sm
                                font-black
                                text-[#15171A]
                              "
                            >
                              Povjerljiva
                              prijava
                            </p>
                          </div>


                          <div
                            className="
                              mt-4
                              grid
                              gap-3
                              sm:grid-cols-2
                            "
                          >
                            <InfoCard
                              label="Ime prijavitelja"
                              value={
                                report
                                  .reporter
                                  ?.name ||
                                "—"
                              }
                            />


                            <InfoCard
                              label="Email"
                              value={
                                report
                                  .reporter
                                  ?.email ||
                                "—"
                              }
                            />
                          </div>
                        </div>
                      )}
                    </section>


                    {/* STATUS */}

                    <section
                      className="
                        rounded-2xl
                        border
                        border-[#16A6A1]/20
                        bg-[#16A6A1]/5
                        p-5
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-[#128D89]
                            "
                          >
                            Postupanje
                          </p>


                          <h3
                            className="
                              mt-1
                              text-lg
                              font-black
                              text-[#15171A]
                            "
                          >
                            Obrada prijave
                          </h3>


                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-[#667085]
                            "
                          >
                            Promjene
                            statusa
                            bilježe se
                            u povijesti
                            aktivnosti
                            prijave.
                          </p>
                        </div>


                        {isSaving && (
                          <div
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              bg-white
                              px-3
                              py-2
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-[#667085]
                            "
                          >
                            <span
                              className="
                                h-3
                                w-3
                                animate-spin
                                rounded-full
                                border-2
                                border-[#E5E7EB]
                                border-t-[#16A6A1]
                              "
                            />

                            Spremanje
                          </div>
                        )}
                      </div>


                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-3
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            !canSetStatus(
                              report.status,
                              "in_review"
                            )
                          }
                          onClick={() =>
                            void updateReport(
                              report.id,
                              {
                                status:
                                  "in_review",
                              }
                            )
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#16A6A1]
                            px-4
                            py-2.5
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-[#128D89]
                            disabled:cursor-not-allowed
                            disabled:opacity-35
                          "
                        >
                          U obradi
                        </button>


                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            !canSetStatus(
                              report.status,
                              "resolved"
                            )
                          }
                          onClick={() =>
                            void updateReport(
                              report.id,
                              {
                                status:
                                  "resolved",
                              }
                            )
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#C8D52B]
                            px-4
                            py-2.5
                            text-sm
                            font-black
                            text-[#111317]
                            transition
                            hover:bg-[#B8C525]
                            disabled:cursor-not-allowed
                            disabled:opacity-35
                          "
                        >
                          Riješeno
                        </button>


                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            !canSetStatus(
                              report.status,
                              "closed"
                            )
                          }
                          onClick={() =>
                            void updateReport(
                              report.id,
                              {
                                status:
                                  "closed",
                              }
                            )
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#111317]
                            px-4
                            py-2.5
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-[#202328]
                            disabled:cursor-not-allowed
                            disabled:opacity-35
                          "
                        >
                          Zatvoreno
                        </button>
                      </div>


                      {report.statusChangedAt && (
                        <p
                          className="
                            mt-4
                            border-t
                            border-[#16A6A1]/10
                            pt-4
                            text-xs
                            text-[#667085]
                          "
                        >
                          Status
                          posljednji put
                          promijenjen:{" "}

                          <span
                            className="
                              font-bold
                              text-[#344054]
                            "
                          >
                            {formatDate(
                              report.statusChangedAt
                            )}
                          </span>
                        </p>
                      )}
                    </section>


                    {/* RESPONSE */}

                    <section
                      className="
                        rounded-2xl
                        border
                        border-[#111317]/10
                        bg-[#111317]
                        p-5
                        text-white
                        sm:p-6
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-[#C8D52B]
                          "
                        >
                          Povjerljiva
                          komunikacija
                        </p>


                        <h3
                          className="
                            mt-1
                            text-lg
                            font-black
                            text-white
                          "
                        >
                          Povjerljivi
                          odgovor
                        </h3>


                        <p
                          className="
                            mt-1
                            max-w-2xl
                            text-xs
                            leading-5
                            text-white/55
                          "
                        >
                          Odgovor se
                          sprema uz
                          prijavu i
                          tretira kao
                          povjerljiv
                          sadržaj.
                        </p>
                      </div>


                      {report.response && (
                        <div
                          className="
                            mt-5
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/[0.05]
                            p-4
                          "
                        >
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-[#C8D52B]
                            "
                          >
                            Spremljeni
                            odgovor
                          </p>


                          <p
                            className="
                              mt-3
                              whitespace-pre-line
                              text-sm
                              leading-6
                              text-white/80
                            "
                          >
                            {
                              report.response
                            }
                          </p>


                          <p
                            className="
                              mt-4
                              text-[10px]
                              leading-5
                              text-white/40
                            "
                          >
                            Odgovorio:{" "}

                            {formatResponderRole(
                              report.respondedByRole
                            )}

                            {" · "}

                            {formatDate(
                              report.responseAt
                            )}
                          </p>
                        </div>
                      )}


                      <div
                        className="
                          mt-5
                        "
                      >
                        <textarea
                          value={
                            draft
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event
                          ) => {
                            const value =
                              event
                                .target
                                .value;


                            setResponseDrafts(
                              (
                                current
                              ) => ({
                                ...current,

                                [report.id]:
                                  value,
                              })
                            );
                          }}
                          maxLength={
                            3000
                          }
                          rows={5}
                          placeholder="Napiši povjerljivi odgovor prijavitelju..."
                          className="
                            w-full
                            resize-y
                            rounded-xl
                            border
                            border-white/10
                            bg-white
                            p-4
                            text-sm
                            leading-6
                            text-[#15171A]
                            outline-none
                            transition
                            placeholder:text-[#98A2B3]
                            focus:border-[#C8D52B]
                            focus:ring-4
                            focus:ring-[#C8D52B]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        />
                      </div>


                      <div
                        className="
                          mt-3
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <span
                          className="
                            text-[10px]
                            font-semibold
                            text-white/40
                          "
                        >
                          {draft.length}
                          {" / "}
                          3000 znakova
                        </span>


                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            !responseChanged ||
                            draft
                              .trim()
                              .length < 2
                          }
                          onClick={() =>
                            void updateReport(
                              report.id,
                              {
                                response:
                                  draft,
                              }
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
                            py-2.5
                            text-sm
                            font-black
                            text-[#111317]
                            transition
                            hover:bg-[#B8C525]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          {isSaving ? (
                            <>
                              <span
                                className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-[#111317]/20
                                  border-t-[#111317]
                                "
                              />

                              Spremanje...
                            </>
                          ) : (
                            <>
                              Spremi odgovor

                              <span>
                                →
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </section>


                    {/* ACTION ERROR */}

                    {actionErrors[
                      report.id
                    ] && (
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
                          {
                            actionErrors[
                              report.id
                            ]
                          }
                        </span>
                      </div>
                    )}


                    {/* ACTION SUCCESS */}

                    {actionMessages[
                      report.id
                    ] && (
                      <div
                        className="
                          flex
                          items-start
                          gap-3
                          rounded-xl
                          border
                          border-[#C8D52B]/30
                          bg-[#C8D52B]/10
                          p-4
                          text-sm
                          text-[#5F6810]
                        "
                      >
                        <span
                          className="
                            font-black
                          "
                        >
                          ✓
                        </span>

                        <span
                          className="
                            font-semibold
                          "
                        >
                          {
                            actionMessages[
                              report.id
                            ]
                          }
                        </span>
                      </div>
                    )}


                    {/* FOOTER */}

                    <div
                      className="
                        flex
                        flex-col
                        gap-1
                        border-t
                        border-[#EEF0EC]
                        pt-4
                        text-[10px]
                        text-[#98A2B3]
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <span>
                        Prijava zaprimljena:{" "}

                        {formatDate(
                          report.createdAt
                        )}
                      </span>


                      {report.updatedAt && (
                        <span>
                          Zadnja promjena:{" "}

                          {formatDate(
                            report.updatedAt
                          )}
                        </span>
                      )}
                    </div>

                  </div>


                  <div
                    className="
                      h-1
                      bg-gradient-to-r
                      from-[#C8D52B]
                      via-[#16A6A1]
                      to-transparent
                    "
                  />

                </article>
              );
            }
          )}

      </div>
    </RoleGuard>
  );
}


function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant:
    | "dark"
    | "red"
    | "teal"
    | "lime";
}) {
  const badgeClass =
    variant === "dark"
      ? "bg-[#111317] text-white"
      : variant === "red"
      ? "bg-red-50 text-red-700"
      : variant === "teal"
      ? "bg-[#16A6A1]/10 text-[#128D89]"
      : "bg-[#C8D52B]/15 text-[#5F6810]";


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
          ${badgeClass}
        `}
      >
        {label}
      </div>


      <p
        className="
          mt-4
          text-3xl
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


function InfoCard({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#EEF0EC]
        bg-[#F8F9F6]
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>


      <p
        className="
          mt-2
          text-sm
          font-black
          leading-5
          text-[#15171A]
        "
      >
        {value}
      </p>


      {subvalue && (
        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[#667085]
          "
        >
          {subvalue}
        </p>
      )}
    </div>
  );
}