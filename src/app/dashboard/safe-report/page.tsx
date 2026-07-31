"use client";

import {
  FormEvent,
  useState,
} from "react";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


type ApiResponse = {

  ok?: boolean;

  error?: string;

  reportId?: string;

  reportNumber?: string;

  accessCode?: string;

};


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
  ] = useState<ApiResponse | null>(null);



  async function submitReport(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (!user) {

      setError(
        "Moraš biti prijavljen kako bi poslao prijavu."
      );

      return;

    }


    if (!accusedRole) {

      setError(
        "Odaberi na koga se prijava odnosi."
      );

      return;

    }


    if (!accusedName.trim()) {

      setError(
        "Upiši ime ili opis osobe."
      );

      return;

    }


    if (!category) {

      setError(
        "Odaberi vrstu ponašanja."
      );

      return;

    }


    if (description.trim().length < 20) {

      setError(
        "Opis mora sadržavati najmanje 20 znakova."
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
        await response.json() as ApiResponse;


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Prijavu nije moguće poslati."
        );

      }


      setResult(data);


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


      setError(

        error instanceof Error

          ? error.message

          : "Prijavu nije moguće poslati."

      );


    } finally {

      setLoading(false);

    }

  }



  return (

    <RoleGuard allowedRoles={["client"]}>


      <div className="mx-auto max-w-3xl space-y-6">


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



          <button

            type="submit"

            disabled={loading}

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
              loading

                ? "Slanje prijave..."

                : "🛡️ Pošalji sigurnu prijavu"
            }

          </button>


        </form>


      </div>


    </RoleGuard>

  );

}