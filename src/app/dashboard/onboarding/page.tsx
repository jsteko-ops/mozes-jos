"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type UsageChoice =
  | "personal"
  | "business"
  | null;


export default function OnboardingPage() {
  const router =
    useRouter();


  const [
    step,
    setStep,
  ] =
    useState(1);


  const [
    usage,
    setUsage,
  ] =
    useState<UsageChoice>(
      null
    );


  const [
    goal,
    setGoal,
  ] =
    useState("");


  function chooseUsage(
    choice:
      | "personal"
      | "business"
  ) {
    setUsage(
      choice
    );

    setStep(
      2
    );
  }


  function finish() {
    router.push(
      "/dashboard"
    );
  }


  return (
    <div
      className="
        flex
        min-h-[calc(100vh-110px)]
        items-center
        justify-center
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-4xl
        "
      >

        {/* TOP */}

        <div
          className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#16A6A1]
              "
            >
              Dobrodošao
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
              Možeš Još
            </h1>
          </div>


          <div
            className="
              rounded-full
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-2
              text-xs
              font-black
              text-[#667085]
              shadow-sm
            "
          >
            Korak {step} / 2
          </div>
        </div>


        {/* PROGRESS */}

        <div
          className="
            mb-6
            h-2
            overflow-hidden
            rounded-full
            bg-[#E9ECE5]
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#C8D52B]
              to-[#16A6A1]
              transition-all
              duration-500
            "
            style={{
              width:
                step === 1
                  ? "50%"
                  : "100%",
            }}
          />
        </div>


        {/* CARD */}

        <section
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-[#E5E7EB]
            bg-white
            shadow-xl
            shadow-black/5
          "
        >

          {/* HERO */}

          <div
            className="
              relative
              overflow-hidden
              bg-[#111317]
              px-6
              py-8
              text-white
              sm:px-9
              sm:py-10
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
                max-w-2xl
              "
            >
              <div
                className="
                  mb-5
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#C8D52B]
                  text-xl
                  font-black
                  text-[#111317]
                "
              >
                MJ
              </div>


              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#C8D52B]
                "
              >
                Početno postavljanje
              </p>


              <h2
                className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                {step === 1
                  ? "Kako ćeš koristiti aplikaciju?"
                  : "Što želiš postići?"}
              </h2>


              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/50
                "
              >
                {step === 1
                  ? "Odaberi opciju koja najbolje opisuje način na koji planiraš koristiti Možeš Još."
                  : "Dodaj svoj glavni cilj. Ovaj korak zasad služi za početno postavljanje profila."}
              </p>
            </div>
          </div>


          {/* STEP 1 */}

          {step === 1 && (
            <div
              className="
                grid
                gap-5
                p-6
                sm:p-9
                md:grid-cols-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  chooseUsage(
                    "personal"
                  )
                }
                className="
                  group
                  rounded-[24px]
                  border
                  border-[#E5E7EB]
                  bg-[#F7F8F5]
                  p-6
                  text-left
                  transition
                  hover:-translate-y-1
                  hover:border-[#C8D52B]
                  hover:bg-white
                  hover:shadow-xl
                  hover:shadow-black/5
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
                    bg-[#C8D52B]/15
                    text-sm
                    font-black
                    text-[#68720F]
                    transition
                    group-hover:bg-[#C8D52B]
                    group-hover:text-[#111317]
                  "
                >
                  JA
                </div>


                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    text-[#15171A]
                  "
                >
                  Osobni napredak
                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#667085]
                  "
                >
                  Želim pratiti svoje
                  treninge, mjerenja,
                  prehranu i napredak.
                </p>


                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    border-t
                    border-[#E5E7EB]
                    pt-4
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-[#15171A]
                    "
                  >
                    Odaberi
                  </span>


                  <span
                    className="
                      text-lg
                      font-black
                      text-[#16A6A1]
                    "
                  >
                    →
                  </span>
                </div>
              </button>


              <button
                type="button"
                onClick={() =>
                  chooseUsage(
                    "business"
                  )
                }
                className="
                  group
                  rounded-[24px]
                  border
                  border-[#E5E7EB]
                  bg-[#F7F8F5]
                  p-6
                  text-left
                  transition
                  hover:-translate-y-1
                  hover:border-[#16A6A1]
                  hover:bg-white
                  hover:shadow-xl
                  hover:shadow-black/5
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
                    bg-[#16A6A1]/10
                    text-sm
                    font-black
                    text-[#0D7773]
                    transition
                    group-hover:bg-[#16A6A1]
                    group-hover:text-white
                  "
                >
                  PRO
                </div>


                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    text-[#15171A]
                  "
                >
                  Trener i klijenti
                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#667085]
                  "
                >
                  Želim voditi klijente,
                  planove treninga,
                  mjerenja i komunikaciju.
                </p>


                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    border-t
                    border-[#E5E7EB]
                    pt-4
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-[#15171A]
                    "
                  >
                    Odaberi
                  </span>


                  <span
                    className="
                      text-lg
                      font-black
                      text-[#16A6A1]
                    "
                  >
                    →
                  </span>
                </div>
              </button>
            </div>
          )}


          {/* STEP 2 */}

          {step === 2 && (
            <div
              className="
                p-6
                sm:p-9
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  bg-[#F7F8F5]
                  px-4
                  py-3
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
                    bg-[#111317]
                    text-[10px]
                    font-black
                    text-[#C8D52B]
                  "
                >
                  {usage ===
                  "business"
                    ? "PRO"
                    : "JA"}
                </div>


                <div>
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#98A2B3]
                    "
                  >
                    Odabrano
                  </p>


                  <p
                    className="
                      text-sm
                      font-black
                      text-[#15171A]
                    "
                  >
                    {usage ===
                    "business"
                      ? "Trener i klijenti"
                      : "Osobni napredak"}
                  </p>
                </div>
              </div>


              <label
                className="
                  block
                  text-sm
                  font-black
                  text-[#15171A]
                "
              >
                Moj glavni cilj
              </label>


              <textarea
                value={
                  goal
                }
                onChange={(
                  event
                ) =>
                  setGoal(
                    event.target
                      .value
                  )
                }
                rows={5}
                placeholder="Primjer: želim poboljšati kondiciju, povećati snagu ili kvalitetnije pratiti svoje klijente..."
                className="
                  mt-3
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-4
                  py-4
                  text-sm
                  leading-6
                  text-[#15171A]
                  outline-none
                  transition
                  placeholder:text-[#98A2B3]
                  focus:border-[#16A6A1]
                  focus:ring-4
                  focus:ring-[#16A6A1]/10
                "
              />


              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-[#98A2B3]
                "
              >
                Polje nije obavezno.
                Cilj ćemo kasnije moći
                povezati s profilom i
                personalizacijom.
              </p>


              <div
                className="
                  mt-8
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-between
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setStep(
                      1
                    )
                  }
                  className="
                    rounded-xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-[#667085]
                    transition
                    hover:bg-[#F4F6F2]
                    hover:text-[#15171A]
                  "
                >
                  ← Natrag
                </button>


                <button
                  type="button"
                  onClick={
                    finish
                  }
                  className="
                    rounded-xl
                    bg-[#C8D52B]
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-[#111317]
                    transition
                    hover:bg-[#D7E33A]
                  "
                >
                  Završi postavljanje →
                </button>
              </div>
            </div>
          )}

        </section>


        <p
          className="
            mt-5
            text-center
            text-xs
            leading-5
            text-[#98A2B3]
          "
        >
          Postavke ćeš kasnije moći
          mijenjati unutar svog profila.
        </p>

      </div>
    </div>
  );
}