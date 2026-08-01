"use client";

import {
  FormEvent,
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

  statusChangedAt: string | null;

  createdAt: string | null;

  updatedAt: string | null;

};


type StatusApiResponse = {

  report?: SafeReportStatus;

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
  ] = useState(true);


  const [
    accusedRole,
    setAccusedRole,
  ] = useState("");


  const [
    accusedName,
    setAccusedName,
  ] = useState("");


  const [
    category,
    setCategory,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    occurredAt,
    setOccurredAt,
  ] = useState("");


  const [
    location,
    setLocation,
  ] = useState("");


  const [
    submitLoading,
    setSubmitLoading,
  ] = useState(false);


  const [
    submitError,
    setSubmitError,
  ] = useState("");


  const [
    result,
    setResult,
  ] = useState<SubmitApiResponse | null>(null);


  const [
    lookupReportNumber,
    setLookupReportNumber,
  ] = useState("");


  const [
    lookupAccessCode,
    setLookupAccessCode,
  ] = useState("");


  const [
    lookupLoading,
    setLookupLoading,
  ] = useState(false);


  const [
    lookupError,
    setLookupError,
  ] = useState("");


  const [
    lookupResult,
    setLookupResult,
  ] = useState<SafeReportStatus | null>(null);



  async function submitReport(
    event: FormEvent<HTMLFormElement>
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


    if (!accusedName.trim()) {

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
      description.trim().length < 20
    ) {

      setSubmitError(
        "Opis mora sadržavati najmanje 20 znakova."
      );

      return;

    }


    try {

      setSubmitLoading(true);

      setSubmitError("");

      setResult(null);


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
                accusedName:
                  accusedName.trim(),
                category,
                description:
                  description.trim(),
                occurredAt:
                  occurredAt || undefined,
                location:
                  location.trim() || undefined,
              }),
          }
        );


      const data =
        await response.json() as
          SubmitApiResponse;


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

      setAccusedName("");

      setCategory("");

      setDescription("");

      setOccurredAt("");

      setLocation("");


    } catch (error: unknown) {


      console.error(
        "Greška kod slanja prijave:",
        error
      );


      setSubmitError(

        error instanceof Error

          ? error.message

          : "Prijavu nije moguće poslati."

      );


    } finally {

      setSubmitLoading(false);

    }

  }



  async function lookupReport(
    event: FormEvent<HTMLFormElement>
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

      setLookupLoading(true);

      setLookupError("");

      setLookupResult(null);


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
        await response.json() as
          StatusApiResponse;


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


    } catch (error: unknown) {


      console.error(
        "Greška kod provjere prijave:",
        error
      );


      setLookupError(

        error instanceof Error

          ? error.message

          : "Status prijave nije moguće provjeriti."

      );


    } finally {

      setLookupLoading(false);

    }

  }



  return (

    <RoleGuard allowedRoles={["client"]}>


      <div className="mx-auto max-w-3xl space-y-8">


        <div>

          <h1 className="text-3xl font-bold">

            🛡️ Sigurna prijava

          </h1>


          <p className="mt-2 text-gray-600">

            Ovdje možeš prijaviti neprimjereno,
            uznemirujuće ili nesigurno ponašanje.

          </p>

        </div>



        <div
          className="
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-5
            text-sm
            text-blue-900
          "
        >

          Prijava se neće poslati osobi protiv koje
          je podnesena. Kod anonimne prijave primatelj
          ne vidi tvoje ime ni e-mail.

        </div>



        {
          result?.reportNumber &&
          result?.accessCode && (

            <div
              className="
                space-y-3
                rounded-xl
                border
                border-green-300
                bg-green-50
                p-6
              "
            >

              <h2 className="text-xl font-bold text-green-800">

                Prijava je uspješno poslana ✅

              </h2>


              <div>

                <b>Broj prijave:</b>{" "}

                <span className="font-mono">

                  {result.reportNumber}

                </span>

              </div>


              <div>

                <b>Tajni pristupni kod:</b>{" "}

                <span className="font-mono">

                  {result.accessCode}

                </span>

              </div>


              <p className="font-semibold text-red-700">

                Spremi ili fotografiraj ove podatke.
                Tajni kod se poslije neće ponovno prikazati.

              </p>

            </div>

          )
        }

        <section
          className="
            space-y-5
            rounded-xl
            border
            border-violet-200
            bg-violet-50
            p-6
          "
        >


          <div>

            <h2 className="text-2xl font-bold text-violet-950">

              🔎 Provjeri status prijave

            </h2>


            <p className="mt-2 text-sm text-violet-800">

              Za provjeru su potrebni broj prijave
              i tajni pristupni kod koji si dobio
              nakon slanja.

            </p>

          </div>



          <form
            onSubmit={lookupReport}
            className="space-y-4"
          >


            <div>

              <label className="mb-2 block font-semibold">

                Broj prijave

              </label>


              <input
                type="text"
                value={lookupReportNumber}
                onChange={(event) =>
                  setLookupReportNumber(
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
                  border-violet-300
                  bg-white
                  px-4
                  py-3
                  font-mono
                  uppercase
                "
              />

            </div>



            <div>

              <label className="mb-2 block font-semibold">

                Tajni pristupni kod

              </label>


              <input
                type="text"
                value={lookupAccessCode}
                onChange={(event) =>
                  setLookupAccessCode(
                    event.target.value
                      .toUpperCase()
                  )
                }
                placeholder="AB12-CD34-EF56"
                autoComplete="off"
                className="
                  w-full
                  rounded-lg
                  border
                  border-violet-300
                  bg-white
                  px-4
                  py-3
                  font-mono
                  uppercase
                "
              />

            </div>



            {
              lookupError && (

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

                  {lookupError}

                </div>

              )
            }



            <button
              type="submit"
              disabled={lookupLoading}
              className="
                w-full
                rounded-xl
                bg-violet-700
                px-6
                py-3
                font-bold
                text-white
                hover:bg-violet-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {
                lookupLoading

                  ? "Provjera..."

                  : "Provjeri status i odgovor"
              }

            </button>

          </form>

          <ResetAccessCode />

          {
            lookupResult && (

              <div
                className="
                  space-y-5
                  rounded-xl
                  border
                  border-violet-300
                  bg-white
                  p-6
                "
              >


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


                    <p className="font-mono text-xl font-bold">

                      {lookupResult.reportNumber}

                    </p>

                  </div>


                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-sm
                      font-bold
                      ${statusBadgeClass(
                        lookupResult.status
                      )}
                    `}
                  >

                    {formatStatus(
                      lookupResult.status
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
                        lookupResult.accused.role
                      )}

                    </p>


                    <p>

                      {lookupResult.accused.name}

                    </p>

                  </div>



                  <div>

                    <p className="text-sm text-gray-500">

                      Vrsta ponašanja

                    </p>


                    <p className="font-semibold">

                      {formatCategory(
                        lookupResult.category
                      )}

                    </p>

                  </div>



                  <div>

                    <p className="text-sm text-gray-500">

                      Prijava zaprimljena

                    </p>


                    <p>

                      {formatDate(
                        lookupResult.createdAt
                      )}

                    </p>

                  </div>



                  <div>

                    <p className="text-sm text-gray-500">

                      Zadnja promjena statusa

                    </p>


                    <p>

                      {formatDate(
                        lookupResult.statusChangedAt
                      )}

                    </p>

                  </div>

                </div>



                <div
                  className="
                    rounded-lg
                    border
                    border-blue-200
                    bg-blue-50
                    p-4
                  "
                >

                  <p className="font-semibold text-blue-900">

                    Trenutačni status

                  </p>


                  <p className="mt-1 text-blue-800">

                    {formatStatus(
                      lookupResult.status
                    )}

                  </p>

                </div>



                {
                  lookupResult.response

                    ? (

                      <div
                        className="
                          rounded-lg
                          border
                          border-green-200
                          bg-green-50
                          p-5
                        "
                      >

                        <h3 className="font-bold text-green-900">

                          Odgovor ovlaštene osobe

                        </h3>


                        <p className="mt-3 whitespace-pre-line">

                          {lookupResult.response}

                        </p>


                        <p className="mt-4 text-sm text-green-800">

                          Odgovor spremljen:{" "}

                          {formatDate(
                            lookupResult.responseAt
                          )}

                        </p>

                      </div>

                    )

                    : (

                      <div
                        className="
                          rounded-lg
                          border
                          border-amber-200
                          bg-amber-50
                          p-4
                          text-amber-900
                        "
                      >

                        Ovlaštena osoba još nije ostavila odgovor.

                      </div>

                    )
                }

              </div>

            )
          }


        </section>



        <div className="border-t pt-8">

          <h2 className="text-2xl font-bold">

            Pošalji novu prijavu

          </h2>

        </div>



        <form
          onSubmit={submitReport}
          className="
            space-y-5
            rounded-xl
            border
            bg-white
            p-6
          "
        >


          <div>

            <h2 className="mb-3 text-lg font-bold">

              Način slanja

            </h2>


            <label className="flex items-start gap-3">

              <input
                type="radio"
                name="reportPrivacy"
                checked={anonymous}
                onChange={() =>
                  setAnonymous(true)
                }
                className="mt-1"
              />


              <span>

                <b>Anonimna prijava</b>

                <span className="block text-sm text-gray-600">

                  Primatelj prijave neće vidjeti tvoje
                  ime ni e-mail.

                </span>

              </span>

            </label>


            <label className="mt-3 flex items-start gap-3">

              <input
                type="radio"
                name="reportPrivacy"
                checked={!anonymous}
                onChange={() =>
                  setAnonymous(false)
                }
                className="mt-1"
              />


              <span>

                <b>Povjerljiva prijava</b>

                <span className="block text-sm text-gray-600">

                  Ovlaštena osoba može vidjeti tvoje
                  podatke radi povratnog kontakta.

                </span>

              </span>

            </label>

          </div>



          <div>

            <label className="mb-2 block font-semibold">

              Na koga se prijava odnosi?

            </label>


            <select
              value={accusedRole}
              onChange={(event) =>
                setAccusedRole(
                  event.target.value
                )
              }
              required
              className="
                w-full
                rounded-lg
                border
                bg-white
                px-4
                py-3
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



          <div>

            <label className="mb-2 block font-semibold">

              Ime ili opis osobe

            </label>


            <input
              type="text"
              value={accusedName}
              onChange={(event) =>
                setAccusedName(
                  event.target.value
                )
              }
              maxLength={120}
              required
              placeholder="Primjer: trener Marko ili osoba na recepciji"
              className="
                w-full
                rounded-lg
                border
                px-4
                py-3
              "
            />

          </div>



          <div>

            <label className="mb-2 block font-semibold">

              Vrsta ponašanja

            </label>


            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              required
              className="
                w-full
                rounded-lg
                border
                bg-white
                px-4
                py-3
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

            <label className="mb-2 block font-semibold">

              Opiši što se dogodilo

            </label>


            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              minLength={20}
              maxLength={5000}
              required
              rows={9}
              placeholder="Napiši što se dogodilo, što je osoba rekla ili napravila i sve druge važne pojedinosti."
              className="
                w-full
                rounded-lg
                border
                px-4
                py-3
              "
            />


            <p className="mt-1 text-right text-xs text-gray-500">

              {description.length}/5000

            </p>

          </div>



          <div>

            <label className="mb-2 block font-semibold">

              Datum i vrijeme događaja

            </label>


            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(event) =>
                setOccurredAt(
                  event.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                px-4
                py-3
              "
            />

          </div>



          <div>

            <label className="mb-2 block font-semibold">

              Mjesto događaja

            </label>


            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              maxLength={200}
              placeholder="Primjer: svlačionica, recepcija ili dvorana"
              className="
                w-full
                rounded-lg
                border
                px-4
                py-3
              "
            />

          </div>



          {
            submitError && (

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

                {submitError}

              </div>

            )
          }



          <button
            type="submit"
            disabled={submitLoading}
            className="
              w-full
              rounded-xl
              bg-blue-700
              px-6
              py-3
              font-bold
              text-white
              hover:bg-blue-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {
              submitLoading

                ? "Slanje prijave..."

                : "🛡️ Pošalji sigurnu prijavu"
            }

          </button>


        </form>


      </div>


    </RoleGuard>

  );

}