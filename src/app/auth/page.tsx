"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";


export default function AuthPage() {
  const [
    email,
    setEmail,
  ] =
    useState("");


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
    success,
    setSuccess,
  ] =
    useState(false);


  async function resetPassword() {
    const normalizedEmail =
      email.trim();


    if (!normalizedEmail) {
      setError(
        "Upiši e-mail adresu."
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

      setSuccess(
        false
      );


      await sendPasswordResetEmail(
        auth,
        normalizedEmail
      );


      setSuccess(
        true
      );
    } catch (
      resetError: any
    ) {
      console.error(
        "Password reset error:",
        resetError
      );


      switch (
        resetError.code
      ) {
        case "auth/invalid-email":
          setError(
            "Neispravna e-mail adresa."
          );
          break;

        case "auth/user-not-found":
          /*
           * Firebase ovisno o postavkama
           * zaštite privatnosti može
           * vratiti ili sakriti ovu
           * informaciju.
           */
          setSuccess(
            true
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Previše zahtjeva. Pokušaj ponovno kasnije."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Provjeri internetsku vezu i pokušaj ponovno."
          );
          break;

        default:
          setError(
            "Zahtjev trenutno nije moguće poslati. Pokušaj ponovno."
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
              Povratak računu
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
              Zaboravljena
              <br />
              lozinka nije
              <br />
              kraj treninga.
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
              Upiši e-mail adresu
              svog računa i poslat
              ćemo ti Firebase
              poveznicu za postavljanje
              nove lozinke.
            </p>
          </div>


          <div
            className="
              relative
              z-10
              rounded-[24px]
              border
              border-white/10
              bg-white/[0.04]
              p-5
            "
          >
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-[#C8D52B]
              "
            >
              Sigurnost računa
            </p>


            <p
              className="
                mt-2
                text-sm
                font-semibold
                leading-6
                text-white/60
              "
            >
              Nova lozinka postavlja
              se putem službenog
              Firebase postupka za
              oporavak računa.
            </p>
          </div>
        </section>


        {/* RESET FORM */}

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


            <Link
              href="/login"
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

              Natrag na prijavu
            </Link>


            <p
              className="
                mt-8
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#16A6A1]
              "
            >
              Oporavak računa
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
              Nova lozinka
            </h2>


            <p
              className="
                mt-3
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Upiši e-mail adresu
              povezanu s računom.
              Poslat ćemo ti poveznicu
              za promjenu lozinke.
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


            {!success ? (
              <form
                onSubmit={(
                  event
                ) => {
                  event.preventDefault();

                  void resetPassword();
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
                    ? "Šaljem..."
                    : "Pošalji poveznicu"}
                </button>
              </form>
            ) : (
              <div
                className="
                  mt-8
                  rounded-[26px]
                  border
                  border-[#C8D52B]/40
                  bg-[#C8D52B]/10
                  p-6
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
                    bg-[#C8D52B]
                    text-lg
                    font-black
                    text-[#111317]
                  "
                >
                  ✓
                </div>


                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    text-[#15171A]
                  "
                >
                  Provjeri e-mail
                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#667085]
                  "
                >
                  Ako postoji račun
                  povezan s adresom{" "}
                  <strong
                    className="
                      text-[#344054]
                    "
                  >
                    {email.trim()}
                  </strong>
                  , poslana je poveznica
                  za promjenu lozinke.
                </p>


                <p
                  className="
                    mt-3
                    text-xs
                    leading-5
                    text-[#98A2B3]
                  "
                >
                  Ako poruka ne stigne
                  odmah, provjeri mapu
                  neželjene pošte.
                </p>


                <div
                  className="
                    mt-6
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                  "
                >
                  <Link
                    href="/login"
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#111317]
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-white
                      transition
                      hover:bg-[#24272B]
                    "
                  >
                    Natrag na prijavu
                  </Link>


                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(
                        false
                      );

                      setError(
                        ""
                      );
                    }}
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-[#667085]
                      transition
                      hover:bg-[#F4F6F2]
                      hover:text-[#15171A]
                    "
                  >
                    Pošalji ponovno
                  </button>
                </div>
              </div>
            )}


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
                Sjetio si se lozinke?{" "}
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

          </div>
        </section>

      </div>
    </main>
  );
}