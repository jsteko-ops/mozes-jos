"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  updateGymTrainer,
} from "@/lib/updateGymTrainer";


type TrainerLike = {
  uid: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
};


type EditTrainerModalProps = {
  open: boolean;

  trainer:
    TrainerLike;

  onClose:
    () => void;

  onSaved:
    (
      trainer: {
        uid: string;
        name: string;
        email: string;
        phone:
          string | null;
      }
    ) => void;
};


export default function EditTrainerModal({
  open,
  trainer,
  onClose,
  onSaved,
}: EditTrainerModalProps) {
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
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    if (!open) {
      return;
    }

    setName(
      trainer.name ||
        trainer.displayName ||
        ""
    );

    setEmail(
      trainer.email ||
        ""
    );

    setPhone(
      trainer.phone ||
        ""
    );

    setError(
      ""
    );
  }, [
    open,
    trainer,
  ]);


  async function submitEdit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    const cleanPhone =
      phone.trim();


    if (!cleanName) {
      setError(
        "Upiši ime i prezime trenera."
      );

      return;
    }


    if (!cleanEmail) {
      setError(
        "Upiši e-mail adresu trenera."
      );

      return;
    }


    try {
      setSaving(
        true
      );

      setError(
        ""
      );


      const result =
        await updateGymTrainer(
          {
            trainerId:
              trainer.uid,

            name:
              cleanName,

            email:
              cleanEmail,

            phone:
              cleanPhone,
          }
        );


      onSaved(
        result.trainer
      );

      onClose();
    } catch (
      saveError: unknown
    ) {
      console.error(
        "Greška kod uređivanja trenera:",
        saveError
      );


      setError(
        saveError instanceof Error
          ? saveError.message
          : "Podatke trenera trenutno nije moguće spremiti."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  if (!open) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/60
        px-4
        py-8
      "
    >
      <button
        type="button"
        aria-label="Zatvori"
        className="
          absolute
          inset-0
          cursor-default
        "
        onClick={
          saving
            ? undefined
            : onClose
        }
      />


      <div
        className="
          relative
          z-10
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-2xl
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-6
            border-b
            border-[#EAECF0]
            px-6
            py-6
            sm:px-8
          "
        >
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.14em]
                text-[#16A6A1]
              "
            >
              Trener teretane
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                text-[#15171A]
              "
            >
              Uredi podatke
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#667085]
              "
            >
              Promijeni ime, kontakt i e-mail trenera.
            </p>
          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F2F4F7]
              text-xl
              font-bold
              text-[#344054]
              transition
              hover:bg-[#E4E7EC]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            ×
          </button>
        </div>


        <form
          onSubmit={
            submitEdit
          }
          className="
            space-y-6
            px-6
            py-7
            sm:px-8
          "
        >
          {error && (
            <div
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-semibold
                text-red-700
              "
            >
              {error}
            </div>
          )}


          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <EditField
              label="Ime i prezime"
            >
              <input
                type="text"
                value={
                  name
                }
                onChange={
                  (
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                }
                maxLength={
                  120
                }
                disabled={
                  saving
                }
                className={
                  inputClass
                }
                placeholder="Ime i prezime"
              />
            </EditField>


            <EditField
              label="Telefon"
            >
              <input
                type="tel"
                value={
                  phone
                }
                onChange={
                  (
                    event
                  ) =>
                    setPhone(
                      event.target.value
                    )
                }
                maxLength={
                  50
                }
                disabled={
                  saving
                }
                className={
                  inputClass
                }
                placeholder="+385..."
              />
            </EditField>
          </div>


          <EditField
            label="E-mail"
          >
            <input
              type="email"
              value={
                email
              }
              onChange={
                (
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
              }
              disabled={
                saving
              }
              className={
                inputClass
              }
              placeholder="ime@primjer.hr"
            />

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-[#667085]
              "
            >
              Promjena e-maila mijenja i e-mail kojim se trener prijavljuje.
            </p>
          </EditField>


          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-[#EAECF0]
              pt-6
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="
                rounded-xl
                border
                border-[#D0D5DD]
                bg-white
                px-5
                py-3
                text-sm
                font-black
                text-[#344054]
                transition
                hover:bg-[#F9FAFB]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Odustani
            </button>


            <button
              type="submit"
              disabled={
                saving
              }
              className="
                rounded-xl
                bg-[#15171A]
                px-6
                py-3
                text-sm
                font-black
                text-white
                transition
                hover:bg-[#25282D]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving
                ? "Spremanje..."
                : "Spremi promjene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function EditField({
  label,
  children,
}: {
  label: string;
  children:
    ReactNode;
}) {
  return (
    <label
      className="
        block
        text-sm
        font-bold
        text-[#344054]
      "
    >
      <span
        className="
          mb-2
          block
        "
      >
        {label}
      </span>

      {children}
    </label>
  );
}


const inputClass = `
  w-full
  rounded-xl
  border
  border-[#D0D5DD]
  bg-white
  px-4
  py-3
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
  disabled:bg-[#F9FAFB]
  disabled:opacity-70
`;