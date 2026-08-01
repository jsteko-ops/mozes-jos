"use client";

import {
  useEffect,
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

  respondedByRole: string | null;

  responseAt: string | null;

  statusChangedAt: string | null;

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

    return "-";

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

    return "-";

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


    default:

      return "Ovlaštena osoba";

  }

}


function canSetStatus(
  currentStatus: string,
  newStatus: EditableStatus
) {

  if (
    currentStatus === "submitted" ||
    currentStatus === "pending_admin"
  ) {

    return true;

  }


  if (currentStatus === "in_review") {

    return (
      newStatus === "resolved" ||
      newStatus === "closed"
    );

  }


  if (currentStatus === "resolved") {

    return (
      newStatus === "in_review" ||
      newStatus === "closed"
    );

  }


  if (currentStatus === "closed") {

    return newStatus === "in_review";

  }


  return false;

}


function statusBadgeClass(
  status: string
) {

  switch (status) {

    case "in_review":

      return "bg-blue-100 text-blue-800";


    case "resolved":

      return "bg-green-100 text-green-800";


    case "closed":

      return "bg-gray-200 text-gray-800";


    case "pending_admin":

      return "bg-amber-100 text-amber-800";


    default:

      return "bg-red-100 text-red-800";

  }

}


export default function SafeReportsInboxPage() {


  const searchParams =
    useSearchParams();


  const selectedReportId =
    searchParams.get("report");


  const {
    user,
  } = useAuth();


  const [
    reports,
    setReports,
  ] = useState<SafeReport[]>([]);


  const [
    responseDrafts,
    setResponseDrafts,
  ] = useState<Record<string, string>>({});


  const [
    savingReportId,
    setSavingReportId,
  ] = useState<string | null>(null);


  const [
    actionErrors,
    setActionErrors,
  ] = useState<Record<string, string>>({});


  const [
    actionMessages,
    setActionMessages,
  ] = useState<Record<string, string>>({});


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");



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
          await response.json() as ApiResponse;


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Prijave nije moguće učitati."
          );

        }


        if (!cancelled) {

          const loadedReports =
            data.reports || [];


          setReports(
            loadedReports
          );


          setResponseDrafts(
            (currentDrafts) => {

              const nextDrafts = {
                ...currentDrafts,
              };


              for (
                const report
                of loadedReports
              ) {

                if (
                  nextDrafts[report.id] ===
                  undefined
                ) {

                  nextDrafts[report.id] =
                    report.response || "";

                }

              }


              return nextDrafts;

            }
          );

        }


      } catch (error: unknown) {


        console.error(
          "Greška kod učitavanja prijava:",
          error
        );


        if (!cancelled) {

          setError(

            error instanceof Error

              ? error.message

              : "Prijave nije moguće učitati."

          );

        }


      } finally {


        if (!cancelled) {

          setLoading(false);

        }


      }

    }


    loadReports();


    return () => {

      cancelled =
        true;

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
      window.setTimeout(() => {


        const selectedElement =
          document.getElementById(
            `safe-report-${selectedReportId}`
          );


        selectedElement?.scrollIntoView({

          behavior:
            "smooth",

          block:
            "center",

        });


      }, 150);


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
      status?: EditableStatus;
      response?: string;
    }
  ) {


    if (!user) {

      return;

    }


    const trimmedResponse =
      options.response?.trim();


    if (
      options.response !== undefined &&
      (
        !trimmedResponse ||
        trimmedResponse.length < 2 ||
        trimmedResponse.length > 3000
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
        Record<string, string> = {};


      if (options.status) {

        body.status =
          options.status;

      }


      if (
        trimmedResponse !== undefined
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
              JSON.stringify(body),
          }
        );


      const data =
        await response.json() as
          UpdateApiResponse;


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Promjene nije moguće spremiti."
        );

      }


      const now =
        new Date().toISOString();


      setReports(
        (currentReports) =>

          currentReports.map(
            (report) => {


              if (
                report.id !== reportId
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
                  trimmedResponse !== undefined

                    ? (
                        data.response ??
                        trimmedResponse
                      )

                    : report.response,

                responseAt:
                  trimmedResponse !== undefined

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
        trimmedResponse !== undefined
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
            trimmedResponse !== undefined

              ? "Status i odgovor su spremljeni."

              : options.status

                ? "Status prijave je promijenjen."

                : "Povjerljivi odgovor je spremljen.",
        })
      );


    } catch (error: unknown) {


      console.error(
        "Greška kod spremanja prijave:",
        error
      );


      setActionErrors(
        (current) => ({
          ...current,

          [reportId]:

            error instanceof Error

              ? error.message

              : "Promjene nije moguće spremiti.",
        })
      );


    } finally {


      setSavingReportId(
        null
      );

    }

  }



  return (

    <RoleGuard
      allowedRoles={[
        "gym_owner",
        "admin",
      ]}
    >


      <div className="space-y-6">


        <div>

          <h1 className="text-3xl font-bold">

            🛡️ Sigurne prijave

          </h1>


          <p className="mt-2 text-gray-600">

            Ovdje se prikazuju samo prijave
            za koje imaš ovlaštenje.

          </p>

        </div>



        <div
          className="
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            p-5
            text-sm
            text-amber-900
          "
        >

          Podaci iz prijava su povjerljivi.
          Nemoj ih dijeliti s osobom protiv koje
          je prijava podnesena niti s neovlaštenim osobama.

        </div>



        {
          loading && (

            <p>
              Učitavanje prijava...
            </p>

          )
        }



        {
          !loading &&
          error && (

            <div
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-5
                text-red-700
              "
            >

              {error}

            </div>

          )
        }



        {
          !loading &&
          !error &&
          reports.length === 0 && (

            <div
              className="
                rounded-xl
                border
                bg-white
                p-8
                text-center
              "
            >

              <p className="text-lg font-semibold">

                Trenutačno nema sigurnih prijava.

              </p>

            </div>

          )
        }



        {
          !loading &&
          !error &&
          reports.map(
            (report) => {


              const isSelected =
                selectedReportId === report.id;


              const isSaving =
                savingReportId === report.id;


              const draft =
                responseDrafts[report.id] ?? "";


              const responseChanged =
                draft.trim() !==
                (
                  report.response || ""
                ).trim();


              return (

                <article

                  id={`safe-report-${report.id}`}

                  key={report.id}

                  className={`
                    space-y-5
                    rounded-xl
                    border
                    p-6
                    shadow-sm
                    transition
                    ${

                      isSelected

                        ? `
                          border-amber-500
                          bg-amber-50
                          ring-4
                          ring-amber-200
                        `

                        : `
                          border-gray-200
                          bg-white
                        `

                    }
                  `}

                >


                  {
                    isSelected && (

                      <div
                        className="
                          inline-flex
                          rounded-full
                          bg-amber-200
                          px-3
                          py-1
                          text-sm
                          font-bold
                          text-amber-900
                        "
                      >

                        Otvoreno iz obavijesti

                      </div>

                    )
                  }



                  <div
                    className="
                      flex
                      flex-wrap
                      items-start
                      justify-between
                      gap-4
                    "
                  >


                    <div>

                      <p className="text-sm text-gray-500">

                        Broj prijave

                      </p>


                      <h2 className="font-mono text-xl font-bold">

                        {report.reportNumber}

                      </h2>

                    </div>


                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-sm
                        font-bold
                        ${statusBadgeClass(
                          report.status
                        )}
                      `}
                    >

                      {formatStatus(
                        report.status
                      )}

                    </span>

                  </div>



                  <div className="grid gap-4 md:grid-cols-2">


                    <div>

                      <p className="text-sm text-gray-500">

                        Prijava se odnosi na

                      </p>


                      <p className="font-semibold">

                        {formatAccusedRole(
                          report.accused.role
                        )}

                      </p>


                      <p>

                        {report.accused.name}

                      </p>

                    </div>



                    <div>

                      <p className="text-sm text-gray-500">

                        Vrsta ponašanja

                      </p>


                      <p className="font-semibold">

                        {formatCategory(
                          report.category
                        )}

                      </p>

                    </div>



                    <div>

                      <p className="text-sm text-gray-500">

                        Datum događaja

                      </p>


                      <p>

                        {formatOccurredAt(
                          report.occurredAt
                        )}

                      </p>

                    </div>



                    <div>

                      <p className="text-sm text-gray-500">

                        Mjesto događaja

                      </p>


                      <p>

                        {report.location || "-"}

                      </p>

                    </div>

                  </div>



                  <div>

                    <p className="mb-2 text-sm text-gray-500">

                      Opis događaja

                    </p>


                    <div
                      className="
                        whitespace-pre-line
                        rounded-lg
                        border
                        bg-gray-50
                        p-4
                      "
                    >

                      {report.description}

                    </div>

                  </div>



                  <div
                    className="
                      rounded-lg
                      border
                      bg-gray-50
                      p-4
                    "
                  >

                    {
                      report.anonymous

                        ? (

                          <p className="font-semibold">

                            🔒 Anonimna prijava

                          </p>

                        )

                        : (

                          <div>

                            <p className="font-semibold">

                              Povjerljiva prijava

                            </p>


                            <p>

                              <b>Ime:</b>{" "}

                              {report.reporter?.name || "-"}

                            </p>


                            <p>

                              <b>Email:</b>{" "}

                              {report.reporter?.email || "-"}

                            </p>

                          </div>

                        )
                    }

                  </div>



                  <div
                    className="
                      space-y-4
                      rounded-xl
                      border
                      border-blue-200
                      bg-blue-50
                      p-5
                    "
                  >

                    <div>

                      <h3 className="text-lg font-bold text-blue-950">

                        Obrada prijave

                      </h3>


                      <p className="text-sm text-blue-800">

                        Promjene se bilježe u povijesti aktivnosti prijave.

                      </p>

                    </div>


                    <div className="flex flex-wrap gap-3">


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
                          updateReport(
                            report.id,
                            {
                              status:
                                "in_review",
                            }
                          )
                        }
                        className="
                          rounded-lg
                          bg-blue-600
                          px-4
                          py-2
                          font-semibold
                          text-white
                          hover:bg-blue-700
                          disabled:cursor-not-allowed
                          disabled:opacity-40
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
                          updateReport(
                            report.id,
                            {
                              status:
                                "resolved",
                            }
                          )
                        }
                        className="
                          rounded-lg
                          bg-green-600
                          px-4
                          py-2
                          font-semibold
                          text-white
                          hover:bg-green-700
                          disabled:cursor-not-allowed
                          disabled:opacity-40
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
                          updateReport(
                            report.id,
                            {
                              status:
                                "closed",
                            }
                          )
                        }
                        className="
                          rounded-lg
                          bg-gray-700
                          px-4
                          py-2
                          font-semibold
                          text-white
                          hover:bg-gray-800
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >

                        Zatvoreno

                      </button>

                    </div>


                    {
                      report.statusChangedAt && (

                        <p className="text-sm text-blue-800">

                          Status posljednji put promijenjen:{" "}

                          {formatDate(
                            report.statusChangedAt
                          )}

                        </p>

                      )
                    }

                  </div>



                  <div
                    className="
                      space-y-4
                      rounded-xl
                      border
                      border-violet-200
                      bg-violet-50
                      p-5
                    "
                  >

                    <div>

                      <h3 className="text-lg font-bold text-violet-950">

                        Povjerljivi odgovor

                      </h3>


                      <p className="text-sm text-violet-800">

                        Odgovor se sprema uz prijavu.
                        Prikaz odgovora prijavitelju dodajemo
                        u sljedećem koraku.

                      </p>

                    </div>


                    {
                      report.response && (

                        <div
                          className="
                            rounded-lg
                            border
                            border-violet-200
                            bg-white
                            p-4
                          "
                        >

                          <p className="mb-2 text-sm font-semibold text-violet-900">

                            Trenutačno spremljeni odgovor

                          </p>


                          <p className="whitespace-pre-line">

                            {report.response}

                          </p>


                          <p className="mt-3 text-xs text-gray-500">

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

                      )
                    }


                    <textarea
                      value={draft}
                      disabled={isSaving}
                      onChange={(event) => {

                        const value =
                          event.target.value;


                        setResponseDrafts(
                          (current) => ({
                            ...current,

                            [report.id]:
                              value,
                          })
                        );

                      }}
                      maxLength={3000}
                      rows={5}
                      placeholder="Napiši povjerljivi odgovor prijavitelju..."
                      className="
                        w-full
                        rounded-lg
                        border
                        border-violet-300
                        bg-white
                        p-3
                        outline-none
                        focus:border-violet-600
                        disabled:opacity-60
                      "
                    />


                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <span className="text-sm text-gray-600">

                        {draft.length} / 3000 znakova

                      </span>


                      <button
                        type="button"
                        disabled={
                          isSaving ||
                          !responseChanged ||
                          draft.trim().length < 2
                        }
                        onClick={() =>
                          updateReport(
                            report.id,
                            {
                              response:
                                draft,
                            }
                          )
                        }
                        className="
                          rounded-lg
                          bg-violet-600
                          px-5
                          py-2
                          font-semibold
                          text-white
                          hover:bg-violet-700
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >

                        {
                          isSaving

                            ? "Spremanje..."

                            : "Spremi odgovor"
                        }

                      </button>

                    </div>

                  </div>



                  {
                    actionErrors[report.id] && (

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

                        {actionErrors[report.id]}

                      </div>

                    )
                  }



                  {
                    actionMessages[report.id] && (

                      <div
                        className="
                          rounded-lg
                          border
                          border-green-200
                          bg-green-50
                          p-4
                          text-green-800
                        "
                      >

                        ✅ {actionMessages[report.id]}

                      </div>

                    )
                  }



                  <div className="text-sm text-gray-500">

                    Prijava zaprimljena:{" "}

                    {formatDate(
                      report.createdAt
                    )}

                  </div>


                </article>

              );

            }
          )
        }


      </div>


    </RoleGuard>

  );

}