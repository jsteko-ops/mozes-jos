"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  useRouter,
} from "next/navigation";

import {
  auth,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  redirectByRole,
} from "@/lib/auth/redirectByRole";


export default function LoginPage() {
  const {
    user,
    userProfile,
    loading,
  } = useAuth();


  const router =
    useRouter();


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
    loginLoading,
    setLoginLoading,
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


  useEffect(() => {
    if (
      !loading &&
      user &&
      userProfile
    ) {
      redirectByRole(
        userProfile,
        router
      );
    }
  }, [
    user,
    userProfile,
    loading,
    router,
  ]);


  async function login() {
    const normalizedEmail =
      email.trim();


    if (!normalizedEmail) {
      setError(
        "Upiši e-mail adresu."
      );

      return;
    }


    if (!password) {
      setError(
        "Upiši lozinku."
      );

      return;
    }


    try {
      setLoginLoading(
        true
      );

      setError(
        ""
      );


      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
    } catch (
      loginError: any
    ) {
      console.error(
        "Login error:",
        loginError
      );


      switch (
        loginError.code
      ) {
        case "auth/invalid-email":
          setError(
            "Neispravna e-mail adresa."
          );
          break;

        case "auth/user-not-found":
          setError(
            "Korisnik s ovom e-mail adresom ne postoji."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Pogrešna lozinka."
          );
          break;

        case "auth/invalid-credential":
          setError(
            "Neispravan e-mail ili lozinka."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Previše neuspjelih pokušaja. Pokušaj ponovno kasnije."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Provjeri internetsku vezu i pokušaj ponovno."
          );
          break;

        default:
          setError(
            "Prijava trenutno nije moguća. Pokušaj ponovno."
          );
      }
    } finally {
      setLoginLoading(
        false
      );
    }
  }


  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F4F6F2]
          px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
            px-5
            py-4
            shadow-sm
          "
        >
          <div
            className="
              h-3
              w-3
              animate-pulse
              rounded-full
              bg-[#C8D52B]
            "
          />

          <p
            className="
              text-sm
              font-bold
              text-[#667085]
            "
          >
            Učitavanje...
          </p>
        </div>
      </div>
    );
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
          lg:grid-cols-[1.05fr_0.95fr]
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
              Fitness platforma
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
              Tvoj rad.
              <br />
              Tvoji klijenti.
              <br />
              Jedno mjesto.
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
              Upravljaj treninzima,
              mjerenjima, check-inovima,
              prehranom i komunikacijom
              bez nepotrebnog kaosa.
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
              title="Klijenti"
            />

            <HeroStat
              code="02"
              title="Napredak"
            />

            <HeroStat
              code="03"
              title="Rezultati"
            />
          </div>
        </section>


        {/* LOGIN */}

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
              max-w-md
            "
          >

            {/* MOBILE BRAND */}

            <div
              className="
                mb-10
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
              Dobrodošao natrag
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
              Prijava
            </h2>


            <p
              className="
                mt-3
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Prijavi se u svoj
              Možeš Još račun i nastavi
              tamo gdje si stao.
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

                void login();
              }}
              className="
                mt-8
                space-y-5
              "
            >

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
                    loginLoading
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
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
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


                  <Link
                    href="/auth"
                    className="
                      text-xs
                      font-bold
                      text-[#16A6A1]
                      transition
                      hover:text-[#0D7773]
                    "
                  >
                    Zaboravljena lozinka?
                  </Link>
                </div>


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
                    autoComplete="current-password"
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
                    placeholder="Upiši lozinku"
                    disabled={
                      loginLoading
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
              </div>


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
                  loginLoading
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
                {loginLoading && (
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


                {loginLoading
                  ? "Prijava..."
                  : "Prijavi se"}
              </button>
            </form>


            {/* REGISTER */}

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
                Nemaš račun?{" "}
                <Link
                  href="/signup"
                  className="
                    font-black
                    text-[#15171A]
                    transition
                    hover:text-[#16A6A1]
                  "
                >
                  Registriraj se
                </Link>
              </p>
            </div>


            <p
              className="
                mt-8
                text-center
                text-[10px]
                leading-5
                text-[#98A2B3]
              "
            >
              Možeš Još · Trening,
              napredak i komunikacija
              na jednom mjestu.
            </p>

          </div>
        </section>

      </div>
    </main>
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