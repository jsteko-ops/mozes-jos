"use client";

import {
  useState,
} from "react";

import {
  addNutritionPlan,
} from "@/lib/services/klijentiService";


type Props = {
  clientId: string;
  onSave?: () => void;
};


export default function NutritionForm({
  clientId,
  onSave,
}: Props) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    meals,
    setMeals,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);


  async function save() {
    if (!title.trim()) {
      alert(
        "Upiši naziv plana prehrane."
      );

      return;
    }

    if (!meals.trim()) {
      alert(
        "Upiši obroke i upute."
      );

      return;
    }


    try {
      setSaving(true);

      await addNutritionPlan(
        clientId,
        {
          title:
            title.trim(),

          meals:
            meals.trim(),
        }
      );

      setTitle("");
      setMeals("");

      alert(
        "Plan prehrane spremljen ✅"
      );

      onSave?.();
    } catch (error) {
      console.error(
        "Greška kod spremanja plana prehrane:",
        error
      );

      alert(
        "Plan prehrane nije moguće spremiti."
      );
    } finally {
      setSaving(false);
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
    disabled:bg-[#F4F6F2]
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
            Prehrana
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#15171A]
            "
          >
            Novi plan prehrane
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
            Kreiraj plan obroka i
            smjernice prilagođene
            ovom klijentu.
          </p>
        </div>


        <div
          className="
            inline-flex
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
            Pro
          </span>
        </div>
      </div>


      {/* FORM */}

      <div
        className="
          space-y-5
          p-5
          sm:p-6
        "
      >
        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              tracking-[0.08em]
              text-[#667085]
            "
          >
            Naziv plana
          </label>

          <input
            className={
              inputClass
            }
            placeholder="Npr. Definicija, masa, održavanje..."
            value={title}
            disabled={saving}
            onChange={(
              event
            ) =>
              setTitle(
                event.target.value
              )
            }
          />
        </div>


        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              tracking-[0.08em]
              text-[#667085]
            "
          >
            Obroci i upute
          </label>

          <textarea
            className={`
              ${inputClass}
              min-h-52
              resize-y
            `}
            placeholder={
              "Npr.\nDoručak — zobene pahuljice, jogurt, voće\nRučak — piletina, riža, povrće\nVečera — riba, salata..."
            }
            value={meals}
            disabled={saving}
            onChange={(
              event
            ) =>
              setMeals(
                event.target.value
              )
            }
          />
        </div>


        <div
          className="
            flex
            flex-col
            gap-3
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
            Plan će se spremiti na
            profil klijenta i biti
            dostupan u modulu
            Prehrana.
          </p>


          <button
            type="button"
            onClick={() =>
              void save()
            }
            disabled={saving}
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
              transition
              hover:-translate-y-0.5
              hover:bg-[#202328]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-50
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

                Spremanje...
              </>
            ) : (
              <>
                <span
                  className="
                    text-[#C8D52B]
                  "
                >
                  +
                </span>

                Spremi prehranu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}