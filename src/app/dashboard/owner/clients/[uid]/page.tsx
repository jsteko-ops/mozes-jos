"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import ProtectedRoute from "@/components/ProtectedRoute";

import ClientMeasurements from "@/components/owner/ClientMeasurements";
import ClientPlans from "@/components/owner/ClientPlans";
import ClientEditForm from "@/components/clients/ClientEditForm";
import ClientTabs from "@/components/owner/ClientTabs";

import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  getGymMembers,
} from "@/lib/getGymMembers";

import {
  getCheckins,
} from "@/lib/services/klijentiService";


type Client = {
  id: string;
  uid?: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  note?: string;
  goal?: string;
  trainerId?: string;
  gymId?: string;
};


type Trainer = {
  uid?: string;
  name?: string;
  displayName?: string;
  email?: string;
};


type Gym = {
  id?: string;
  name?: string;
};


export default function OwnerClientProfile() {
  const params =
    useParams();


  const {
    userProfile,
    loading: authLoading,
  } = useAuth();


  const clientId =
    params.uid as string;


  const [
    client,
    setClient,
  ] =
    useState<Client | null>(
      null
    );


  const [
    trainer,
    setTrainer,
  ] =
    useState<Trainer | null>(
      null
    );


  const [
    gym,
    setGym,
  ] =
    useState<Gym | null>(
      null
    );


  const [
    checkins,
    setCheckins,
  ] =
    useState<any[]>([]);


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


  const [
    refresh,
    setRefresh,
  ] =
    useState(0);


  useEffect(() => {
    let cancelled =
      false;


    async function loadClient() {
      if (
        authLoading
      ) {
        return;
      }


      if (
        !userProfile
      ) {
        if (!cancelled) {
          setLoading(
            false
          );
        }

        return;
      }


      if (
        !userProfile.gymId
      ) {
        if (!cancelled) {
          setError(
            "Tvoj vlasnički račun nije povezan s teretanom."
          );

          setLoading(
            false
          );
        }

        return;
      }


      if (
        !clientId
      ) {
        if (!cancelled) {
          setError(
            "Klijent nije pronađen."
          );

          setLoading(
            false
          );
        }

        return;
      }


      try {
        if (!cancelled) {
          setLoading(
            true
          );

          setError(
            ""
          );

          setClient(
            null
          );

          setTrainer(
            null
          );

          setGym(
            null
          );

          setCheckins(
            []
          );
        }


        /*
         * Provjera članstva.
         *
         * Ne vjerujemo samo ID-u
         * klijenta iz URL-a.
         * Klijent mora pripadati
         * teretani prijavljenog
         * vlasnika.
         */
        const members =
          await getGymMembers(
            userProfile.gymId
          );


        if (
          cancelled
        ) {
          return;
        }


        const clientMember =
          members.find(
            (
              member: any
            ) =>
              member.uid ===
                clientId &&
              member.gymRole ===
                "client"
          );


        if (
          !clientMember
        ) {
          setError(
            "Ovaj klijent nije pronađen među članovima tvoje teretane."
          );

          return;
        }


        const clientData: Client = {
      ...clientMember,
      id:
        clientMember.id ||
        clientMember.uid,
    };


        setClient(
          clientData
        );


        /*
         * Check-inovi, trener
         * i podaci teretane
         * mogu se dohvatiti
         * paralelno.
         */
        const [
          checkinResult,
          trainerResult,
          gymResult,
        ] =
          await Promise.all([
            getCheckins(
              clientData.id
            ),

            clientData.trainerId
              ? getDoc(
                  doc(
                    db,
                    "users",
                    clientData.trainerId
                  )
                )
              : Promise.resolve(
                  null
                ),

            getDoc(
              doc(
                db,
                "gyms",
                userProfile.gymId
              )
            ),
          ]);


        if (
          cancelled
        ) {
          return;
        }


        setCheckins(
          checkinResult
        );


        if (
          trainerResult &&
          trainerResult.exists()
        ) {
          setTrainer({
            uid:
              trainerResult.id,

            ...trainerResult.data(),
          });
        }


        if (
          gymResult.exists()
        ) {
          setGym({
            id:
              gymResult.id,

            ...gymResult.data(),
          });
        }
      } catch (
        loadError
      ) {
        console.error(
          "Greška kod učitavanja Owner profila klijenta:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Profil klijenta trenutno nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
        }
      }
    }


    void loadClient();


    return () => {
      cancelled = true;
    };
  }, [
    clientId,
    userProfile,
    authLoading,
    refresh,
  ]);


  async function reloadCheckins() {
    if (!client) {
      return;
    }


    try {
      const updated =
        await getCheckins(
          client.id
        );


      setCheckins(
        updated
      );
    } catch (
      checkinError
    ) {
      console.error(
        "Greška kod osvježavanja Check-inova:",
        checkinError
      );
    }
  }


  return (
    <ProtectedRoute
      allowedRoles={[
        "gym_owner",
      ]}
    >
      <div className="space-y-7">

        {/* BACK */}

        <Link
          href="/dashboard/owner/clients"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#667085]
            transition
            hover:text-[#15171A]
          "
        >
          <span
            className="
              text-[#16A6A1]
            "
          >
            ←
          </span>

          Natrag na klijente
        </Link>


        {/* LOADING */}

        {loading && (
          <div className="space-y-5">

            <div
              className="
                h-72
                animate-pulse
                rounded-[32px]
                bg-[#111317]
              "
            />


            <div
              className="
                grid
                gap-4
                md:grid-cols-3
              "
            >
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="
                      h-32
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


            <div
              className="
                h-80
                animate-pulse
                rounded-[28px]
                border
                border-[#E5E7EB]
                bg-white
              "
            />

          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <section
              className="
                rounded-[28px]
                border
                border-red-200
                bg-red-50
                p-6
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
                    bg-white
                    font-black
                    text-red-600
                  "
                >
                  !
                </div>


                <div>
                  <h1
                    className="
                      text-lg
                      font-black
                      text-red-800
                    "
                  >
                    Profil nije
                    dostupan
                  </h1>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-red-700
                    "
                  >
                    {error}
                  </p>


                  <Link
                    href="/dashboard/owner/clients"
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#111317]
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-white
                    "
                  >
                    Moji klijenti

                    <span
                      className="
                        text-[#C8D52B]
                      "
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          )}


        {!loading &&
          !error &&
          client && (
            <>

              {/* HERO */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  bg-[#111317]
                  px-6
                  py-8
                  text-white
                  shadow-xl
                  shadow-black/5
                  sm:px-8
                  sm:py-10
                "
              >
                <div
                  className="
                    absolute
                    -right-20
                    -top-28
                    h-72
                    w-72
                    rounded-full
                    bg-[#16A6A1]/15
                    blur-3xl
                  "
                />


                <div
                  className="
                    absolute
                    -bottom-32
                    left-1/4
                    h-64
                    w-64
                    rounded-full
                    bg-[#C8D52B]/10
                    blur-3xl
                  "
                />


                <div
                  className="
                    relative
                    z-10
                    flex
                    flex-col
                    gap-6
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-20
                        w-20
                        shrink-0
                        items-center
                        justify-center
                        rounded-[24px]
                        bg-[#16A6A1]
                        text-xl
                        font-black
                        text-white
                      "
                    >
                      {getInitials(
                        getClientName(
                          client
                        )
                      )}
                    </div>


                    <div>
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
                            tracking-[0.15em]
                            text-white/60
                          "
                        >
                          Klijent teretane
                        </span>
                      </div>


                      <h1
                        className="
                          mt-3
                          text-3xl
                          font-black
                          tracking-tight
                          text-white
                          sm:text-4xl
                        "
                      >
                        {getClientName(
                          client
                        )}
                      </h1>


                      <p
                        className="
                          mt-2
                          text-sm
                          text-white/50
                        "
                      >
                        {client.email ||
                          "Email nije dostupan"}
                      </p>
                    </div>
                  </div>


                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <HeroStat
                      value={
                        checkins.length
                      }
                      label="Check-inova"
                    />


                    <HeroStat
                      value={
                        client.trainerId
                          ? "DA"
                          : "—"
                      }
                      label="Trener"
                    />
                  </div>
                </div>
              </section>


              {/* SUMMARY */}

              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-3
                "
              >
                <SummaryCard
                  eyebrow="Trener"
                  value={
                    getTrainerName(
                      trainer
                    )
                  }
                  description="Dodijeljeni trener klijenta"
                  accent="lime"
                />


                <SummaryCard
                  eyebrow="Teretana"
                  value={
                    gym?.name ||
                    "Moja teretana"
                  }
                  description="Teretana kojoj klijent pripada"
                  accent="teal"
                />


                <SummaryCard
                  eyebrow="Check-in"
                  value={String(
                    checkins.length
                  )}
                  description="Ukupno spremljenih Check-inova"
                  accent="dark"
                />
              </section>


              {/* BASIC INFO */}

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
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-[#16A6A1]
                    "
                  >
                    Klijent
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
                    Osnovni podaci
                  </h2>


                  <p
                    className="
                      mt-2
                      text-sm
                      text-[#667085]
                    "
                  >
                    Brzi pregled
                    osnovnih podataka
                    klijenta.
                  </p>
                </div>


                <div
                  className="
                    grid
                    md:grid-cols-2
                  "
                >
                  <InfoBlock
                    label="Ime i prezime"
                    value={
                      getClientName(
                        client
                      )
                    }
                  />


                  <InfoBlock
                    label="Email"
                    value={
                      client.email ||
                      "Nije uneseno"
                    }
                  />


                  <InfoBlock
                    label="Telefon"
                    value={
                      client.phone ||
                      "Nije uneseno"
                    }
                  />


                  <InfoBlock
                    label="Cilj"
                    value={
                      client.goal ||
                      "Nije uneseno"
                    }
                  />


                  <InfoBlock
                    label="Trener"
                    value={
                      getTrainerName(
                        trainer
                      )
                    }
                  />


                  <InfoBlock
                    label="Teretana"
                    value={
                      gym?.name ||
                      "Moja teretana"
                    }
                  />


                  <div
                    className="
                      border-t
                      border-[#EEF0EC]
                      p-6
                      md:col-span-2
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
                      Napomena
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
                      {client.note ||
                        "Nema unesene napomene."}
                    </p>
                  </div>
                </div>


                <div
                  className="
                    h-1
                    bg-gradient-to-r
                    from-[#16A6A1]
                    via-[#C8D52B]
                    to-transparent
                  "
                />
              </section>


              {/* TABS */}

              <section>
                <div
                  className="
                    mb-5
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-[#16A6A1]
                    "
                  >
                    Upravljanje klijentom
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
                    Profil i napredak
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
                    Uredi podatke,
                    pregledaj mjerenja,
                    planove i Check-in
                    povijest klijenta.
                  </p>
                </div>


                <ClientTabs
                  profile={
                    <ClientEditForm
                      client={
                        client
                      }
                      onSaved={() =>
                        setRefresh(
                          (
                            current
                          ) =>
                            current +
                            1
                        )
                      }
                    />
                  }

                  measurements={
                    <ClientMeasurements
                      clientId={
                        client.id
                      }
                    />
                  }

                  plans={
                    <ClientPlans
                      clientId={
                        client.id
                      }
                    />
                  }

                  checkin={
                    <div
                      className="
                        space-y-7
                      "
                    >
                      <div>
                        <div
                          className="
                            mb-4
                          "
                        >
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.16em]
                              text-[#16A6A1]
                            "
                          >
                            Novi unos
                          </p>


                          <h3
                            className="
                              mt-1
                              text-xl
                              font-black
                              text-[#15171A]
                            "
                          >
                            Evidentiraj
                            Check-in
                          </h3>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-[#667085]
                            "
                          >
                            Dodaj novi
                            Check-in ovom
                            klijentu.
                          </p>
                        </div>


                        <CheckinForm
                          clientId={
                            client.id
                          }
                          onSaveAction={
                            reloadCheckins
                          }
                        />
                      </div>


                      <div>
                        <div
                          className="
                            mb-4
                            flex
                            items-end
                            justify-between
                            gap-4
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


                            <h3
                              className="
                                mt-1
                                text-xl
                                font-black
                                text-[#15171A]
                              "
                            >
                              Check-inovi
                            </h3>
                          </div>


                          <div
                            className="
                              rounded-xl
                              bg-[#111317]
                              px-3
                              py-2
                              text-sm
                              font-black
                              text-[#C8D52B]
                            "
                          >
                            {
                              checkins.length
                            }
                          </div>
                        </div>


                        <CheckinHistory
                          checkins={
                            checkins
                          }
                          clientId={
                            client.id
                          }
                          onReviewed={
                            reloadCheckins
                          }
                        />
                      </div>
                    </div>
                  }

                  nutrition={
                    <ComingSoonCard
                      eyebrow="Prehrana"
                      title="Plan prehrane"
                      description="Owner pregled prehrane klijenta bit će povezan s aktivnim modulom prehrane."
                      accent="lime"
                    />
                  }

                  chat={
                    <ComingSoonCard
                      eyebrow="Komunikacija"
                      title="Chat klijenta"
                      description="Ovdje će vlasnik imati pregled komunikacijskog statusa klijenta bez narušavanja privatnosti razgovora."
                      accent="teal"
                    />
                  }
                />
              </section>

            </>
          )}

      </div>
    </ProtectedRoute>
  );
}


function HeroStat({
  value,
  label,
}: {
  value:
    | string
    | number;
  label: string;
}) {
  return (
    <div
      className="
        min-w-[110px]
        rounded-[22px]
        border
        border-white/10
        bg-white/[0.05]
        px-5
        py-4
        text-center
      "
    >
      <p
        className="
          text-2xl
          font-black
          text-[#C8D52B]
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/40
        "
      >
        {label}
      </p>
    </div>
  );
}


function SummaryCard({
  eyebrow,
  value,
  description,
  accent,
}: {
  eyebrow: string;
  value: string;
  description: string;
  accent:
    | "lime"
    | "teal"
    | "dark";
}) {
  const colors = {
    lime:
      "bg-[#C8D52B]/15 text-[#68720F]",

    teal:
      "bg-[#16A6A1]/10 text-[#128D89]",

    dark:
      "bg-[#111317] text-[#C8D52B]",
  };


  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
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
        {eyebrow}
      </p>


      <div
        className={`
          mt-4
          inline-flex
          min-h-11
          max-w-full
          items-center
          rounded-xl
          px-4
          py-2
          text-sm
          font-black
          ${colors[accent]}
        `}
      >
        <span
          className="
            truncate
          "
        >
          {value}
        </span>
      </div>


      <p
        className="
          mt-4
          text-xs
          leading-5
          text-[#98A2B3]
        "
      >
        {description}
      </p>
    </div>
  );
}


function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        border-t
        border-[#EEF0EC]
        p-6
        first:border-t-0
        md:odd:border-r
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
        {label}
      </p>


      <p
        className="
          mt-2
          break-words
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


function ComingSoonCard({
  eyebrow,
  title,
  description,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent:
    | "lime"
    | "teal";
}) {
  const isLime =
    accent === "lime";


  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
      "
    >
      <div
        className={`
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          blur-3xl
          ${
            isLime
              ? "bg-[#C8D52B]/15"
              : "bg-[#16A6A1]/15"
          }
        `}
      />


      <div
        className="
          relative
          z-10
        "
      >
        <div
          className={`
            inline-flex
            rounded-full
            px-3
            py-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            ${
              isLime
                ? "bg-[#C8D52B]/15 text-[#68720F]"
                : "bg-[#16A6A1]/10 text-[#128D89]"
            }
          `}
        >
          {eyebrow}
        </div>


        <h3
          className="
            mt-4
            text-xl
            font-black
            text-[#15171A]
          "
        >
          {title}
        </h3>


        <p
          className="
            mt-2
            max-w-xl
            text-sm
            leading-6
            text-[#667085]
          "
        >
          {description}
        </p>


        <div
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-[#F4F6F2]
            px-4
            py-3
            text-xs
            font-bold
            text-[#667085]
          "
        >
          Modul u pripremi
        </div>
      </div>
    </div>
  );
}


function getClientName(
  client: Client
) {
  return (
    client.name ||
    client.displayName ||
    client.email ||
    "Klijent"
  );
}


function getTrainerName(
  trainer:
    | Trainer
    | null
) {
  return (
    trainer?.name ||
    trainer?.displayName ||
    trainer?.email ||
    "Nije dodijeljen"
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
    "K"
  );
}