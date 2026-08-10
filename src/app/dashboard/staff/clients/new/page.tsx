"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";


type Gender =
  | "male"
  | "female"
  | "prefer_not_to_say";

type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer";

type MembershipDuration =
  | "1"
  | "3"
  | "6"
  | "12";


export default function NewStaffClientPage() {
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
    phone,
    setPhone,
  ] =
    useState("");


  const [
    gender,
    setGender,
  ] =
    useState<Gender>(
      "prefer_not_to_say"
    );


  const [
    trainerId,
    setTrainerId,
  ] =
    useState("");


  const [
    hasInitialPayment,
    setHasInitialPayment,
  ] =
    useState(true);


  const [
    membershipStart,
    setMembershipStart,
  ] =
    useState(
      getToday()
    );


  const [
    membershipDuration,
    setMembershipDuration,
  ] =
    useState<MembershipDuration>(
      "1"
    );


  const [
    amount,
    setAmount,
  ] =
    useState("");


  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "cash"
    );


  const [
    note,
    setNote,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    info,
    setInfo,
  ] =
    useState("");


  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setInfo("");


    if (!name.trim()) {
      setError(
        "Upiši ime i prezime člana."
      );

      return;
    }


    if (
      email.trim() &&
      !email.includes("@")
    ) {
      setError(
        "Upiši ispravnu email adresu."
      );

      return;
    }


    if (
      hasInitialPayment &&
      (
        !amount.trim() ||
        Number(amount) <= 0
      )
    ) {
      setError(
        "Upiši iznos prve članarine."
      );

      return;
    }


    /*
     * Spremanje ćemo spojiti na
     * zaštićeni serverski API.
     *
     * Namjerno još ne zapisujemo
     * direktno u Firestore iz
     * preglednika.
     */
    setInfo(
      "Forma je spremna. Sljedeći korak je sigurno serversko spremanje člana i članarine."
    );
  }


  return (
    <RoleGuard
      allowedRoles={[
        "gym_staff",
      ]}
    >
      <div
        className="
          mx-auto
          max-w-5xl
          space-y-6
        "
      >

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
              Recepcija
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
              Novi član
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
              Upiši člana teretane.
              Član može vježbati
              samostalno ili mu se
              trener može dodijeliti
              naknadno.
            </p>
          </div>


          <Link
            href="/dashboard/staff/clients"
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-2
              text-sm
              font-bold
              text-[#344054]
              transition
              hover:border-[#16A6A1]
            "
          >
            ← Natrag na članove
          </Link>
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


        {/* INTRO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#111317]
            p-6
            text-white
            sm:p-7
          "
        >
          <div
            className="
              absolute
              -right-20
              -top-20
              h-56
              w-56
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
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#C8D52B]
              "
            >
              Upis člana
            </p>

            <h2
              className="
                mt-2
                text-xl
                font-black
                sm:text-2xl
              "
            >
              Račun u aplikaciji nije
              uvjet za evidenciju člana.
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-white/55
              "
            >
              Člana možemo evidentirati
              i bez osobnog trenera.
              Pristup aplikaciji i dodatne
              funkcije možemo povezati
              naknadno.
            </p>
          </div>
        </section>


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* BASIC DATA */}

          <section
            className="
              rounded-[26px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
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
                Osnovni podaci
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Podaci člana
              </h2>
            </div>


            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <Field
                label="Ime i prezime"
                required
              >
                <input
                  type="text"
                  value={name}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ivan Horvat"
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field
                label="Telefon"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+385..."
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field
                label="Email"
                helper="Može ostati prazan ako član još nema korisnički račun."
              >
                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="clan@email.com"
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field
                label="Spol"
              >
                <select
                  value={gender}
                  onChange={(
                    event
                  ) =>
                    setGender(
                      event.target.value as Gender
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="male">
                    Muški
                  </option>

                  <option value="female">
                    Ženski
                  </option>

                  <option value="prefer_not_to_say">
                    Ne želi se izjasniti
                  </option>
                </select>
              </Field>
            </div>
          </section>


          {/* TRAINER */}

          <section
            className="
              rounded-[26px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#C8D52B]
                "
              >
                Trener
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Dodjela trenera
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#667085]
                "
              >
                Trener nije obavezan.
                Samostalni član može se
                treneru dodijeliti bilo
                kada kasnije.
              </p>
            </div>


            <div
              className="
                mt-6
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-[#F7F8F5]
                p-4
              "
            >
              <label
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                "
              >
                <input
                  type="radio"
                  name="trainer"
                  checked={
                    trainerId === ""
                  }
                  onChange={() =>
                    setTrainerId("")
                  }
                  className="
                    mt-1
                    accent-[#16A6A1]
                  "
                />

                <span>
                  <span
                    className="
                      block
                      text-sm
                      font-black
                      text-[#15171A]
                    "
                  >
                    Bez trenera
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
                      leading-5
                      text-[#667085]
                    "
                  >
                    Član vježba
                    samostalno.
                  </span>
                </span>
              </label>
            </div>


            <div
              className="
                mt-4
                rounded-2xl
                border
                border-dashed
                border-[#D8DDD0]
                bg-white
                p-4
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  text-[#15171A]
                "
              >
                Dodijeli treneru
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-[#667085]
                "
              >
                Popis trenera spojit
                ćemo sa sigurnim API-jem
                u sljedećem koraku.
              </p>

              <select
                value={trainerId}
                onChange={(
                  event
                ) =>
                  setTrainerId(
                    event.target.value
                  )
                }
                disabled
                className={`
                  ${inputClass}
                  mt-4
                  cursor-not-allowed
                  opacity-60
                `}
              >
                <option value="">
                  Bez trenera
                </option>
              </select>
            </div>
          </section>


          {/* MEMBERSHIP */}

          <section
            className="
              rounded-[26px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
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
                Članarina
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Početno članstvo
              </h2>
            </div>


            <div
              className="
                mt-6
                flex
                gap-3
                rounded-2xl
                bg-[#F7F8F5]
                p-1.5
              "
            >
              <button
                type="button"
                onClick={() =>
                  setHasInitialPayment(
                    true
                  )
                }
                className={`
                  flex-1
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-black
                  transition
                  ${
                    hasInitialPayment
                      ? "bg-[#111317] text-white shadow-sm"
                      : "text-[#667085]"
                  }
                `}
              >
                Uplata odmah
              </button>

              <button
                type="button"
                onClick={() =>
                  setHasInitialPayment(
                    false
                  )
                }
                className={`
                  flex-1
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-black
                  transition
                  ${
                    !hasInitialPayment
                      ? "bg-[#111317] text-white shadow-sm"
                      : "text-[#667085]"
                  }
                `}
              >
                Bez uplate
              </button>
            </div>


            {hasInitialPayment ? (
              <div
                className="
                  mt-6
                  grid
                  gap-5
                  md:grid-cols-2
                "
              >
                <Field
                  label="Početak članarine"
                  required
                >
                  <input
                    type="date"
                    value={
                      membershipStart
                    }
                    onChange={(
                      event
                    ) =>
                      setMembershipStart(
                        event.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>


                <Field
                  label="Trajanje"
                  required
                >
                  <select
                    value={
                      membershipDuration
                    }
                    onChange={(
                      event
                    ) =>
                      setMembershipDuration(
                        event.target.value as MembershipDuration
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="1">
                      1 mjesec
                    </option>

                    <option value="3">
                      3 mjeseca
                    </option>

                    <option value="6">
                      6 mjeseci
                    </option>

                    <option value="12">
                      12 mjeseci
                    </option>
                  </select>
                </Field>


                <Field
                  label="Iznos (€)"
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    onChange={(
                      event
                    ) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="40.00"
                    className={
                      inputClass
                    }
                  />
                </Field>


                <Field
                  label="Način plaćanja"
                  required
                >
                  <select
                    value={
                      paymentMethod
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target.value as PaymentMethod
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="cash">
                      Gotovina
                    </option>

                    <option value="card">
                      Kartica
                    </option>

                    <option value="bank_transfer">
                      Uplata / transakcija
                    </option>
                  </select>
                </Field>
              </div>
            ) : (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-black
                    text-amber-800
                  "
                >
                  Član će biti upisan
                  bez aktivne članarine.
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-amber-700
                  "
                >
                  Uplata se može
                  evidentirati kasnije
                  na recepciji.
                </p>
              </div>
            )}
          </section>


          {/* NOTE */}

          <section
            className="
              rounded-[26px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
            "
          >
            <Field
              label="Napomena"
              helper="Opcionalna interna napomena recepcije."
            >
              <textarea
                rows={4}
                value={note}
                onChange={(
                  event
                ) =>
                  setNote(
                    event.target.value
                  )
                }
                placeholder="Npr. studentska članarina, dogovorena uplata..."
                className={`
                  ${inputClass}
                  resize-y
                `}
              />
            </Field>
          </section>


          {/* MESSAGES */}

          {error && (
            <div
              role="alert"
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                font-semibold
                text-red-700
              "
            >
              {error}
            </div>
          )}


          {info && (
            <div
              className="
                rounded-2xl
                border
                border-[#DDE4B2]
                bg-[#F8FBE9]
                p-4
                text-sm
                font-semibold
                text-[#596300]
              "
            >
              {info}
            </div>
          )}


          {/* SUBMIT */}

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-[#E5E7EB]
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <Link
              href="/dashboard/staff/clients"
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                rounded-xl
                border
                border-[#E5E7EB]
                bg-white
                px-5
                py-3
                text-sm
                font-black
                text-[#344054]
              "
            >
              Odustani
            </Link>

            <button
              type="submit"
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#16A6A1]
                px-6
                py-3
                text-sm
                font-black
                text-white
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#128D89]
              "
            >
              Spremi člana

              <span>
                →
              </span>
            </button>
          </div>

        </form>
      </div>
    </RoleGuard>
  );
}


function Field({
  label,
  helper,
  required = false,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          block
          text-xs
          font-bold
          text-[#344054]
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-red-500
            "
          >
            *
          </span>
        )}
      </span>

      {helper && (
        <span
          className="
            mt-1
            block
            text-[11px]
            leading-4
            text-[#98A2B3]
          "
        >
          {helper}
        </span>
      )}

      <div
        className="
          mt-2
        "
      >
        {children}
      </div>
    </label>
  );
}


const inputClass = `
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
`;


function getToday() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}