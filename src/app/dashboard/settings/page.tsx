"use client";

import {
  useEffect,
  useMemo,
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
  ] =
    useState<ResponsiblePerson[]>(
      []
    );


  const [
    primaryUid,
    setPrimaryUid,
  ] =
    useState("");


  const [
    backupUid,
    setBackupUid,
  ] =
    useState("");


  const [
    loadingSettings,
    setLoadingSettings,
  ] =
    useState(false);


  const [
    savingSettings,
    setSavingSettings,
  ] =
    useState(false);


  const [
    settingsError,
    setSettingsError,
  ] =
    useState("");


  const [
    settingsMessage,
    setSettingsMessage,
  ] =
    useState("");


  const isOwner =
    userProfile?.role ===
    "gym_owner";


  const primaryPerson =
    useMemo(
      () =>
        people.find(
          (person) =>
            person.uid ===
            primaryUid
        ) || null,
      [
        people,
        primaryUid,
      ]
    );


  const backupPerson =
    useMemo(
      () =>
        people.find(
          (person) =>
            person.uid ===
            backupUid
        ) || null,
      [
        people,
        backupUid,
      ]
    );


  useEffect(() => {
    if (
      !user ||
      !isOwner
    ) {
      return;
    }


    let cancelled =
      false;


    async function loadSettings() {
      try {
        setLoadingSettings(
          true
        );

        setSettingsError(
          ""
        );


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
          (await response.json()) as
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
            data.settings
              ?.primaryUid ||
              ""
          );


          setBackupUid(
            data.settings
              ?.backupUid ||
              ""
          );
        }
      } catch (
        error: unknown
      ) {
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
          setLoadingSettings(
            false
          );
        }
      }
    }


    void loadSettings();


    return () => {
      cancelled = true;
    };
  }, [
    user,
    isOwner,
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
      backupUid ===
        primaryUid
    ) {
      setSettingsError(
        "Glavna i zamjenska osoba ne mogu biti iste."
      );

      return;
    }


    try {
      setSavingSettings(
        true
      );

      setSettingsError(
        ""
      );

      setSettingsMessage(
        ""
      );


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
                  backupUid ||
                  null,
              }),
          }
        );


      const data =
        (await response.json()) as
          SettingsApiResponse;


      if (!response.ok) {
        throw new Error(
          data.error ||
            "Postavke nije moguće spremiti."
        );
      }


      setPrimaryUid(
        data.settings
          ?.primaryUid ||
          primaryUid
      );


      setBackupUid(
        data.settings
          ?.backupUid ||
          ""
      );


      setSettingsMessage(
        "Postavke sigurnih prijava su spremljene."
      );
    } catch (
      error: unknown
    ) {
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
      setSavingSettings(
        false
      );
    }
  }


  return (
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
            Račun i aplikacija
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
            Postavke
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
            Upravljaj postavkama
            računa, sigurnim
            prijavama i pretplatom
            na jednom mjestu.
          </p>
        </div>


        {userProfile?.role && (
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-2.5
              shadow-sm
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
                text-[#667085]
              "
            >
              {formatRole(
                userProfile.role
              )}
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


      {/* OWNER SAFE REPORT SETTINGS */}

      {isOwner && (
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
              border-b
              border-[#EEF0EC]
              p-6
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
                    tracking-[0.16em]
                    text-[#16A6A1]
                  "
                >
                  Povjerljivost
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
                  Sigurne prijave
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
                  Odaberi osobe koje
                  će primati i
                  obrađivati sigurne
                  prijave tvoje
                  teretane.
                </p>
              </div>


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
                  font-black
                  text-[#C8D52B]
                "
              >
                S
              </div>
            </div>
          </div>


          {/* IMPORTANT NOTICE */}

          <div
            className="
              border-b
              border-[#EEF0EC]
              bg-[#FFF8E7]
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
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  font-black
                  text-amber-600
                  shadow-sm
                "
              >
                !
              </div>


              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-amber-900
                  "
                >
                  Neovisna obrada
                  prijava protiv
                  vlasnika
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
                  Prijave protiv
                  vlasnika teretane
                  neće se slati
                  osobama odabranima
                  ovdje. Takve prijave
                  obrađuje neovisni
                  administrator
                  platforme.
                </p>
              </div>
            </div>
          </div>


          {loadingSettings ? (
            <div
              className="
                space-y-4
                p-6
              "
            >
              <div
                className="
                  h-20
                  animate-pulse
                  rounded-2xl
                  bg-[#F4F6F2]
                "
              />

              <div
                className="
                  h-20
                  animate-pulse
                  rounded-2xl
                  bg-[#F4F6F2]
                "
              />

              <div
                className="
                  h-12
                  w-48
                  animate-pulse
                  rounded-xl
                  bg-[#F4F6F2]
                "
              />
            </div>
          ) : (
            <div
              className="
                space-y-6
                p-6
              "
            >

              {/* CURRENT RESPONSIBILITY */}

              {(primaryPerson ||
                backupPerson) && (
                <div
                  className="
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  <ResponsibleCard
                    label="Glavna osoba"
                    person={
                      primaryPerson
                    }
                    accent="lime"
                  />


                  <ResponsibleCard
                    label="Zamjenska osoba"
                    person={
                      backupPerson
                    }
                    accent="teal"
                  />
                </div>
              )}


              {/* PRIMARY */}

              <div>
                <label
                  htmlFor="primary-person"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Glavna odgovorna
                  osoba
                </label>


                <select
                  id="primary-person"
                  value={
                    primaryUid
                  }
                  onChange={(
                    event
                  ) => {
                    const nextPrimaryUid =
                      event.target.value;


                    setPrimaryUid(
                      nextPrimaryUid
                    );


                    if (
                      backupUid ===
                      nextPrimaryUid
                    ) {
                      setBackupUid(
                        ""
                      );
                    }


                    setSettingsError(
                      ""
                    );

                    setSettingsMessage(
                      ""
                    );
                  }}
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
                    focus:border-[#C8D52B]
                    focus:ring-4
                    focus:ring-[#C8D52B]/10
                  "
                >
                  <option value="">
                    Odaberi glavnu
                    osobu
                  </option>


                  {people.map(
                    (person) => (
                      <option
                        key={
                          person.uid
                        }
                        value={
                          person.uid
                        }
                      >
                        {person.name}

                        {" — "}

                        {formatRole(
                          person.role
                        )}

                        {person.email
                          ? ` (${person.email})`
                          : ""}
                      </option>
                    )
                  )}
                </select>


                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[#98A2B3]
                  "
                >
                  Ova osoba prva
                  prima nove prijave
                  protiv trenera,
                  zaposlenika ili
                  drugih osoba.
                </p>
              </div>


              {/* BACKUP */}

              <div>
                <label
                  htmlFor="backup-person"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-[#344054]
                  "
                >
                  Zamjenska odgovorna
                  osoba
                </label>


                <select
                  id="backup-person"
                  value={
                    backupUid
                  }
                  onChange={(
                    event
                  ) => {
                    setBackupUid(
                      event.target.value
                    );

                    setSettingsError(
                      ""
                    );

                    setSettingsMessage(
                      ""
                    );
                  }}
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
                  "
                >
                  <option value="">
                    Bez zamjenske
                    osobe
                  </option>


                  {people.map(
                    (person) => (
                      <option
                        key={
                          person.uid
                        }
                        value={
                          person.uid
                        }
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

                        {person.email
                          ? ` (${person.email})`
                          : ""}
                      </option>
                    )
                  )}
                </select>


                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[#98A2B3]
                  "
                >
                  Zamjenska osoba
                  koristi se kada
                  glavna osoba ne
                  smije ili ne može
                  obrađivati određenu
                  prijavu.
                </p>
              </div>


              {/* NO PEOPLE */}

              {people.length ===
                0 && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-dashed
                    border-[#D8DDD0]
                    bg-[#F6F7F3]
                    p-5
                  "
                >
                  <p
                    className="
                      text-sm
                      font-black
                      text-[#344054]
                    "
                  >
                    Nema dostupnih
                    odgovornih osoba
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-[#667085]
                    "
                  >
                    Dodaj trenera u
                    teretanu kako bi
                    mogao biti odabran
                    za obradu sigurnih
                    prijava.
                  </p>
                </div>
              )}


              {/* ERROR */}

              {settingsError && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white
                      font-black
                      text-red-600
                    "
                  >
                    !
                  </div>


                  <p
                    className="
                      pt-1.5
                      text-sm
                      font-semibold
                      leading-5
                      text-red-700
                    "
                  >
                    {settingsError}
                  </p>
                </div>
              )}


              {/* SUCCESS */}

              {settingsMessage && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-[#C8D52B]/30
                    bg-[#C8D52B]/10
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white
                      font-black
                      text-[#68720F]
                    "
                  >
                    ✓
                  </div>


                  <p
                    className="
                      pt-1.5
                      text-sm
                      font-semibold
                      leading-5
                      text-[#5F6810]
                    "
                  >
                    {settingsMessage}
                  </p>
                </div>
              )}


              {/* SAVE */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#EEF0EC]
                  pt-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-xl
                    text-xs
                    leading-5
                    text-[#98A2B3]
                  "
                >
                  Promjene počinju
                  vrijediti nakon
                  spremanja.
                </p>


                <button
                  type="button"
                  onClick={() =>
                    void saveSafeReportSettings()
                  }
                  disabled={
                    savingSettings ||
                    !primaryUid
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
                    disabled:opacity-40
                    disabled:hover:translate-y-0
                  "
                >
                  {savingSettings
                    ? "Spremanje..."
                    : "Spremi odgovorne osobe"}


                  {!savingSettings && (
                    <span
                      className="
                        text-[#C8D52B]
                      "
                    >
                      →
                    </span>
                  )}
                </button>
              </div>

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
        </section>
      )}


      {/* SUBSCRIPTION */}

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
            -right-16
            -top-20
            h-56
            w-56
            rounded-full
            bg-[#C8D52B]/15
            blur-3xl
          "
        />


        <div
          className="
            absolute
            -bottom-24
            left-1/3
            h-48
            w-48
            rounded-full
            bg-[#16A6A1]/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            z-10
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                max-w-2xl
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.05]
                  px-3
                  py-1.5
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
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-white/55
                  "
                >
                  Možeš Još Pro
                </span>
              </div>


              <h2
                className="
                  mt-4
                  text-2xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Pretplata
              </h2>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/50
                "
              >
                Upravljaj svojim
                paketom i pristupom
                Pro funkcijama
                aplikacije.
              </p>
            </div>


            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]
                text-sm
                font-black
                text-[#111317]
              "
            >
              PRO
            </div>
          </div>


          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              p-5
            "
          >
            <StripeButton
              plan="pro"
            />
          </div>
        </div>
      </section>

    </div>
  );
}


function ResponsibleCard({
  label,
  person,
  accent,
}: {
  label: string;
  person:
    | ResponsiblePerson
    | null;
  accent:
    | "lime"
    | "teal";
}) {
  const isLime =
    accent === "lime";


  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-[#F9FAF8]
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-xs
            font-black
            ${
              isLime
                ? "bg-[#C8D52B]/20 text-[#68720F]"
                : "bg-[#16A6A1]/10 text-[#128D89]"
            }
          `}
        >
          {person
            ? getInitials(
                person.name
              )
            : "—"}
        </div>


        <div
          className="
            min-w-0
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


          <p
            className="
              mt-0.5
              truncate
              text-sm
              font-black
              text-[#15171A]
            "
          >
            {person?.name ||
              "Nije odabrana"}
          </p>


          {person && (
            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-[#667085]
              "
            >
              {formatRole(
                person.role
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


function getInitials(
  value: string
) {
  return (
    value
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .toUpperCase() ||
    "O"
  );
}