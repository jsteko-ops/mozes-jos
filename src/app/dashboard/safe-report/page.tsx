"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import ResetAccessCode from "@/components/safe-reports/ResetAccessCode";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


type SubmitApiResponse = {
  ok?: boolean;
  error?: string;
  reportId?: string;
  reportNumber?: string;
  accessCode?: string;
};


type SafeReportStatus = {
  reportNumber: string;

  anonymous: boolean;

  accused: {
    role: string;
    name: string;
  };

  category: string;

  status: string;

  assignmentStatus: string;

  response: string | null;

  responseAt: string | null;

  statusChangedAt:
    string | null;

  createdAt: string | null;

  updatedAt: string | null;
};


type StatusApiResponse = {
  report?: SafeReportStatus;
  error?: string;
};


type TrainerOption = {
  uid: string;
  name: string;
};


type PeopleApiResponse = {
  trainers?: TrainerOption[];
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


export default function SafeReportPage() {
  const {
    user,
  } = useAuth();


  const [
    anonymous,
    setAnonymous,
  ] =
    useState(true);


  const [
    accusedRole,
    setAccusedRole,
  ] =
    useState("");


  const [
    accusedUid,
    setAccusedUid,
  ] =
    useState("");


  const [
    accusedName,
    setAccusedName,
  ] =
    useState("");


  const [
    trainers,
    setTrainers,
  ] =
    useState<
      TrainerOption[]
    >([]);


  const [
    trainersLoading,
    setTrainersLoading,
  ] =
    useState(false);


  const [
    trainersError,
    setTrainersError,
  ] =
    useState("");


  const [
    category,
    setCategory,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    occurredAt,
    setOccurredAt,
  ] =
    useState("");


  const [
    location,
    setLocation,
  ] =
    useState("");


  const [
    submitLoading,
    setSubmitLoading,
  ] =
    useState(false);


  const [
    submitError,
    setSubmitError,
  ] =
    useState("");


  const [
    result,
    setResult,
  ] =
    useState<
      SubmitApiResponse | null
    >(null);


  const [
    lookupReportNumber,
    setLookupReportNumber,
  ] =
    useState("");


  const [
    lookupAccessCode,
    setLookupAccessCode,
  ] =
    useState("");


  const [
    lookupLoading,
    setLookupLoading,
  ] =
    useState(false);


  const [
    lookupError,
    setLookupError,
  ] =
    useState("");


  const [
    lookupResult,
    setLookupResult,
  ] =
    useState<
      SafeReportStatus | null
    >(null);


  useEffect(() => {
    if (!user) {
      return;
    }


    let cancelled =
      false;


    async function loadTrainers() {
      try {
        setTrainersLoading(
          true
        );

        setTrainersError(
          ""
        );


        const token =
          await user!.getIdToken();


        const response =
          await fetch(
            "/api/safe-reports/people",
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
          (
            await response.json()
          ) as PeopleApiResponse;


        if (!response.ok) {
          throw new Error(
            data.error ||
              "Popis trenera nije moguće učitati."
          );
        }


        if (!cancelled) {
          setTrainers(
            data.trainers ||
              []
          );
        }
      } catch (
        loadError: unknown
      ) {
        console.error(
          "Greška kod učitavanja trenera:",
          loadError
        );


        if (!cancelled) {
          setTrainersError(
            loadError
              instanceof Error
              ? loadError.message
              : "Popis trenera nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setTrainersLoading(
            false
          );
        }
      }
    }


    void loadTrainers();


    return () => {
      cancelled = true;
    };
  }, [user]);


  async function submitReport(
    event: FormEvent
  ) {
    event.preventDefault();


    if (!user) {
      setSubmitError(
        "Moraš biti prijavljen kako bi poslao prijavu."
      );

      return;
    }


    if (!accusedRole) {
      setSubmitError(
        "Odaberi na koga se prijava odnosi."
      );

      return;
    }


    if (
      accusedRole ===
        "trainer" &&
      !accusedUid
    ) {
      setSubmitError(
        "Odaberi trenera s popisa."
      );

      return;
    }


    if (
      accusedRole !==
        "trainer" &&
      !accusedName.trim()
    ) {
      setSubmitError(
        "Upiši ime ili opis osobe."
      );

      return;
    }


    if (!category) {
      setSubmitError(
        "Odaberi vrstu ponašanja."
      );

      return;
    }


    if (
      description
        .trim()
        .length < 20
    ) {
      setSubmitError(
        "Opis mora sadržavati najmanje 20 znakova."
      );

      return;
    }


    try {
      setSubmitLoading(
        true
      );

      setSubmitError(
        ""
      );

      setResult(
        null
      );


      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/safe-reports",
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
                anonymous,

                accusedRole,

                accusedUid:
                  accusedRole ===
                  "trainer"
                    ? accusedUid
                    : undefined,

                accusedName:
                  accusedRole ===
                  "trainer"
                    ? ""
                    : accusedName.trim(),

                category,

                description:
                  description.trim(),

                occurredAt:
                  occurredAt ||
                  undefined,

                location:
                  location.trim() ||
                  undefined,
              }),
          }
        );


      const data =
        (
          await response.json()
        ) as SubmitApiResponse;


      if (!response.ok) {
        throw new Error(
          data.error ||
            "Prijavu nije moguće poslati."
        );
      }


      setResult(data);


      if (
        data.reportNumber &&
        data.accessCode
      ) {
        setLookupReportNumber(
          data.reportNumber
        );

        setLookupAccessCode(
          data.accessCode
        );
      }


      setAccusedRole("");
      setAccusedUid("");
      setAccusedName("");
      setCategory("");
      setDescription("");
      setOccurredAt("");
      setLocation("");
    } catch (
      submitFailure: unknown
    ) {
      console.error(
        "Greška kod slanja prijave:",
        submitFailure
      );


      setSubmitError(
        submitFailure
          instanceof Error
          ? submitFailure.message
          : "Prijavu nije moguće poslati."
      );
    } finally {
      setSubmitLoading(
        false
      );
    }
  }


  async function lookupReport(
    event: FormEvent
  ) {
    event.preventDefault();


    if (!user) {
      setLookupError(
        "Moraš biti prijavljen kako bi provjerio prijavu."
      );

      return;
    }


    const normalizedReportNumber =
      lookupReportNumber
        .trim()
        .toUpperCase();


    const normalizedAccessCode =
      lookupAccessCode
        .trim()
        .toUpperCase();


    if (
      !normalizedReportNumber ||
      !normalizedAccessCode
    ) {
      setLookupError(
        "Upiši broj prijave i tajni pristupni kod."
      );

      return;
    }


    try {
      setLookupLoading(
        true
      );

      setLookupError(
        ""
      );

      setLookupResult(
        null
      );


      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/safe-reports/status",
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

                accessCode:
                  normalizedAccessCode,
              }),
          }
        );


      const data =
        (
          await response.json()
        ) as StatusApiResponse;


      if (
        !response.ok ||
        !data.report
      ) {
        throw new Error(
          data.error ||
            "Status prijave nije moguće provjeriti."
        );
      }


      setLookupReportNumber(
        normalizedReportNumber
      );

      setLookupAccessCode(
        normalizedAccessCode
      );

      setLookupResult(
        data.report
      );
    } catch (
      lookupFailure: unknown
    ) {
      console.error(
        "Greška kod provjere prijave:",
        lookupFailure
      );


      setLookupError(
        lookupFailure
          instanceof Error
          ? lookupFailure.message
          : "Status prijave nije moguće provjeriti."
      );
    } finally {
      setLookupLoading(
        false
      );
    }
  }


  return (
    <RoleGuard
      allowedRoles={[
        "client",
      ]}
    >
      <div className="space-y-8">

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
              Sigurna prijava
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
              Prijavi neprimjereno,
              uznemirujuće ili
              nesigurno ponašanje
              kroz zaštićeni kanal.
            </p>
          </div>


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


        {/* PRIVACY NOTICE */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#111317]
            p-6
            text-white
            shadow-xl
            shadow-black/5
            sm:p-7
          "
        >
          <div
            className="
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#16A6A1]/10
              blur-3xl
            "
          />


          <div
            className="
              relative
              z-10
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
                bg-[#C8D52B]
                text-xl
                text-[#111317]
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
                  tracking-[0.15em]
                  text-[#C8D52B]
                "
              >
                Zaštićena prijava
              </p>


              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-white
                "
              >
                Tvoja prijava ne
                šalje se osobi koju
                prijavljuješ.
              </h2>


              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-white/60
                "
              >
                Ako odabereš
                anonimnu prijavu,
                primatelj prijave ne
                vidi tvoje ime ni
                e-mail. Nakon slanja
                dobivaš broj prijave
                i tajni pristupni kod
                za praćenje statusa.
              </p>
            </div>
          </div>
        </section>


        {/* SUCCESS RESULT */}

        {result?.reportNumber &&
          result?.accessCode && (
            <section
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-[#C8D52B]/40
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
                  border-[#C8D52B]/20
                  bg-[#C8D52B]/10
                  p-5
                  sm:p-6
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
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[#5F6810]
                    "
                  >
                    Prijava zaprimljena
                  </p>


                  <h2
                    className="
                      mt-1
                      text-xl
                      font-black
                      text-[#15171A]
                    "
                  >
                    Prijava je uspješno
                    poslana
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-[#667085]
                    "
                  >
                    Spremi podatke
                    ispod kako bi
                    kasnije mogao
                    provjeriti status.
                  </p>
                </div>
              </div>


              <div
                className="
                  grid
                  gap-4
                  p-5
                  sm:grid-cols-2
                  sm:p-6
                "
              >
                <div
                  className="
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    bg-[#F8F9F6]
                    p-4
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
                    Broj prijave
                  </p>


                  <p
                    className="
                      mt-2
                      break-all
                      font-mono
                      text-lg
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
                    rounded-2xl
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
                    Tajni pristupni kod
                  </p>


                  <p
                    className="
                      mt-2
                      break-all
                      font-mono
                      text-lg
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
              </div>


              <div
                className="
                  mx-5
                  mb-5
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  sm:mx-6
                  sm:mb-6
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
                  Spremi ili
                  fotografiraj broj
                  prijave i tajni kod.
                  Tajni kod se nakon
                  ovog prikaza neće
                  ponovno prikazati.
                </p>
              </div>
            </section>
          )}


        {/* LOOKUP */}

        <section
          className="
            overflow-hidden
            rounded-[28px]
            border
            border-[#E5E7EB]
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
              border-[#EEF0EC]
              p-5
              sm:p-6
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
                bg-[#16A6A1]/10
                text-xl
                text-[#128D89]
              "
            >
              🔎
            </div>


            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#16A6A1]
                "
              >
                Praćenje prijave
              </p>


              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#15171A]
                  sm:text-2xl
                "
              >
                Provjeri status
                prijave
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
                Upiši broj prijave
                i tajni pristupni
                kod dobiven nakon
                slanja.
              </p>
            </div>
          </div>


          <div
            className="
              space-y-6
              p-5
              sm:p-6
            "
          >
            <form
              onSubmit={
                lookupReport
              }
              className="
                space-y-5
              "
            >
              <div
                className="
                  grid
                  gap-4
                  lg:grid-cols-2
                "
              >
                <div>
                  <label
                    htmlFor="lookup-report-number"
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
                    id="lookup-report-number"
                    type="text"
                    value={
                      lookupReportNumber
                    }
                    disabled={
                      lookupLoading
                    }
                    onChange={(
                      event
                    ) =>
                      setLookupReportNumber(
                        event.target
                          .value
                          .toUpperCase()
                      )
                    }
                    placeholder="MJ-20260801-A0F216"
                    autoComplete="off"
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
                      disabled:bg-[#F8F9F6]
                    "
                  />
                </div>


                <div>
                  <label
                    htmlFor="lookup-access-code"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-[#344054]
                    "
                  >
                    Tajni pristupni kod
                  </label>


                  <input
                    id="lookup-access-code"
                    type="text"
                    value={
                      lookupAccessCode
                    }
                    disabled={
                      lookupLoading
                    }
                    onChange={(
                      event
                    ) =>
                      setLookupAccessCode(
                        event.target
                          .value
                          .toUpperCase()
                      )
                    }
                    placeholder="AB12-CD34-EF56"
                    autoComplete="off"
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
                      disabled:bg-[#F8F9F6]
                    "
                  />
                </div>
              </div>


              {lookupError && (
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
                    {lookupError}
                  </span>
                </div>
              )}


              <div
                className="
                  flex
                  flex-col
                  gap-4
                  border-t
                  border-[#EEF0EC]
                  pt-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <ResetAccessCode />


                <button
                  type="submit"
                  disabled={
                    lookupLoading
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#111317]
                    px-6
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
                  {lookupLoading ? (
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

                      Provjera...
                    </>
                  ) : (
                    <>
                      Provjeri status

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


            {/* LOOKUP RESULT */}

            {lookupResult && (
              <div
                className="
                  space-y-5
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
                        text-[#98A2B3]
                      "
                    >
                      Broj prijave
                    </p>


                    <p
                      className="
                        mt-1
                        break-all
                        font-mono
                        text-xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      {
                        lookupResult.reportNumber
                      }
                    </p>
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
                        lookupResult.status
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
                      lookupResult.status
                    )}
                  </span>
                </div>


                <div
                  className="
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  <StatusInfo
                    label="Prijava se odnosi na"
                    value={
                      formatAccusedRole(
                        lookupResult
                          .accused
                          .role
                      )
                    }
                    secondary={
                      lookupResult
                        .accused
                        .name
                    }
                  />


                  <StatusInfo
                    label="Vrsta ponašanja"
                    value={
                      formatCategory(
                        lookupResult.category
                      )
                    }
                  />


                  <StatusInfo
                    label="Prijava zaprimljena"
                    value={
                      formatDate(
                        lookupResult.createdAt
                      )
                    }
                  />


                  <StatusInfo
                    label="Zadnja promjena"
                    value={
                      formatDate(
                        lookupResult
                          .statusChangedAt
                      )
                    }
                  />
                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-[#16A6A1]/20
                    bg-white
                    p-4
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[#16A6A1]
                    "
                  >
                    Trenutačni status
                  </p>


                  <p
                    className="
                      mt-2
                      text-lg
                      font-black
                      text-[#15171A]
                    "
                  >
                    {formatStatus(
                      lookupResult.status
                    )}
                  </p>
                </div>


                {lookupResult.response ? (
                  <div
                    className="
                      overflow-hidden
                      rounded-2xl
                      bg-[#111317]
                      p-5
                      text-white
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#C8D52B]
                      "
                    >
                      Povjerljivi odgovor
                    </p>


                    <h3
                      className="
                        mt-1
                        text-lg
                        font-black
                        text-white
                      "
                    >
                      Odgovor ovlaštene
                      osobe
                    </h3>


                    <p
                      className="
                        mt-4
                        whitespace-pre-line
                        text-sm
                        leading-7
                        text-white/75
                      "
                    >
                      {
                        lookupResult.response
                      }
                    </p>


                    <p
                      className="
                        mt-5
                        border-t
                        border-white/10
                        pt-4
                        text-[10px]
                        text-white/40
                      "
                    >
                      Odgovor spremljen:{" "}

                      {formatDate(
                        lookupResult.responseAt
                      )}
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-amber-200
                      bg-amber-50
                      p-4
                    "
                  >
                    <div
                      className="
                        mt-0.5
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-amber-500
                      "
                    />


                    <p
                      className="
                        text-sm
                        leading-6
                        text-amber-800
                      "
                    >
                      Ovlaštena osoba još
                      nije ostavila
                      odgovor na prijavu.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>


        {/* NEW REPORT HEADER */}

        <div
          className="
            pt-2
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Nova prijava
          </p>


          <h2
            className="
              mt-1
              text-2xl
              font-black
              tracking-tight
              text-[#15171A]
              sm:text-3xl
            "
          >
            Pošalji sigurnu prijavu
          </h2>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Opiši događaj što
            preciznije. Polja za
            datum i mjesto nisu
            obavezna ako ih ne znaš.
          </p>
        </div>


        {/* NEW REPORT FORM */}

        <form
          onSubmit={
            submitReport
          }
          className="
            overflow-hidden
            rounded-[28px]
            border
            border-[#E5E7EB]
            bg-white
            shadow-sm
          "
        >

          {/* PRIVACY TYPE */}

          <div
            className="
              border-b
              border-[#EEF0EC]
              p-5
              sm:p-6
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#16A6A1]
              "
            >
              Korak 1
            </p>


            <h3
              className="
                mt-1
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Način slanja
            </h3>


            <div
              className="
                mt-4
                grid
                gap-3
                md:grid-cols-2
              "
            >
              <PrivacyOption
                active={
                  anonymous
                }
                title="Anonimna prijava"
                description="Primatelj prijave neće vidjeti tvoje ime ni e-mail."
                badge="Anonimno"
                onClick={() =>
                  setAnonymous(
                    true
                  )
                }
              />


              <PrivacyOption
                active={
                  !anonymous
                }
                title="Povjerljiva prijava"
                description="Ovlaštena osoba može vidjeti tvoje podatke radi povratnog kontakta."
                badge="Povjerljivo"
                onClick={() =>
                  setAnonymous(
                    false
                  )
                }
              />
            </div>
          </div>


          {/* ACCUSED */}

          <div
            className="
              space-y-5
              border-b
              border-[#EEF0EC]
              p-5
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
                  text-[#16A6A1]
                "
              >
                Korak 2
              </p>


              <h3
                className="
                  mt-1
                  text-lg
                  font-black
                  text-[#15171A]
                "
              >
                Na koga se prijava
                odnosi?
              </h3>
            </div>


            <div>
              <label
                htmlFor="accused-role"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  text-[#344054]
                "
              >
                Uloga osobe
              </label>


              <select
                id="accused-role"
                value={
                  accusedRole
                }
                disabled={
                  submitLoading
                }
                onChange={(
                  event
                ) => {
                  const nextRole =
                    event
                      .target
                      .value;


                  setAccusedRole(
                    nextRole
                  );

                  setAccusedUid(
                    ""
                  );

                  setAccusedName(
                    ""
                  );

                  setSubmitError(
                    ""
                  );
                }}
                required
                className="
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#15171A]
                  outline-none
                  transition
                  focus:border-[#16A6A1]
                  focus:ring-4
                  focus:ring-[#16A6A1]/10
                  disabled:bg-[#F8F9F6]
                "
              >
                <option value="">
                  Odaberi
                </option>

                <option value="trainer">
                  Trener
                </option>

                <option value="gym_owner">
                  Vlasnik teretane
                </option>

                <option value="staff">
                  Drugi zaposlenik
                </option>

                <option value="other">
                  Druga osoba
                </option>
              </select>
            </div>


            {accusedRole ===
              "trainer" && (
              <div>
                <label
                  htmlFor="accused-trainer"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Odaberi trenera
                </label>


                <select
                  id="accused-trainer"
                  value={
                    accusedUid
                  }
                  onChange={(
                    event
                  ) =>
                    setAccusedUid(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    trainersLoading ||
                    submitLoading
                  }
                  required
                  className="
                    min-h-12
                    w-full
                    rounded-xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-[#15171A]
                    outline-none
                    transition
                    focus:border-[#16A6A1]
                    focus:ring-4
                    focus:ring-[#16A6A1]/10
                    disabled:bg-[#F8F9F6]
                  "
                >
                  <option value="">
                    {trainersLoading
                      ? "Učitavanje trenera..."
                      : "Odaberi trenera"}
                  </option>


                  {trainers.map(
                    (trainer) => (
                      <option
                        key={
                          trainer.uid
                        }
                        value={
                          trainer.uid
                        }
                      >
                        {
                          trainer.name
                        }
                      </option>
                    )
                  )}
                </select>


                {!trainersLoading &&
                  trainers.length ===
                    0 &&
                  !trainersError && (
                    <p
                      className="
                        mt-2
                        text-xs
                        font-semibold
                        text-amber-700
                      "
                    >
                      U ovoj teretani
                      nema pronađenih
                      trenera.
                    </p>
                  )}


                {trainersError && (
                  <p
                    className="
                      mt-2
                      text-xs
                      font-semibold
                      text-red-700
                    "
                  >
                    {trainersError}
                  </p>
                )}
              </div>
            )}


            {accusedRole &&
              accusedRole !==
                "trainer" && (
                <div>
                  <label
                    htmlFor="accused-name"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-[#344054]
                    "
                  >
                    Ime ili opis osobe
                  </label>


                  <input
                    id="accused-name"
                    type="text"
                    value={
                      accusedName
                    }
                    disabled={
                      submitLoading
                    }
                    onChange={(
                      event
                    ) =>
                      setAccusedName(
                        event.target
                          .value
                      )
                    }
                    maxLength={
                      120
                    }
                    required
                    placeholder="Primjer: osoba na recepciji"
                    className="
                      min-h-12
                      w-full
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
                      disabled:bg-[#F8F9F6]
                    "
                  />
                </div>
              )}
          </div>


          {/* DETAILS */}

          <div
            className="
              space-y-5
              p-5
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
                  text-[#16A6A1]
                "
              >
                Korak 3
              </p>


              <h3
                className="
                  mt-1
                  text-lg
                  font-black
                  text-[#15171A]
                "
              >
                Opiši događaj
              </h3>
            </div>


            <div>
              <label
                htmlFor="report-category"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  text-[#344054]
                "
              >
                Vrsta ponašanja
              </label>


              <select
                id="report-category"
                value={
                  category
                }
                disabled={
                  submitLoading
                }
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
                required
                className="
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#15171A]
                  outline-none
                  transition
                  focus:border-[#16A6A1]
                  focus:ring-4
                  focus:ring-[#16A6A1]/10
                  disabled:bg-[#F8F9F6]
                "
              >
                <option value="">
                  Odaberi
                </option>

                <option value="inappropriate_comments">
                  Neprimjereni komentari
                </option>

                <option value="sexual_harassment">
                  Seksualno uznemiravanje
                </option>

                <option value="unwanted_touching">
                  Neželjeno dodirivanje
                </option>

                <option value="threats">
                  Prijetnje ili zastrašivanje
                </option>

                <option value="discrimination">
                  Diskriminacija
                </option>

                <option value="violence">
                  Fizičko nasilje
                </option>

                <option value="privacy">
                  Narušavanje privatnosti
                </option>

                <option value="unsafe_behavior">
                  Nesigurno ponašanje ili ugrožavanje
                </option>

                <option value="other">
                  Drugo
                </option>
              </select>
            </div>


            <div>
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <label
                  htmlFor="report-description"
                  className="
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Što se dogodilo?
                </label>


                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-[#98A2B3]
                  "
                >
                  {
                    description.length
                  }
                  /5000
                </span>
              </div>


              <textarea
                id="report-description"
                value={
                  description
                }
                disabled={
                  submitLoading
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
                minLength={
                  20
                }
                maxLength={
                  5000
                }
                required
                rows={9}
                placeholder="Napiši što se dogodilo, što je osoba rekla ili napravila i sve druge važne pojedinosti."
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-[#15171A]
                  outline-none
                  transition
                  placeholder:text-[#98A2B3]
                  focus:border-[#16A6A1]
                  focus:ring-4
                  focus:ring-[#16A6A1]/10
                  disabled:bg-[#F8F9F6]
                "
              />
            </div>


            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor="report-occurred-at"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Datum i vrijeme
                  događaja
                </label>


                <input
                  id="report-occurred-at"
                  type="datetime-local"
                  value={
                    occurredAt
                  }
                  disabled={
                    submitLoading
                  }
                  onChange={(
                    event
                  ) =>
                    setOccurredAt(
                      event.target
                        .value
                    )
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
                    text-sm
                    text-[#15171A]
                    outline-none
                    transition
                    focus:border-[#16A6A1]
                    focus:ring-4
                    focus:ring-[#16A6A1]/10
                    disabled:bg-[#F8F9F6]
                  "
                />


                <p
                  className="
                    mt-1.5
                    text-[10px]
                    text-[#98A2B3]
                  "
                >
                  Opcionalno
                </p>
              </div>


              <div>
                <label
                  htmlFor="report-location"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Mjesto događaja
                </label>


                <input
                  id="report-location"
                  type="text"
                  value={
                    location
                  }
                  disabled={
                    submitLoading
                  }
                  onChange={(
                    event
                  ) =>
                    setLocation(
                      event.target
                        .value
                    )
                  }
                  maxLength={
                    200
                  }
                  placeholder="Primjer: svlačionica, recepcija ili dvorana"
                  className="
                    min-h-12
                    w-full
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
                    disabled:bg-[#F8F9F6]
                  "
                />


                <p
                  className="
                    mt-1.5
                    text-[10px]
                    text-[#98A2B3]
                  "
                >
                  Opcionalno
                </p>
              </div>
            </div>


            {submitError && (
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
                  {submitError}
                </span>
              </div>
            )}


            <div
              className="
                flex
                flex-col
                gap-4
                border-t
                border-[#EEF0EC]
                pt-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-2
                "
              >
                <span
                  className="
                    mt-1
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-[#C8D52B]
                  "
                />


                <p
                  className="
                    max-w-lg
                    text-xs
                    leading-5
                    text-[#667085]
                  "
                >
                  Prije slanja provjeri
                  podatke. Nakon slanja
                  dobit ćeš broj prijave
                  i tajni kod za
                  praćenje.
                </p>
              </div>


              <button
                type="submit"
                disabled={
                  submitLoading
                }
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#111317]
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-white
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#202328]
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  disabled:hover:translate-y-0
                "
              >
                {submitLoading ? (
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

                    Slanje...
                  </>
                ) : (
                  <>
                    Pošalji sigurnu
                    prijavu

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

        </form>

      </div>
    </RoleGuard>
  );
}


function PrivacyOption({
  active,
  title,
  description,
  badge,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        relative
        w-full
        rounded-2xl
        border
        p-5
        text-left
        transition-all

        ${
          active
            ? `
              border-[#C8D52B]
              bg-[#C8D52B]/10
              ring-4
              ring-[#C8D52B]/10
            `
            : `
              border-[#E5E7EB]
              bg-[#F8F9F6]
              hover:border-[#16A6A1]/40
            `
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-black
              text-[#15171A]
            "
          >
            {title}
          </p>


          <p
            className="
              mt-1
              text-xs
              leading-5
              text-[#667085]
            "
          >
            {description}
          </p>
        </div>


        <span
          className={`
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            border-2

            ${
              active
                ? `
                  border-[#C8D52B]
                  bg-[#C8D52B]
                  text-[#111317]
                `
                : `
                  border-[#D0D5DD]
                  bg-white
                `
            }
          `}
        >
          {active && (
            <span
              className="
                text-xs
                font-black
              "
            >
              ✓
            </span>
          )}
        </span>
      </div>


      <span
        className="
          mt-4
          inline-flex
          rounded-full
          bg-white
          px-2.5
          py-1
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-[#667085]
        "
      >
        {badge}
      </span>
    </button>
  );
}


function StatusInfo({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#E5E7EB]
        bg-white
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


      {secondary && (
        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[#667085]
          "
        >
          {secondary}
        </p>
      )}
    </div>
  );
}