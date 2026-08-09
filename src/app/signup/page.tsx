"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  registerUser,
} from "@/lib/registerUser";


type UserRole =
  | "client"
  | "trainer"
  | "gym_owner";


export default function SignupPage() {
  const router =
    useRouter();


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    role,
    setRole,
  ] =
    useState<UserRole>(
      "client"
    );


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  async function signup() {
    const normalizedName =
      name.trim();

    const normalizedEmail =
      email.trim();


    if (!normalizedName) {
      setError(
        "Unesi ime i prezime."
      );

      return;
    }


    if (!normalizedEmail) {
      setError(
        "Unesi e-mail adresu."
      );

      return;
    }


    if (
      password.length <
      6
    ) {
      setError(
        "Lozinka mora imati najmanje 6 znakova."
      );

      return;
    }


    try {
      setLoading(
        true
      );

      setError(
        ""
      );


      await registerUser({
        name:
          normalizedName,

        email:
          normalizedEmail,

        password,

        role,
      });


      router.replace(
        "/dashboard"
      );
    } catch (
      signupError: any
    ) {
      console.error(
        "Signup error:",
        signupError
      );


      switch (
        signupError.code
      ) {
        case "auth/email-already-in-use":
          setError(
            "Ovaj e-mail je već registriran."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Neispravna e-mail adresa."
          );
          break;

        case "auth/weak-password":
          setError(
            "Lozinka je preslaba. Odaberi sigurniju lozinku."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Provjeri internetsku vezu i pokušaj ponovno."
          );
          break;

        default:
          setError(
            "Registracija trenutno nije moguća. Pokušaj ponovno."
          );
      }
    } finally {
      setLoading(
        false
      );
    }
  }


  return (
    <main
      className="
        min-h-screen
        bg-[#F4F6F2]
        p-4
        sm:p-6
        lg:p-8
      "
    >
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-32px)]
          w-full
          max-w-6xl
          overflow-hidden
          rounded-[32px]
          border
          border-[#E5E7EB]
          bg-white
          shadow-2xl
          shadow-black/10
          sm:min-h-[calc(100vh-48px)]
          lg:grid-cols-[0.95fr_1.05fr]
        "
      >

        {/* LEFT HERO */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-[#111317]
            p-10
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
          "
        >
          <div
            className="
              absolute
              -right-28
              -top-28
              h-80
              w-80
              rounded-full
              bg-[#C8D52B]/15
              blur-3xl
            "
          />


          <div
            className="
              absolute
              -bottom-32
              -left-16
              h-80
              w-80
              rounded-full
              bg-[#16A6A1]/15
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
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]
                text-lg
                font-black
                text-[#111317]
              "
            >
              MJ
            </div>


            <p
              className="
                mt-10
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#C8D52B]
              "
            >
              Možeš Još
            </p>


            <h1
              className="
                mt-3
                max-w-xl
                text-5xl
                font-black
                leading-[1.05]
                tracking-tight
                text-white
              "
            >
              Kreni danas.
              <br />
              Napreduj svaki
              <br />
              sljedeći dan.
            </h1>


            <p
              className="
                mt-6
                max-w-lg
                text-sm
                leading-7
                text-white/50
              "
            >
              Jedna platforma za
              klijente, trenere i
              teretane — trening,
              mjerenja, prehrana,
              komunikacija i napredak
              na jednom mjestu.
            </p>
          </div>


          <div
            className="
              relative
              z-10
              grid
              grid-cols-3
              gap-3
            "
          >
            <HeroStat
              code="01"
              title="Trening"
            />

            <HeroStat
              code="02"
              title="Praćenje"
            />

            <HeroStat
              code="03"
              title="Napredak"
            />
          </div>
        </section>


        {/* REGISTER */}

        <section
          className="
            flex
            items-center
            justify-center
            px-5
            py-10
            sm:px-10
            lg:px-14
          "
        >
          <div
            className="
              w-full
              max-w-lg
            "
          >

            {/* MOBILE BRAND */}

            <div
              className="
                mb-9
                flex
                items-center
                gap-3
                lg:hidden
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#111317]
                  text-sm
                  font-black
                  text-[#C8D52B]
                "
              >
                MJ
              </div>


              <div>
                <p
                  className="
                    text-lg
                    font-black
                    text-[#15171A]
                  "
                >
                  Možeš Još
                </p>


                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[#98A2B3]
                  "
                >
                  Fitness platforma
                </p>
              </div>
            </div>


            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#16A6A1]
              "
            >
              Novi račun
            </p>


            <h2
              className="
                mt-2
                text-4xl
                font-black
                tracking-tight
                text-[#15171A]
              "
            >
              Registracija
            </h2>


            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Kreiraj svoj račun i
              odaberi način na koji ćeš
              koristiti Možeš Još.
            </p>


            <div
              className="
                mt-5
                h-1
                w-16
                rounded-full
                bg-gradient-to-r
                from-[#C8D52B]
                to-[#16A6A1]
              "
            />


            <form
              onSubmit={(
                event
              ) => {
                event.preventDefault();

                void signup();
              }}
              className="
                mt-8
                space-y-5
              "
            >

              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="
                    text-sm
                    font-black
                    text-[#344054]
                  "
                >
                  Ime i prezime
                </label>


                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(
                    event
                  ) => {
                    setName(
                      event.target
                        .value
                    );

                    if (error) {
                      setError(
                        ""
                      );
                    }
                  }}
                  placeholder="Ime i prezime"
                  disabled={
                    loading
                  }
                  className="
                    mt-2
                    w-full
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    text-[#15171A]
                    outline-none
                    transition
                    placeholder:text-[#98A2B3]
                    focus:border-[#16A6A1]
                    focus:ring-4
                    focus:ring-[#16A6A1]/10
                    disabled:cursor-not-allowed
                    disabled:bg-[#F4F6F2]
                    disabled:opacity-70
                  "
                />
              </div>


              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="
                    text-sm
                    font-black
                    text-[#344054]
                  "
                >
                  E-mail adresa
                </label>


                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(
                    event
                  ) => {
                    setEmail(
                      event.target
                        .value
                    );

                    if (error) {
                      setError(
                        ""
                      );
                    }
                  }}
                  placeholder="ime@primjer.hr"
                  disabled={
                    loading
                  }
                  className="
                    mt-2
                    w-full
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    text-[#15171A]
                    outline-none
                    transition
                    placeholder:text-[#98A2B3]
                    focus:border-[#16A6A1]
                    focus:ring-4
                    focus:ring-[#16A6A1]/10
                    disabled:cursor-not-allowed
                    disabled:bg-[#F4F6F2]
                    disabled:opacity-70
                  "
                />
              </div>


              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="
                    text-sm
                    font-black
                    text-[#344054]
                  "
                >
                  Lozinka
                </label>


                <div
                  className="
                    relative
                    mt-2
                  "
                >
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(
                      event
                    ) => {
                      setPassword(
                        event.target
                          .value
                      );

                      if (error) {
                        setError(
                          ""
                        );
                      }
                    }}
                    placeholder="Najmanje 6 znakova"
                    disabled={
                      loading
                    }
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      py-3.5
                      pl-4
                      pr-20
                      text-sm
                      font-semibold
                      text-[#15171A]
                      outline-none
                      transition
                      placeholder:text-[#98A2B3]
                      focus:border-[#16A6A1]
                      focus:ring-4
                      focus:ring-[#16A6A1]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#F4F6F2]
                      disabled:opacity-70
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      px-2
                      py-1.5
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-[#667085]
                      transition
                      hover:bg-[#F4F6F2]
                      hover:text-[#15171A]
                    "
                  >
                    {showPassword
                      ? "Sakrij"
                      : "Prikaži"}
                  </button>
                </div>


                <p
                  className="
                    mt-2
                    text-[11px]
                    text-[#98A2B3]
                  "
                >
                  Lozinka mora imati
                  najmanje 6 znakova.
                </p>
              </div>


              {/* ROLE */}

              <fieldset>
                <legend
                  className="
                    text-sm
                    font-black
                    text-[#344054]
                  "
                >
                  Kako ćeš koristiti
                  Možeš Još?
                </legend>


                <div
                  className="
                    mt-3
                    grid
                    gap-3
                    sm:grid-cols-3
                  "
                >
                  <RoleOption
                    selected={
                      role ===
                      "client"
                    }
                    title="Klijent"
                    description="Pratim svoj napredak"
                    code="K"
                    onClick={() =>
                      setRole(
                        "client"
                      )
                    }
                  />


                  <RoleOption
                    selected={
                      role ===
                      "trainer"
                    }
                    title="Trener"
                    description="Vodim svoje klijente"
                    code="T"
                    onClick={() =>
                      setRole(
                        "trainer"
                      )
                    }
                  />


                  <RoleOption
                    selected={
                      role ===
                      "gym_owner"
                    }
                    title="Teretana"
                    description="Vodim tim i članove"
                    code="G"
                    onClick={() =>
                      setRole(
                        "gym_owner"
                      )
                    }
                  />
                </div>
              </fieldset>


              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-xs
                        font-black
                        text-red-600
                      "
                    >
                      !
                    </div>


                    <p
                      className="
                        pt-1
                        text-sm
                        font-semibold
                        leading-5
                        text-red-700
                      "
                    >
                      {error}
                    </p>
                  </div>
                </div>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-[#C8D52B]
                  px-5
                  py-4
                  text-sm
                  font-black
                  text-[#111317]
                  transition
                  hover:bg-[#D7E33A]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading && (
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-[#111317]/20
                      border-t-[#111317]
                    "
                  />
                )}


                {loading
                  ? "Registracija..."
                  : "Kreiraj račun"}
              </button>
            </form>


            {/* LOGIN */}

            <div
              className="
                mt-8
                border-t
                border-[#EEF0EC]
                pt-6
                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-[#667085]
                "
              >
                Već imaš račun?{" "}
                <Link
                  href="/login"
                  className="
                    font-black
                    text-[#15171A]
                    transition
                    hover:text-[#16A6A1]
                  "
                >
                  Prijavi se
                </Link>
              </p>
            </div>


            <p
              className="
                mt-7
                text-center
                text-[10px]
                leading-5
                text-[#98A2B3]
              "
            >
              Kreiranjem računa dobivaš
              pristup funkcijama koje
              odgovaraju odabranoj ulozi.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}


function RoleOption({
  selected,
  title,
  description,
  code,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  code: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        ${
          selected
            ? "border-[#C8D52B] bg-[#C8D52B]/10 shadow-sm"
            : "border-[#E5E7EB] bg-white hover:border-[#16A6A1]/50 hover:bg-[#F8F9F6]"
        }
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          text-xs
          font-black
          ${
            selected
              ? "bg-[#C8D52B] text-[#111317]"
              : "bg-[#111317] text-[#C8D52B]"
          }
        `}
      >
        {code}
      </div>


      <p
        className="
          mt-3
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
          text-[10px]
          leading-4
          text-[#667085]
        "
      >
        {description}
      </p>


      <div
        className="
          mt-3
          flex
          items-center
          gap-2
        "
      >
        <span
          className={`
            h-2
            w-2
            rounded-full
            ${
              selected
                ? "bg-[#16A6A1]"
                : "bg-[#D0D5DD]"
            }
          `}
        />


        <span
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            text-[#98A2B3]
          "
        >
          {selected
            ? "Odabrano"
            : "Odaberi"}
        </span>
      </div>
    </button>
  );
}


function HeroStat({
  code,
  title,
}: {
  code: string;
  title: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-wider
          text-[#C8D52B]
        "
      >
        {code}
      </p>


      <p
        className="
          mt-2
          text-sm
          font-black
          text-white
        "
      >
        {title}
      </p>
    </div>
  );
}