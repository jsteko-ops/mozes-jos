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

  createdAt: string | null;

  updatedAt: string | null;

};


type ApiResponse = {

  reports?: SafeReport[];

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

          setReports(
            data.reports || []
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
                      className="
                        rounded-full
                        bg-red-100
                        px-3
                        py-1
                        text-sm
                        font-bold
                        text-red-800
                      "
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