"use client";

import {
  useEffect,
  useState,
} from "react";

import StripeButton from "@/components/StripeButton";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


type ResponsiblePerson = {

  uid: string;

  name: string;

  email: string | null;

  role: string;

};


type SafeReportSettings = {

  primaryUid: string | null;

  backupUid: string | null;

};


type SettingsApiResponse = {

  ok?: boolean;

  settings?: SafeReportSettings;

  people?: ResponsiblePerson[];

  error?: string;

};


function formatRole(
  role: string
) {

  switch (role) {

    case "gym_owner":

      return "Vlasnik teretane";


    case "trainer":

      return "Trener";


    default:

      return role;

  }

}


export default function SettingsPage() {


  const {
    user,
    userProfile,
  } = useAuth();


  const [
    people,
    setPeople,
  ] = useState<ResponsiblePerson[]>([]);


  const [
    primaryUid,
    setPrimaryUid,
  ] = useState("");


  const [
    backupUid,
    setBackupUid,
  ] = useState("");


  const [
    loadingSettings,
    setLoadingSettings,
  ] = useState(false);


  const [
    savingSettings,
    setSavingSettings,
  ] = useState(false);


  const [
    settingsError,
    setSettingsError,
  ] = useState("");


  const [
    settingsMessage,
    setSettingsMessage,
  ] = useState("");



  useEffect(() => {


    if (
      !user ||
      userProfile?.role !== "gym_owner"
    ) {

      return;

    }


    let cancelled =
      false;


    async function loadSettings() {


      try {

        setLoadingSettings(true);

        setSettingsError("");


        const token =
          await user!.getIdToken();


        const response =
          await fetch(
            "/api/gym/safe-report-settings",
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
          await response.json() as
            SettingsApiResponse;


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Postavke nije moguće učitati."
          );

        }


        if (!cancelled) {

          setPeople(
            data.people || []
          );


          setPrimaryUid(
            data.settings?.primaryUid || ""
          );


          setBackupUid(
            data.settings?.backupUid || ""
          );

        }


      } catch (error: unknown) {


        console.error(
          "Greška kod učitavanja postavki:",
          error
        );


        if (!cancelled) {

          setSettingsError(

            error instanceof Error

              ? error.message

              : "Postavke nije moguće učitati."

          );

        }


      } finally {


        if (!cancelled) {

          setLoadingSettings(false);

        }

      }

    }


    loadSettings();


    return () => {

      cancelled =
        true;

    };


  }, [
    user,
    userProfile?.role,
  ]);



  async function saveSafeReportSettings() {


    if (!user) {

      setSettingsError(
        "Moraš biti prijavljen."
      );

      return;

    }


    if (!primaryUid) {

      setSettingsError(
        "Odaberi glavnu odgovornu osobu."
      );

      return;

    }


    if (
      backupUid &&
      backupUid === primaryUid
    ) {

      setSettingsError(
        "Glavna i zamjenska osoba ne mogu biti iste."
      );

      return;

    }


    try {

      setSavingSettings(true);

      setSettingsError("");

      setSettingsMessage("");


      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/gym/safe-report-settings",
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
              JSON.stringify({
                primaryUid,
                backupUid:
                  backupUid || null,
              }),
          }
        );


      const data =
        await response.json() as
          SettingsApiResponse;


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Postavke nije moguće spremiti."
        );

      }


      setPrimaryUid(
        data.settings?.primaryUid ||
        primaryUid
      );


      setBackupUid(
        data.settings?.backupUid || ""
      );


      setSettingsMessage(
        "Postavke sigurnih prijava su spremljene."
      );


    } catch (error: unknown) {


      console.error(
        "Greška kod spremanja postavki:",
        error
      );


      setSettingsError(

        error instanceof Error

          ? error.message

          : "Postavke nije moguće spremiti."

      );


    } finally {

      setSavingSettings(false);

    }

  }



  return (

    <div className="space-y-8 p-6">


      <div>

        <h1 className="text-3xl font-bold">

          ⚙️ Postavke

        </h1>


        <p className="mt-2 text-gray-600">

          Upravljanje računom i postavkama aplikacije.

        </p>

      </div>



      {
        userProfile?.role === "gym_owner" && (

          <section
            className="
              space-y-6
              rounded-xl
              border
              border-blue-200
              bg-white
              p-6
              shadow-sm
            "
          >


            <div>

              <h2 className="text-2xl font-bold">

                🛡️ Sigurne prijave

              </h2>


              <p className="mt-2 text-gray-600">

                Odaberi osobe koje će primati i obrađivati
                sigurne prijave tvoje teretane.

              </p>

            </div>



            <div
              className="
                rounded-lg
                border
                border-amber-200
                bg-amber-50
                p-4
                text-sm
                text-amber-900
              "
            >

              Prijave protiv vlasnika teretane neće se
              slati osobama odabranima ovdje. Takve prijave
              obrađuje neovisni administrator platforme.

            </div>



            {
              loadingSettings

                ? (

                  <p>
                    Učitavanje postavki...
                  </p>

                )

                : (

                  <div className="space-y-5">


                    <div>

                      <label className="mb-2 block font-semibold">

                        Glavna odgovorna osoba

                      </label>


                      <select
                        value={primaryUid}
                        onChange={(event) => {

                          const nextPrimaryUid =
                            event.target.value;


                          setPrimaryUid(
                            nextPrimaryUid
                          );


                          if (
                            backupUid ===
                            nextPrimaryUid
                          ) {

                            setBackupUid("");

                          }

                        }}
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

                          Odaberi glavnu osobu

                        </option>


                        {
                          people.map(
                            (person) => (

                              <option
                                key={person.uid}
                                value={person.uid}
                              >

                                {person.name}

                                {" — "}

                                {formatRole(
                                  person.role
                                )}

                                {
                                  person.email

                                    ? ` (${person.email})`

                                    : ""
                                }

                              </option>

                            )
                          )
                        }

                      </select>


                      <p className="mt-2 text-sm text-gray-500">

                        Ova osoba prva prima nove prijave
                        protiv trenera, zaposlenika ili drugih osoba.

                      </p>

                    </div>



                    <div>

                      <label className="mb-2 block font-semibold">

                        Zamjenska odgovorna osoba

                      </label>


                      <select
                        value={backupUid}
                        onChange={(event) =>
                          setBackupUid(
                            event.target.value
                          )
                        }
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

                          Bez zamjenske osobe

                        </option>


                        {
                          people.map(
                            (person) => (

                              <option
                                key={person.uid}
                                value={person.uid}
                                disabled={
                                  person.uid ===
                                  primaryUid
                                }
                              >

                                {person.name}

                                {" — "}

                                {formatRole(
                                  person.role
                                )}

                                {
                                  person.email

                                    ? ` (${person.email})`

                                    : ""
                                }

                              </option>

                            )
                          )
                        }

                      </select>


                      <p className="mt-2 text-sm text-gray-500">

                        Zamjenska osoba koristit će se kada
                        glavna osoba ne smije ili ne može
                        obrađivati određenu prijavu.

                      </p>

                    </div>



                    {
                      settingsError && (

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

                          {settingsError}

                        </div>

                      )
                    }



                    {
                      settingsMessage && (

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

                          ✅ {settingsMessage}

                        </div>

                      )
                    }



                    <button
                      type="button"
                      onClick={
                        saveSafeReportSettings
                      }
                      disabled={
                        savingSettings ||
                        !primaryUid
                      }
                      className="
                        rounded-lg
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
                        savingSettings

                          ? "Spremanje..."

                          : "Spremi odgovorne osobe"
                      }

                    </button>


                  </div>

                )
            }


          </section>

        )
      }



      <section
        className="
          rounded-xl
          border
          bg-white
          p-6
          shadow-sm
        "
      >

        <h2 className="text-2xl font-bold">

          Pretplata

        </h2>


        <p className="mt-2 text-gray-600">

          Upravljaj svojom pretplatom i paketom.

        </p>


        <div className="mt-5">

          <StripeButton plan="pro" />

        </div>

      </section>


    </div>

  );

}