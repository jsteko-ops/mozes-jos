"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  addGymMember,
} from "@/lib/addGymMember";

import {
  getGymMembers,
} from "@/lib/getGymMembers";


type GymRole =
  | "trainer"
  | "client";


type AddingRole =
  | GymRole
  | "gym_staff";


type GymMember = {
  uid: string;
  name?: string;
  displayName?: string;
  email?: string;
  gymRole?: string;
};


export default function OwnerDashboard() {
  const [
    gymId,
    setGymId,
  ] =
    useState<string | null>(
      null
    );


  const [
    members,
    setMembers,
  ] =
    useState<GymMember[]>(
      []
    );


  const [
    trainerEmail,
    setTrainerEmail,
  ] =
    useState("");


  const [
    clientEmail,
    setClientEmail,
  ] =
    useState("");


  const [
    staffName,
    setStaffName,
  ] =
    useState("");


  const [
    staffEmail,
    setStaffEmail,
  ] =
    useState("");


  const [
    staffPhone,
    setStaffPhone,
  ] =
    useState("");

  const [
    pageLoading,
    setPageLoading,
  ] =
    useState(true);


  const [
    addingRole,
    setAddingRole,
  ] =
    useState<
      AddingRole | null
    >(null);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const trainers =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.gymRole ===
            "trainer"
        ),
      [members]
    );


  const clients =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.gymRole ===
            "client"
        ),
      [members]
    );


  async function loadMembers(
    id: string
  ) {
    const data =
      await getGymMembers(
        id
      );


    setMembers(
      data as GymMember[]
    );
  }


  useEffect(() => {
    let cancelled =
      false;


    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            if (
              !cancelled
            ) {
              setPageLoading(
                false
              );
            }

            return;
          }


          try {
            if (
              !cancelled
            ) {
              setPageLoading(
                true
              );

              setError(
                ""
              );
            }


            const userSnap =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );


            if (
              cancelled
            ) {
              return;
            }


            const data =
              userSnap.data();


            if (
              !data?.gymId
            ) {
              setGymId(
                null
              );

              setMembers(
                []
              );

              setError(
                "Tvoj vlasnički račun još nije povezan s teretanom."
              );

              return;
            }


            const id =
              String(
                data.gymId
              );


            setGymId(
              id
            );


            await loadMembers(
              id
            );
          } catch (
            loadError
          ) {
            console.error(
              "Greška kod učitavanja teretane:",
              loadError
            );


            if (
              !cancelled
            ) {
              setError(
                "Podatke teretane trenutno nije moguće učitati."
              );
            }
          } finally {
            if (
              !cancelled
            ) {
              setPageLoading(
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
  }, []);


  async function addMember(
    email: string,
    role: GymRole
  ) {
    if (!gymId) {
      setError(
        "Teretana nije pronađena."
      );

      return;
    }


    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !cleanEmail
    ) {
      setError(
        "Upiši email adresu."
      );

      return;
    }


    if (
      !cleanEmail.includes(
        "@"
      )
    ) {
      setError(
        "Upiši ispravnu email adresu."
      );

      return;
    }


    try {
      setAddingRole(
        role
      );

      setError(
        ""
      );

      setSuccess(
        ""
      );


      await addGymMember({
        gymId,
        email:
          cleanEmail,
        role,
        addedBy:
          "owner",
      });


      await loadMembers(
        gymId
      );


      if (
        role ===
        "trainer"
      ) {
        setTrainerEmail(
          ""
        );

        setSuccess(
          "Trener je uspješno dodan u teretanu."
        );
      } else {
        setClientEmail(
          ""
        );

        setSuccess(
          "Klijent je uspješno dodan u teretanu."
        );
      }
    } catch (
      addError: any
    ) {
      console.error(
        "Greška kod dodavanja člana:",
        addError
      );


      setError(
        addError?.message ||
          "Člana trenutno nije moguće dodati."
      );
    } finally {
      setAddingRole(
        null
      );
    }
  }


  function submitTrainer(
    event: FormEvent
  ) {
    event.preventDefault();

    void addMember(
      trainerEmail,
      "trainer"
    );
  }


  function submitClient(
    event: FormEvent
  ) {
    event.preventDefault();

    void addMember(
      clientEmail,
      "client"
    );
  }


  async function submitStaff(
    event: FormEvent
  ) {
    event.preventDefault();


    if (!gymId) {
      setError(
        "Teretana nije pronađena."
      );

      return;
    }


    const cleanName =
      staffName.trim();

    const cleanEmail =
      staffEmail
        .trim()
        .toLowerCase();

    const cleanPhone =
      staffPhone.trim();


    if (!cleanName) {
      setError(
        "Upiši ime i prezime djelatnika."
      );

      return;
    }


    if (
      !cleanEmail ||
      !cleanEmail.includes("@")
    ) {
      setError(
        "Upiši ispravnu email adresu djelatnika."
      );

      return;
    }


    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      setError(
        "Moraš biti prijavljen."
      );

      return;
    }


    try {
      setAddingRole(
        "gym_staff"
      );

      setError("");
      setSuccess("");


      const token =
        await currentUser
          .getIdToken();


      const response =
        await fetch(
          "/api/gym/staff",
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
                name:
                  cleanName,

                email:
                  cleanEmail,

                phone:
                  cleanPhone,
              }),
          }
        );


      const data =
        await response
          .json()
          .catch(
            () => null
          );


      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Djelatnika trenutno nije moguće dodati."
        );
      }


      await loadMembers(
        gymId
      );


      setStaffName("");
      setStaffEmail("");
      setStaffPhone("");


      try {
        await sendPasswordResetEmail(
          auth,
          cleanEmail
        );


        setSuccess(
          "Djelatnik je uspješno dodan. Na njegov email poslana je poveznica za postavljanje lozinke."
        );
      } catch (
        emailError
      ) {
        console.error(
          "Djelatnik je kreiran, ali email za lozinku nije poslan:",
          emailError
        );


        setSuccess(
          "Djelatnik je uspješno dodan."
        );

        setError(
          "Račun je kreiran, ali email za postavljanje lozinke nije poslan."
        );
      }
    } catch (
      staffError: any
    ) {
      console.error(
        "Greška kod dodavanja djelatnika:",
        staffError
      );


      setError(
        staffError?.message ||
          "Djelatnika trenutno nije moguće dodati."
      );
    } finally {
      setAddingRole(
        null
      );
    }
  }


  return (
    <ProtectedRoute
      allowedRoles={[
        "gym_owner",
      ]}
    >
      <div className="space-y-8">

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
              bg-[#C8D52B]/15
              blur-3xl
            "
          />


          <div
            className="
              absolute
              -bottom-32
              left-1/3
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
              max-w-3xl
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
                py-2
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
                  tracking-[0.16em]
                  text-white/60
                "
              >
                Owner dashboard
              </span>
            </div>


            <h1
              className="
                mt-5
                text-3xl
                font-black
                tracking-tight
                text-white
                sm:text-5xl
              "
            >
              Moja teretana
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-white/55
                sm:text-base
              "
            >
              Upravljaj trenerima,
              klijentima i članstvom
              svoje teretane s jednog
              mjesta.
            </p>


            {gymId && (
              <div
                className="
                  mt-6
                  inline-flex
                  max-w-full
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-3
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
                    bg-[#C8D52B]
                    text-xs
                    font-black
                    text-[#111317]
                  "
                >
                  ID
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
                      text-white/35
                    "
                  >
                    ID teretane
                  </p>


                  <p
                    className="
                      mt-0.5
                      break-all
                      text-xs
                      font-semibold
                      text-white/75
                    "
                  >
                    {gymId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* LOADING */}

        {pageLoading && (
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
                    h-36
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


        {/* MESSAGES */}

        {!pageLoading &&
          error && (
            <MessageCard
              type="error"
              text={
                error
              }
            />
          )}


        {!pageLoading &&
          success && (
            <MessageCard
              type="success"
              text={
                success
              }
            />
          )}


        {!pageLoading &&
          gymId && (
            <>

              {/* STATISTICS */}

              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-3
                "
              >
                <StatCard
                  label="Treneri"
                  value={
                    trainers.length
                  }
                  accent="lime"
                  description="Treneri povezani s teretanom"
                />


                <StatCard
                  label="Klijenti"
                  value={
                    clients.length
                  }
                  accent="teal"
                  description="Klijenti unutar teretane"
                />


                <StatCard
                  label="Ukupno članova"
                  value={
                    members.length
                  }
                  accent="dark"
                  description="Treneri i klijenti zajedno"
                />
              </section>


              {/* QUICK LINKS */}

              <section>
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
                    Upravljanje
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
                    Brzi pregled
                  </h2>
                </div>


                <div
                  className="
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  <QuickLink
                    href="/dashboard/owner/trainers"
                    eyebrow="Tim"
                    title="Moji treneri"
                    description="Pregledaj trenere povezane s teretanom i otvori njihove profile."
                    accent="lime"
                  />


                  <QuickLink
                    href="/dashboard/owner/clients"
                    eyebrow="Članovi"
                    title="Moji klijenti"
                    description="Pregledaj klijente teretane, njihove profile i napredak."
                    accent="teal"
                  />
                </div>
              </section>


              {/* ADD MEMBER */}

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
                    Članstvo
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
                    Dodaj člana
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
                    Dodaj postojećeg
                    korisnika u svoju
                    teretanu koristeći
                    njegovu email adresu.
                  </p>
                </div>


                <div
                  className="
                    grid
                    gap-0
                    lg:grid-cols-2
                    xl:grid-cols-3
                  "
                >

                  {/* TRAINER */}

                  <form
                    onSubmit={
                      submitTrainer
                    }
                    className="
                      p-6
                      lg:border-r
                      lg:border-[#EEF0EC]
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
                          bg-[#C8D52B]/15
                          font-black
                          text-[#68720F]
                        "
                      >
                        T
                      </div>


                      <div>
                        <h3
                          className="
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          Dodaj trenera
                        </h3>


                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-[#667085]
                          "
                        >
                          Trener će biti
                          povezan s ovom
                          teretanom.
                        </p>
                      </div>
                    </div>


                    <div
                      className="
                        mt-5
                      "
                    >
                      <label
                        htmlFor="trainer-email"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-[#344054]
                        "
                      >
                        Email trenera
                      </label>


                      <input
                        id="trainer-email"
                        type="email"
                        autoComplete="email"
                        placeholder="trener@email.com"
                        value={
                          trainerEmail
                        }
                        onChange={(
                          event
                        ) =>
                          setTrainerEmail(
                            event.target.value
                          )
                        }
                        disabled={
                          addingRole !==
                          null
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
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#B2B8C2]
                          focus:border-[#C8D52B]
                          focus:ring-4
                          focus:ring-[#C8D52B]/10
                          disabled:bg-[#F6F7F3]
                        "
                      />
                    </div>


                    <button
                      type="submit"
                      disabled={
                        addingRole !==
                          null ||
                        !trainerEmail.trim()
                      }
                      className="
                        mt-4
                        inline-flex
                        min-h-12
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#111317]
                        px-5
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
                      {addingRole ===
                      "trainer"
                        ? "Dodavanje..."
                        : "Dodaj trenera"}


                      {addingRole !==
                        "trainer" && (
                        <span
                          className="
                            text-[#C8D52B]
                          "
                        >
                          →
                        </span>
                      )}
                    </button>
                  </form>


                  {/* CLIENT */}

                  <form
                    onSubmit={
                      submitClient
                    }
                    className="
                      border-t
                      border-[#EEF0EC]
                      p-6
                      lg:border-t-0
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
                          bg-[#16A6A1]/10
                          font-black
                          text-[#128D89]
                        "
                      >
                        K
                      </div>


                      <div>
                        <h3
                          className="
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          Dodaj klijenta
                        </h3>


                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-[#667085]
                          "
                        >
                          Klijent će biti
                          prikazan među
                          članovima teretane.
                        </p>
                      </div>
                    </div>


                    <div
                      className="
                        mt-5
                      "
                    >
                      <label
                        htmlFor="client-email"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-[#344054]
                        "
                      >
                        Email klijenta
                      </label>


                      <input
                        id="client-email"
                        type="email"
                        autoComplete="email"
                        placeholder="klijent@email.com"
                        value={
                          clientEmail
                        }
                        onChange={(
                          event
                        ) =>
                          setClientEmail(
                            event.target.value
                          )
                        }
                        disabled={
                          addingRole !==
                          null
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
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#B2B8C2]
                          focus:border-[#16A6A1]
                          focus:ring-4
                          focus:ring-[#16A6A1]/10
                          disabled:bg-[#F6F7F3]
                        "
                      />
                    </div>


                    <button
                      type="submit"
                      disabled={
                        addingRole !==
                          null ||
                        !clientEmail.trim()
                      }
                      className="
                        mt-4
                        inline-flex
                        min-h-12
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#16A6A1]
                        px-5
                        py-3
                        text-sm
                        font-black
                        text-white
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-[#128D89]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        disabled:hover:translate-y-0
                      "
                    >
                      {addingRole ===
                      "client"
                        ? "Dodavanje..."
                        : "Dodaj klijenta"}


                      {addingRole !==
                        "client" && (
                        <span>
                          →
                        </span>
                      )}
                    </button>
                  </form>
                  {/* STAFF */}

                  <form
                    onSubmit={
                      submitStaff
                    }
                    className="
                      border-t
                      border-[#EEF0EC]
                      p-6
                      lg:col-span-2
                      xl:col-span-1
                      xl:border-t-0
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
                          font-black
                          text-[#C8D52B]
                        "
                      >
                        R
                      </div>


                      <div>
                        <h3
                          className="
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          Dodaj djelatnika
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-[#667085]
                          "
                        >
                          Kreiraj račun za
                          recepciju ili
                          djelatnika teretane.
                        </p>
                      </div>
                    </div>


                    <div className="mt-5">
                      <label
                        htmlFor="staff-name"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-[#344054]
                        "
                      >
                        Ime i prezime
                      </label>

                      <input
                        id="staff-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Ivan Horvat"
                        value={
                          staffName
                        }
                        onChange={(
                          event
                        ) =>
                          setStaffName(
                            event.target.value
                          )
                        }
                        disabled={
                          addingRole !==
                          null
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
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#B2B8C2]
                          focus:border-[#C8D52B]
                          focus:ring-4
                          focus:ring-[#C8D52B]/10
                          disabled:bg-[#F6F7F3]
                        "
                      />
                    </div>


                    <div className="mt-4">
                      <label
                        htmlFor="staff-email"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-[#344054]
                        "
                      >
                        Email djelatnika
                      </label>

                      <input
                        id="staff-email"
                        type="email"
                        autoComplete="email"
                        placeholder="recepcija@email.com"
                        value={
                          staffEmail
                        }
                        onChange={(
                          event
                        ) =>
                          setStaffEmail(
                            event.target.value
                          )
                        }
                        disabled={
                          addingRole !==
                          null
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
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#B2B8C2]
                          focus:border-[#16A6A1]
                          focus:ring-4
                          focus:ring-[#16A6A1]/10
                          disabled:bg-[#F6F7F3]
                        "
                      />
                    </div>


                    <div className="mt-4">
                      <label
                        htmlFor="staff-phone"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-[#344054]
                        "
                      >
                        Telefon
                        <span className="ml-1 font-normal text-[#98A2B3]">
                          (opcionalno)
                        </span>
                      </label>

                      <input
                        id="staff-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+385..."
                        value={
                          staffPhone
                        }
                        onChange={(
                          event
                        ) =>
                          setStaffPhone(
                            event.target.value
                          )
                        }
                        disabled={
                          addingRole !==
                          null
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
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          placeholder:text-[#B2B8C2]
                          focus:border-[#16A6A1]
                          focus:ring-4
                          focus:ring-[#16A6A1]/10
                          disabled:bg-[#F6F7F3]
                        "
                      />
                    </div>


                    <div
                      className="
                        mt-4
                        rounded-xl
                        border
                        border-[#DDE4B2]
                        bg-[#F8FBE9]
                        p-3
                      "
                    >
                      <p
                        className="
                          text-[11px]
                          leading-5
                          text-[#667085]
                        "
                      >
                        Djelatnik će dobiti
                        vlastiti račun s ulogom
                        recepcije. Na email će
                        dobiti poveznicu za
                        postavljanje svoje lozinke.
                      </p>
                    </div>


                    <button
                      type="submit"
                      disabled={
                        addingRole !==
                          null ||
                        !staffName.trim() ||
                        !staffEmail.trim()
                      }
                      className="
                        mt-4
                        inline-flex
                        min-h-12
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#111317]
                        px-5
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
                      {addingRole ===
                      "gym_staff"
                        ? "Kreiranje..."
                        : "Dodaj djelatnika"}

                      {addingRole !==
                        "gym_staff" && (
                        <span
                          className="
                            text-[#C8D52B]
                          "
                        >
                          →
                        </span>
                      )}
                    </button>
                  </form>


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


              {/* MEMBER PREVIEW */}

              <section
                className="
                  grid
                  gap-6
                  xl:grid-cols-2
                "
              >
                <MemberList
                  title="Treneri"
                  description="Treneri povezani s teretanom"
                  members={
                    trainers
                  }
                  href="/dashboard/owner/trainers"
                  accent="lime"
                  emptyText="Još nema dodanih trenera."
                />


                <MemberList
                  title="Klijenti"
                  description="Klijenti povezani s teretanom"
                  members={
                    clients
                  }
                  href="/dashboard/owner/clients"
                  accent="teal"
                  emptyText="Još nema dodanih klijenata."
                />
              </section>

            </>
          )}

      </div>
    </ProtectedRoute>
  );
}


function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  accent:
    | "lime"
    | "teal"
    | "dark";
}) {
  const accentClasses = {
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
              text-xs
              font-bold
              text-[#667085]
            "
          >
            {label}
          </p>


          <p
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              text-[#15171A]
            "
          >
            {value}
          </p>
        </div>


        <div
          className={`
            flex
            h-11
            min-w-11
            items-center
            justify-center
            rounded-2xl
            px-3
            text-sm
            font-black
            ${accentClasses[accent]}
          `}
        >
          {value}
        </div>
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


function QuickLink({
  href,
  eyebrow,
  title,
  description,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent:
    | "lime"
    | "teal";
}) {
  const accentClass =
    accent === "lime"
      ? "bg-[#C8D52B] text-[#111317]"
      : "bg-[#16A6A1] text-white";


  return (
    <Link
      href={href}
      className="
        group
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-black/5
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
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#98A2B3]
            "
          >
            {eyebrow}
          </p>


          <h3
            className="
              mt-2
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
              max-w-md
              text-sm
              leading-6
              text-[#667085]
            "
          >
            {description}
          </p>
        </div>


        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            text-lg
            font-black
            transition-transform
            group-hover:translate-x-1
            ${accentClass}
          `}
        >
          →
        </div>
      </div>
    </Link>
  );
}


function MemberList({
  title,
  description,
  members,
  href,
  accent,
  emptyText,
}: {
  title: string;
  description: string;
  members: GymMember[];
  href: string;
  accent:
    | "lime"
    | "teal";
  emptyText: string;
}) {
  return (
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
          justify-between
          gap-4
          border-b
          border-[#EEF0EC]
          p-6
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-black
              text-[#15171A]
            "
          >
            {title}
          </h2>


          <p
            className="
              mt-1
              text-xs
              text-[#667085]
            "
          >
            {description}
          </p>
        </div>


        <div
          className={`
            rounded-full
            px-3
            py-1.5
            text-xs
            font-black
            ${
              accent ===
              "lime"
                ? "bg-[#C8D52B]/15 text-[#68720F]"
                : "bg-[#16A6A1]/10 text-[#128D89]"
            }
          `}
        >
          {members.length}
        </div>
      </div>


      <div
        className="
          p-3
        "
      >
        {members.length ===
        0 ? (
          <div
            className="
              px-4
              py-10
              text-center
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-[#98A2B3]
              "
            >
              {emptyText}
            </p>
          </div>
        ) : (
          members
            .slice(0, 5)
            .map(
              (
                member
              ) => (
                <MemberRow
                  key={
                    member.uid
                  }
                  member={
                    member
                  }
                  accent={
                    accent
                  }
                />
              )
            )
        )}
      </div>


      <div
        className="
          border-t
          border-[#EEF0EC]
          p-4
        "
      >
        <Link
          href={href}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#F4F6F2]
            px-4
            py-3
            text-sm
            font-black
            text-[#15171A]
            transition
            hover:bg-[#ECEFE8]
          "
        >
          Prikaži sve

          <span
            className="
              text-[#16A6A1]
            "
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}


function MemberRow({
  member,
  accent,
}: {
  member: GymMember;
  accent:
    | "lime"
    | "teal";
}) {
  const name =
    member.name ||
    member.displayName ||
    member.email ||
    "Korisnik";


  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        px-3
        py-3
        transition
        hover:bg-[#F6F7F3]
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          text-xs
          font-black
          ${
            accent ===
            "lime"
              ? "bg-[#C8D52B]/15 text-[#68720F]"
              : "bg-[#16A6A1]/10 text-[#128D89]"
          }
        `}
      >
        {getInitials(
          name
        )}
      </div>


      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            truncate
            text-sm
            font-black
            text-[#15171A]
          "
        >
          {name}
        </p>


        <p
          className="
            mt-0.5
            truncate
            text-xs
            text-[#98A2B3]
          "
        >
          {member.email ||
            "Email nije dostupan"}
        </p>
      </div>
    </div>
  );
}


function MessageCard({
  type,
  text,
}: {
  type:
    | "error"
    | "success";
  text: string;
}) {
  const isError =
    type === "error";


  return (
    <div
      className={`
        flex
        items-start
        gap-4
        rounded-2xl
        border
        p-5
        ${
          isError
            ? "border-red-200 bg-red-50"
            : "border-[#C8D52B]/30 bg-[#C8D52B]/10"
        }
      `}
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
          bg-white
          font-black
          ${
            isError
              ? "text-red-600"
              : "text-[#68720F]"
          }
        `}
      >
        {isError
          ? "!"
          : "✓"}
      </div>


      <div>
        <p
          className={`
            text-sm
            font-black
            ${
              isError
                ? "text-red-800"
                : "text-[#4F570C]"
            }
          `}
        >
          {isError
            ? "Došlo je do problema"
            : "Uspješno"}
        </p>


        <p
          className={`
            mt-1
            text-xs
            leading-5
            ${
              isError
                ? "text-red-700"
                : "text-[#68720F]"
            }
          `}
        >
          {text}
        </p>
      </div>
    </div>
  );
}


function getInitials(
  value: string
) {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase() || "K";
}




