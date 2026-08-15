"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

import ProtectedRoute from "@/components/ProtectedRoute";
import EditTrainerModal from "@/components/owner/EditTrainerModal";
import {
  getGymMembers,
} from "@/lib/getGymMembers";

import {
  getClients,
} from "@/lib/services/klijentiService";


type Trainer = {
  uid: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  gymRole?: string;
};


type Client = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  trainerId?: string;
};


export default function TrainerDetailsPage() {
  const params =
    useParams();


  const trainerId =
    params.id as string;


  const [
    trainer,
    setTrainer,
  ] =
    useState<Trainer | null>(
      null
    );
const [
  editOpen,
  setEditOpen,
] =
  useState(false);


  const [
    clients,
    setClients,
  ] =
    useState<Client[]>([]);


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


  const sortedClients =
    useMemo(
      () =>
        [...clients].sort(
          (a, b) =>
            getClientName(a)
              .localeCompare(
                getClientName(b),
                "hr"
              )
        ),
      [clients]
    );


  useEffect(() => {
    let cancelled =
      false;


    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            if (!cancelled) {
              setLoading(
                false
              );
            }

            return;
          }


          if (!trainerId) {
            if (!cancelled) {
              setError(
                "Trener nije pronađen."
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

              setTrainer(
                null
              );

              setClients(
                []
              );
            }


            /*
             * Prvo dohvaćamo članove
             * vlasnikove teretane.
             *
             * Tako ne prikazujemo
             * proizvoljnog trenera
             * samo zato što je njegov
             * ID upisan u URL.
             */
            const ownerProfile =
              await import(
                "firebase/firestore"
              ).then(
                async ({
                  doc,
                  getDoc,
                }) =>
                  getDoc(
                    doc(
                      (
                        await import(
                          "@/lib/firebase"
                        )
                      ).db,
                      "users",
                      user.uid
                    )
                  )
              );


            if (cancelled) {
              return;
            }


            const ownerData =
              ownerProfile.data();


            if (!ownerData?.gymId) {
              setError(
                "Tvoj vlasnički račun nije povezan s teretanom."
              );

              return;
            }


            const members =
              await getGymMembers(
                String(
                  ownerData.gymId
                )
              );


            if (cancelled) {
              return;
            }


            const trainerMember =
              members.find(
                (
                  member: any
                ) =>
                  member.uid ===
                    trainerId &&
                  member.gymRole ===
                    "trainer"
              );


            if (!trainerMember) {
              setError(
                "Ovaj trener nije pronađen među trenerima tvoje teretane."
              );

              return;
            }


            const trainerClients =
              await getClients(
                trainerId
              );


            if (cancelled) {
              return;
            }


            setTrainer(
              trainerMember as Trainer
            );


            setClients(
              trainerClients as Client[]
            );
          } catch (
            loadError
          ) {
            console.error(
              "Greška kod učitavanja profila trenera:",
              loadError
            );


            if (!cancelled) {
              setError(
                "Profil trenera trenutno nije moguće učitati."
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
      );


    return () => {
      cancelled = true;

      unsubscribe();
    };
  }, [
    trainerId,
  ]);


  return (
    <ProtectedRoute
      allowedRoles={[
        "gym_owner",
      ]}
    >
      <div className="space-y-7">

        {/* BACK */}

        <Link
          href="/dashboard/owner/trainers"
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

          Natrag na trenere
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
                    href="/dashboard/owner/trainers"
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
                    Moji treneri

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
          trainer && (
            <>

              {/* TRAINER HERO */}

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
                    bg-[#C8D52B]/15
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
                    bg-[#16A6A1]/10
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
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
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
                        bg-[#C8D52B]
                        text-xl
                        font-black
                        text-[#111317]
                      "
                    >
                      {getInitials(
                        getTrainerName(
                          trainer
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
                          Trener teretane
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
                        {getTrainerName(
                          trainer
                        )}
                      </h1>


                      <p
                        className="
                          mt-2
                          text-sm
                          text-white/50
                        "
                      >
                        {trainer.email ||
                          "Email nije dostupan"}
                      </p>
                    </div>
                  </div>

<div
  className="
    flex
    flex-col
    gap-3
  "
>
  <button
    type="button"
    onClick={() =>
      setEditOpen(true)
    }
    className="
      rounded-xl
      border
      border-white/15
      bg-white/10
      px-5
      py-3
      text-sm
      font-black
      text-white
      transition
      hover:bg-white/15
    "
  >
    Uredi podatke
  </button>

  <div
    className="
      rounded-[22px]
      border
      border-white/10
      bg-white/[0.05]
      px-6
      py-5
      text-center
    "
  >
    <p
      className="
        text-4xl
        font-black
        text-[#C8D52B]
      "
    >
      {
        clients.length
      }
    </p>

    <p
      className="
        mt-1
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        text-white/40
      "
    >
      {clients.length ===
      1
        ? "Klijent"
        : "Klijenata"}
    </p>
  </div>
</div>


               
                </div>
              </section>


              {/* STATS */}

              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-3
                "
              >
                <StatCard
                  label="Klijenti"
                  value={
                    clients.length
                  }
                  description="Klijenti dodijeljeni ovom treneru"
                  accent="lime"
                />


                <StatCard
                  label="Status"
                  value="Aktivan"
                  description="Trener je povezan s ovom teretanom"
                  accent="teal"
                />


                <StatCard
                  label="Uloga"
                  value="Trener"
                  description="Član trenerskog tima"
                  accent="dark"
                />
              </section>


              {/* CONTACT */}

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
                    Profil
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
                    Podaci trenera
                  </h2>
                </div>


                <div
                  className="
                    grid
                    gap-0
                    md:grid-cols-2
                  "
                >
                  <InfoBlock
                    label="Ime i prezime"
                    value={
                      getTrainerName(
                        trainer
                      )
                    }
                  />


                  <InfoBlock
                    label="Email"
                    value={
                      trainer.email ||
                      "Nije uneseno"
                    }
                  />


                  {trainer.phone && (
                    <InfoBlock
                      label="Telefon"
                      value={
                        trainer.phone
                      }
                    />
                  )}


                  <InfoBlock
                    label="Broj klijenata"
                    value={String(
                      clients.length
                    )}
                  />
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
              </section>


              {/* CLIENTS */}

              <section>
                <div
                  className="
                    mb-5
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-end
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
                      Dodijeljeni članovi
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
                      Klijenti trenera
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-[#667085]
                      "
                    >
                      Pregled klijenata
                      koji su povezani s
                      ovim trenerom.
                    </p>
                  </div>


                  <div
                    className="
                      inline-flex
                      w-fit
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      py-3
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        min-w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#111317]
                        px-2
                        text-sm
                        font-black
                        text-[#C8D52B]
                      "
                    >
                      {
                        clients.length
                      }
                    </div>


                    <span
                      className="
                        text-xs
                        font-bold
                        text-[#667085]
                      "
                    >
                      ukupno
                    </span>
                  </div>
                </div>


                {sortedClients.length ===
                0 ? (
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
                        bg-[#16A6A1]/10
                        text-xl
                        font-black
                        text-[#128D89]
                      "
                    >
                      K
                    </div>


                    <h3
                      className="
                        mt-5
                        text-xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      Nema dodijeljenih
                      klijenata
                    </h3>


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
                      Ovom treneru
                      trenutno nije
                      dodijeljen nijedan
                      klijent.
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      grid
                      gap-4
                      md:grid-cols-2
                      xl:grid-cols-3
                    "
                  >
                    {sortedClients.map(
                      (
                        client,
                        index
                      ) => (
                        <ClientCard
                          key={
                            client.id
                          }
                          client={
                            client
                          }
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </section>

            </>
          )}

        {trainer && (
          <EditTrainerModal
            open={editOpen}
            trainer={trainer}
            onClose={() =>
              setEditOpen(false)
            }
            onSaved={(updatedTrainer) => {
              setTrainer((currentTrainer) =>
                currentTrainer
                  ? {
                      ...currentTrainer,
                      name: updatedTrainer.name,
                      displayName: updatedTrainer.name,
                      email: updatedTrainer.email,
                      phone:
                        updatedTrainer.phone ||
                        undefined,
                    }
                  : currentTrainer
              );
            }}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}

function ClientCard({
  client,
  index,
}: {
  client: Client;
  index: number;
}) {
  const name =
    getClientName(
      client
    );


  return (
    <Link
      href={`/dashboard/owner/clients/${client.id}`}
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:border-[#16A6A1]/40
        hover:shadow-xl
        hover:shadow-black/5
      "
    >
      <div
        className="
          absolute
          right-0
          top-0
          h-24
          w-24
          rounded-bl-full
          bg-[#16A6A1]/5
          transition
          group-hover:bg-[#16A6A1]/10
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
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#16A6A1]/10
              text-sm
              font-black
              text-[#128D89]
            "
          >
            {getInitials(
              name
            )}
          </div>


          <span
            className="
              rounded-full
              bg-[#F4F6F2]
              px-3
              py-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-[#667085]
            "
          >
            Klijent
          </span>
        </div>


        <p
          className="
            mt-5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-[#98A2B3]
          "
        >
          Klijent{" "}
          {String(
            index + 1
          ).padStart(
            2,
            "0"
          )}
        </p>


        <h3
          className="
            mt-1
            truncate
            text-lg
            font-black
            text-[#15171A]
          "
        >
          {name}
        </h3>


        <p
          className="
            mt-2
            truncate
            text-sm
            text-[#667085]
          "
        >
          {client.email ||
            "Email nije dostupan"}
        </p>


        {client.phone && (
          <p
            className="
              mt-1
              truncate
              text-xs
              text-[#98A2B3]
            "
          >
            {client.phone}
          </p>
        )}


        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            border-t
            border-[#EEF0EC]
            pt-5
          "
        >
          <span
            className="
              text-xs
              font-bold
              text-[#667085]
            "
          >
            Otvori profil
          </span>


          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#F4F6F2]
              font-black
              text-[#15171A]
              transition-all
              group-hover:translate-x-1
              group-hover:bg-[#16A6A1]
              group-hover:text-white
            "
          >
            →
          </div>
        </div>
      </div>
    </Link>
  );
}


function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string | number;
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
          text-xs
          font-bold
          text-[#667085]
        "
      >
        {label}
      </p>


      <div
        className={`
          mt-4
          inline-flex
          min-h-11
          items-center
          justify-center
          rounded-xl
          px-4
          text-xl
          font-black
          ${colors[accent]}
        `}
      >
        {value}
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
        border-b
        border-[#EEF0EC]
        p-6
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


function getTrainerName(
  trainer: Trainer
) {
  return (
    trainer.name ||
    trainer.displayName ||
    trainer.email ||
    "Trener"
  );
}


function getClientName(
  client: Client
) {
  return (
    client.name ||
    client.email ||
    "Klijent"
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