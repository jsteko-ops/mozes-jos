"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import type {
  ClientGender,
} from "@/lib/createClientForTrainer";


type ClientEditFormProps = {
  client: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    note?: string;
    goal?: string;
    gender?: ClientGender;
  };

  onSaved: () => void;
};


export default function ClientEditForm({
  client,
  onSaved,
}: ClientEditFormProps) {
  const [
    name,
    setName,
  ] = useState(
    client.name || ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    client.email || ""
  );

  const [
    phone,
    setPhone,
  ] = useState(
    client.phone || ""
  );

  const [
    note,
    setNote,
  ] = useState(
    client.note || ""
  );

  const [
    goal,
    setGoal,
  ] = useState(
    client.goal || ""
  );

  const [
    gender,
    setGender,
  ] =
    useState<ClientGender | "">(
      client.gender || ""
    );

  const [
    loading,
    setLoading,
  ] = useState(false);


  useEffect(() => {
    setName(
      client.name || ""
    );

    setEmail(
      client.email || ""
    );

    setPhone(
      client.phone || ""
    );

    setNote(
      client.note || ""
    );

    setGoal(
      client.goal || ""
    );

    setGender(
      client.gender || ""
    );
  }, [client]);


  async function save() {
    if (!name.trim()) {
      alert(
        "Upiši ime klijenta."
      );

      return;
    }


    if (!email.trim()) {
      alert(
        "Upiši email klijenta."
      );

      return;
    }


    if (!gender) {
      alert(
        "Odaberi spol klijenta."
      );

      return;
    }


    try {
      setLoading(true);


      await updateDoc(
        doc(
          db,
          "clients",
          client.id
        ),
        {
          name:
            name.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          note:
            note.trim(),

          goal:
            goal.trim(),

          gender,
        }
      );


      alert(
        "Klijent ažuriran ✅"
      );


      onSaved();
    } catch (
      error: unknown
    ) {
      console.error(
        "Greška kod spremanja klijenta:",
        error
      );


      alert(
        "Greška kod spremanja klijenta."
      );
    } finally {
      setLoading(false);
    }
  }


  const inputClass = `
    w-full
    rounded-xl
    border
    border-[#E5E7EB]
    bg-white
    px-4
    py-3
    text-sm
    text-[#15171A]
    outline-none
    transition
    placeholder:text-[#98A2B3]
    focus:border-[#16A6A1]
    focus:ring-4
    focus:ring-[#16A6A1]/10
  `;


  const labelClass = `
    mb-2
    block
    text-xs
    font-bold
    uppercase
    tracking-[0.08em]
    text-[#667085]
  `;


  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-[#EEF0EC]
          bg-[#FBFCFA]
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Osobni podaci
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#15171A]
            "
          >
            Podaci klijenta
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[#667085]
            "
          >
            Uredi osnovne informacije,
            cilj i napomene za klijenta.
          </p>
        </div>


        <div
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            bg-[#C8D52B]/15
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
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[#5F6810]
            "
          >
            Profil
          </span>
        </div>
      </div>


      {/* FORM */}

      <div
        className="
          space-y-6
          p-5
          sm:p-6
        "
      >

        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >

          {/* NAME */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Ime i prezime
            </label>

            <input
              className={
                inputClass
              }
              placeholder="Ime i prezime"
              value={name}
              onChange={(
                event
              ) =>
                setName(
                  event.target
                    .value
                )
              }
            />
          </div>


          {/* EMAIL */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Email
            </label>

            <input
              type="email"
              className={
                inputClass
              }
              placeholder="ime@email.com"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
            />
          </div>


          {/* GENDER */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Spol
            </label>

            <select
              value={gender}
              onChange={(
                event
              ) =>
                setGender(
                  event.target
                    .value as
                    ClientGender | ""
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Odaberi spol
              </option>

              <option value="male">
                Muški
              </option>

              <option value="female">
                Ženski
              </option>

              <option value="prefer_not_to_say">
                Ne želim se izjasniti
              </option>
            </select>
          </div>


          {/* PHONE */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Telefon
            </label>

            <input
              type="tel"
              className={
                inputClass
              }
              placeholder="+385..."
              value={phone}
              onChange={(
                event
              ) =>
                setPhone(
                  event.target
                    .value
                )
              }
            />
          </div>

        </div>


        {/* GOAL */}

        <div>
          <label
            className={
              labelClass
            }
          >
            Cilj klijenta
          </label>

          <input
            className={
              inputClass
            }
            placeholder="Npr. smanjenje tjelesne mase, povećanje snage..."
            value={goal}
            onChange={(
              event
            ) =>
              setGoal(
                event.target
                  .value
              )
            }
          />
        </div>


        {/* NOTE */}

        <div>
          <label
            className={
              labelClass
            }
          >
            Napomena
          </label>

          <textarea
            className={`
              ${inputClass}
              min-h-32
              resize-y
            `}
            placeholder="Dodatne napomene o klijentu..."
            value={note}
            onChange={(
              event
            ) =>
              setNote(
                event.target
                  .value
              )
            }
          />
        </div>


        {/* FOOTER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-[#EEF0EC]
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-[#98A2B3]
            "
          >
            Promjene se spremaju
            direktno na profil
            klijenta.
          </p>


          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#111317]
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#202328]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
            "
          >
            {loading ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-[#C8D52B]
                  "
                />

                Spremanje...
              </>
            ) : (
              <>
                <span
                  className="
                    text-[#C8D52B]
                  "
                >
                  ✓
                </span>

                Spremi promjene
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}