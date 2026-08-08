"use client";

import {
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  createNotification,
} from "@/lib/notifications";


type Props = {
  clientId?: string;

  onSaveAction?:
    () =>
      | void
      | Promise<void>;
};


type ScoreSelectProps = {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  firstLabel: string;
  lastLabel: string;
  disabled?: boolean;
};


export default function CheckinForm({
  clientId,
  onSaveAction,
}: Props) {
  const [
    weight,
    setWeight,
  ] =
    useState("");


  const [
    energy,
    setEnergy,
  ] =
    useState("");


  const [
    sleep,
    setSleep,
  ] =
    useState("");


  const [
    hunger,
    setHunger,
  ] =
    useState("");


  const [
    water,
    setWater,
  ] =
    useState("");


  const [
    comment,
    setComment,
  ] =
    useState("");


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  function toNumber(
    value: string
  ) {
    return Number(
      value.replace(
        ",",
        "."
      )
    );
  }


  async function saveCheckin() {
    if (saving) {
      return;
    }


    if (!clientId) {
      alert(
        "Nema klijenta."
      );

      return;
    }


    const weightValue =
      toNumber(
        weight
      );


    if (
      !Number.isFinite(
        weightValue
      ) ||
      weightValue < 20 ||
      weightValue > 400
    ) {
      alert(
        "Težina mora biti između 20 i 400 kg."
      );

      return;
    }


    if (
      !energy ||
      !sleep ||
      !hunger
    ) {
      alert(
        "Odaberi energiju, kvalitetu sna i razinu gladi."
      );

      return;
    }


    try {
      setSaving(true);


      const clientSnap =
        await getDoc(
          doc(
            db,
            "clients",
            clientId
          )
        );


      if (
        !clientSnap.exists()
      ) {
        alert(
          "Klijent ne postoji."
        );

        return;
      }


      const client =
        clientSnap.data();


      const checkinRef =
        await addDoc(
          collection(
            db,
            "clients",
            clientId,
            "checkins"
          ),
          {
            weight:
              weightValue,

            energy,

            sleep,

            hunger,

            water:
              water.trim(),

            comment:
              comment.trim(),

            reviewed:
              false,

            createdAt:
              serverTimestamp(),
          }
        );


      /*
       * Obavijest treneru.
       *
       * Ako obavijest ne uspije,
       * Check-in je i dalje
       * ispravno spremljen.
       */

      if (
        client.trainerId
      ) {
        try {
          await createNotification(
            client.trainerId,
            {
              title:
                "Novi check-in",

              message:
                `${
                  client.name ||
                  "Klijent"
                } je poslao novi check-in.`,

              type:
                "checkin",

              link:
                `/dashboard/trainer/klijenti/${clientId}?tab=checkin&checkinId=${checkinRef.id}`,
            }
          );
        } catch (
          notificationError
        ) {
          console.error(
            "Greška kod slanja Check-in obavijesti:",
            notificationError
          );
        }
      }


      setWeight("");
      setEnergy("");
      setSleep("");
      setHunger("");
      setWater("");
      setComment("");


      if (
        onSaveAction
      ) {
        await onSaveAction();
      } else {
        alert(
          "Check-in uspješno poslan treneru."
        );
      }
    } catch (error) {
      console.error(
        "Greška kod spremanja Check-ina:",
        error
      );


      alert(
        "Check-in nije moguće spremiti."
      );
    } finally {
      setSaving(false);
    }
  }


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

      {/* HEADER */}

      <div
        className="
          border-b
          border-[#EEF0EC]
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
            ✓
          </div>


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
              Tjedni napredak
            </p>


            <h2
              className="
                mt-1
                text-xl
                font-black
                tracking-tight
                text-[#15171A]
                sm:text-2xl
              "
            >
              Novi Check-in
            </h2>


            <p
              className="
                mt-1
                max-w-xl
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Unesi trenutno stanje
              kako bi trener mogao
              pratiti tvoj napredak
              i odgovoriti na
              Check-in.
            </p>
          </div>
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

        {/* WEIGHT */}

        <div>
          <label
            htmlFor="checkin-weight"
            className="
              mb-2
              block
              text-xs
              font-bold
              text-[#344054]
            "
          >
            Težina
          </label>


          <div
            className="
              relative
            "
          >
            <input
              id="checkin-weight"
              type="text"
              inputMode="decimal"
              placeholder="npr. 82,5"
              value={weight}
              disabled={
                saving
              }
              onChange={(
                event
              ) =>
                setWeight(
                  event.target
                    .value
                )
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
                pr-14
                text-sm
                font-semibold
                text-[#15171A]
                outline-none
                transition
                placeholder:font-normal
                placeholder:text-[#98A2B3]
                focus:border-[#16A6A1]
                focus:ring-4
                focus:ring-[#16A6A1]/10
                disabled:cursor-not-allowed
                disabled:bg-[#F8F9F6]
              "
            />


            <span
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-xs
                font-bold
                text-[#98A2B3]
              "
            >
              kg
            </span>
          </div>
        </div>


        {/* SCORES */}

        <div
          className="
            grid
            gap-4
            md:grid-cols-3
          "
        >
          <ScoreSelect
            label="Energija"
            value={
              energy
            }
            onChange={
              setEnergy
            }
            firstLabel="Vrlo loše"
            lastLabel="Odlično"
            disabled={
              saving
            }
          />


          <ScoreSelect
            label="Kvaliteta sna"
            value={
              sleep
            }
            onChange={
              setSleep
            }
            firstLabel="Vrlo loše"
            lastLabel="Odlično"
            disabled={
              saving
            }
          />


          <ScoreSelect
            label="Razina gladi"
            value={
              hunger
            }
            onChange={
              setHunger
            }
            firstLabel="Nisam gladan"
            lastLabel="Jako gladan"
            disabled={
              saving
            }
          />
        </div>


        {/* WATER */}

        <div>
          <label
            htmlFor="checkin-water"
            className="
              mb-2
              block
              text-xs
              font-bold
              text-[#344054]
            "
          >
            Unos vode
          </label>


          <input
            id="checkin-water"
            type="text"
            placeholder="npr. 2,5 L"
            value={water}
            disabled={
              saving
            }
            onChange={(
              event
            ) =>
              setWater(
                event.target.value
              )
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
              placeholder:font-normal
              placeholder:text-[#98A2B3]
              focus:border-[#16A6A1]
              focus:ring-4
              focus:ring-[#16A6A1]/10
              disabled:cursor-not-allowed
              disabled:bg-[#F8F9F6]
            "
          />
        </div>


        {/* COMMENT */}

        <div>
          <div
            className="
              mb-2
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <label
              htmlFor="checkin-comment"
              className="
                text-xs
                font-bold
                text-[#344054]
              "
            >
              Komentar
            </label>


            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-[#98A2B3]
              "
            >
              Opcionalno
            </span>
          </div>


          <textarea
            id="checkin-comment"
            rows={4}
            placeholder="Kako se osjećaš, kako je prošao tjedan, što je bilo dobro ili teško..."
            value={comment}
            disabled={
              saving
            }
            onChange={(
              event
            ) =>
              setComment(
                event.target.value
              )
            }
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-[#15171A]
              outline-none
              transition
              placeholder:text-[#98A2B3]
              focus:border-[#16A6A1]
              focus:ring-4
              focus:ring-[#16A6A1]/10
              disabled:cursor-not-allowed
              disabled:bg-[#F8F9F6]
            "
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
              max-w-md
              text-xs
              leading-5
              text-[#98A2B3]
            "
          >
            Nakon slanja trener će
            dobiti obavijest i moći
            pregledati tvoj
            Check-in.
          </p>


          <button
            type="button"
            onClick={() =>
              void saveCheckin()
            }
            disabled={
              saving
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
              shadow-sm
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#202328]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
          >
            {saving ? (
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

                Slanje...
              </>
            ) : (
              <>
                Pošalji Check-in

                <span
                  className="
                    text-[#C8D52B]
                  "
                >
                  →
                </span>
              </>
            )}
          </button>
        </div>

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
  );
}


function ScoreSelect({
  label,
  value,
  onChange,
  firstLabel,
  lastLabel,
  disabled = false,
}: ScoreSelectProps) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-xs
          font-bold
          text-[#344054]
        "
      >
        {label}
      </label>


      <select
        value={value}
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
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
          focus:border-[#16A6A1]
          focus:ring-4
          focus:ring-[#16A6A1]/10
          disabled:cursor-not-allowed
          disabled:bg-[#F8F9F6]
        "
      >
        <option value="">
          Odaberi
        </option>

        <option value="1">
          1 — {firstLabel}
        </option>

        <option value="2">
          2
        </option>

        <option value="3">
          3
        </option>

        <option value="4">
          4
        </option>

        <option value="5">
          5 — {lastLabel}
        </option>
      </select>


      {value && (
        <div
          className="
            mt-2
            flex
            gap-1.5
          "
        >
          {[1, 2, 3, 4, 5].map(
            (score) => (
              <span
                key={score}
                className={`
                  h-1.5
                  flex-1
                  rounded-full
                  transition-colors

                  ${
                    score <=
                    Number(value)
                      ? "bg-[#C8D52B]"
                      : "bg-[#EEF0EC]"
                  }
                `}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}