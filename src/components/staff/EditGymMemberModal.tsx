"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getGymMembers,
} from "@/lib/getGymMembers";

import {
  updateGymMember,
} from "@/lib/updateGymMember";

import type {
  MembershipMember,
} from "@/lib/getMembershipPayments";

import type {
  ClientGender,
} from "@/lib/createClientForTrainer";


type TrainerOption = {
  uid: string;

  name: string;

  email:
    string | null;
};


type GymMemberLike = {
  uid?: unknown;

  name?: unknown;

  displayName?: unknown;

  email?: unknown;

  gymRole?: unknown;

  role?: unknown;
};


type EditGymMemberModalProps = {
  open: boolean;

  member:
    MembershipMember;

  gymId: string;

  onClose:
    () => void;

  onSaved:
    () =>
      Promise<void> |
      void;
};


export default function EditGymMemberModal({
  open,
  member,
  gymId,
  onClose,
  onSaved,
}: EditGymMemberModalProps) {
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
    useState<
      ClientGender | ""
    >("");

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    trainerId,
    setTrainerId,
  ] =
    useState("");

  const [
    trainers,
    setTrainers,
  ] =
    useState<
      TrainerOption[]
    >([]);

  const [
    trainersLoading,
    setTrainersLoading,
  ] =
    useState(false);

  const [
    trainersError,
    setTrainersError,
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
      member.name ||
      member.displayName ||
      ""
    );

    setEmail(
      member.email ||
      ""
    );

    setPhone(
      member.phone ||
      ""
    );

    setGender(
      member.gender ||
      ""
    );

    setNote(
      member.note ||
      ""
    );

    setTrainerId(
      member.trainerId ||
      ""
    );

    setError(
      ""
    );
  }, [
    open,
    member,
  ]);


  useEffect(() => {
    if (
      !open ||
      !gymId
    ) {
      return;
    }


    let cancelled =
      false;


    async function loadTrainers() {
      try {
        setTrainersLoading(
          true
        );

        setTrainersError(
          ""
        );


        const members =
          (
            await getGymMembers(
              gymId
            )
          ) as
            GymMemberLike[];


        if (cancelled) {
          return;
        }


        const trainerList =
          members
            .filter(
              (
                gymMember
              ) =>
                (
                  gymMember.gymRole ===
                    "trainer" ||
                  gymMember.role ===
                    "trainer"
                ) &&
                typeof gymMember.uid ===
                  "string"
            )
            .map(
              (
                gymMember
              ) => {
                const uid =
                  String(
                    gymMember.uid
                  );


                const memberName =
                  typeof gymMember.name ===
                    "string" &&
                  gymMember.name.trim()
                    ? gymMember.name.trim()
                    : typeof gymMember.displayName ===
                          "string" &&
                        gymMember.displayName.trim()
                      ? gymMember.displayName.trim()
                      : typeof gymMember.email ===
                            "string" &&
                          gymMember.email.trim()
                        ? gymMember.email.trim()
                        : "Trener";


                return {
                  uid,

                  name:
                    memberName,

                  email:
                    typeof gymMember.email ===
                      "string" &&
                    gymMember.email.trim()
                      ? gymMember.email.trim()
                      : null,
                };
              }
            )
            .sort(
              (
                first,
                second
              ) =>
                first.name.localeCompare(
                  second.name,
                  "hr"
                )
            );


        setTrainers(
          trainerList
        );
      } catch (
        loadError: unknown
      ) {
        console.error(
          "Greška kod učitavanja trenera:",
          loadError
        );


        if (!cancelled) {
          setTrainers(
            []
          );

          setTrainersError(
            loadError instanceof Error
              ? loadError.message
              : "Popis trenera trenutno nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setTrainersLoading(
            false
          );
        }
      }
    }


    void loadTrainers();


    return () => {
      cancelled =
        true;
    };
  }, [
    open,
    gymId,
  ]);


  async function submitEdit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const cleanName =
      name.trim();


    if (!cleanName) {
      setError(
        "Upiši ime i prezime člana."
      );

      return;
    }


    if (!gender) {
      setError(
        "Odaberi spol člana."
      );

      return;
    }


    if (
      note.trim().length >
      500
    ) {
      setError(
        "Napomena može imati najviše 500 znakova."
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


      await updateGymMember(
        {
          memberId:
            member.uid,

          name:
            cleanName,

          email,

          phone,

          gender,

          note,

          trainerId:
            trainerId ||
            null,
        }
      );


      await onSaved();


      onClose();
    } catch (
      saveError: unknown
    ) {
      console.error(
        "Greška kod uređivanja člana:",
        saveError
      );


      setError(
        saveError instanceof Error
          ? saveError.message
          : "Podatke člana trenutno nije moguće spremiti."
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


  const currentTrainerMissing =
    Boolean(
      trainerId &&
      !trainers.some(
        (
          trainer
        ) =>
          trainer.uid ===
          trainerId
      )
    );


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
        bg-black/55
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
              Član teretane
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
              Promijeni osnovne podatke člana i dodijeljenog trenera.
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
              Ako član ima korisnički račun, promjena e-maila mijenja i e-mail za prijavu.
            </p>
          </EditField>


          <EditField
            label="Spol"
          >
            <select
              value={
                gender
              }
              onChange={
                (
                  event
                ) =>
                  setGender(
                    event.target.value as
                      ClientGender |
                      ""
                  )
              }
              disabled={
                saving
              }
              className={
                inputClass
              }
            >
              <option value="">
                Odaberi spol
              </option>

              <option value="male">
                Muško
              </option>

              <option value="female">
                Žensko
              </option>

              <option value="prefer_not_to_say">
                Ne želi navesti
              </option>
            </select>
          </EditField>


          <EditField
            label="Trener"
          >
            <select
              value={
                trainerId
              }
              onChange={
                (
                  event
                ) =>
                  setTrainerId(
                    event.target.value
                  )
              }
              disabled={
                saving ||
                trainersLoading
              }
              className={
                inputClass
              }
            >
              <option value="">
                Bez trenera
              </option>

              {currentTrainerMissing && (
                <option
                  value={
                    trainerId
                  }
                >
                  Trenutno dodijeljeni trener
                </option>
              )}

              {trainers.map(
                (
                  trainer
                ) => (
                  <option
                    key={
                      trainer.uid
                    }
                    value={
                      trainer.uid
                    }
                  >
                    {trainer.name}
                    {trainer.email
                      ? ` — ${trainer.email}`
                      : ""}
                  </option>
                )
              )}
            </select>


            {trainersLoading && (
              <p
                className="
                  mt-2
                  text-xs
                  text-[#667085]
                "
              >
                Učitavanje trenera...
              </p>
            )}


            {trainersError && (
              <p
                className="
                  mt-2
                  text-xs
                  font-semibold
                  text-amber-700
                "
              >
                {trainersError}
              </p>
            )}
          </EditField>


          <EditField
            label="Napomena"
          >
            <textarea
              value={
                note
              }
              onChange={
                (
                  event
                ) =>
                  setNote(
                    event.target.value
                  )
              }
              maxLength={
                500
              }
              disabled={
                saving
              }
              rows={
                4
              }
              className={`
                ${inputClass}
                resize-none
              `}
              placeholder="Interna napomena za recepciju..."
            />

            <div
              className="
                mt-2
                text-right
                text-xs
                text-[#98A2B3]
              "
            >
              {note.length}/500
            </div>
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
    React.ReactNode;
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          mb-2
          block
          text-xs
          font-black
          uppercase
          tracking-[0.1em]
          text-[#667085]
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
  focus:ring-2
  focus:ring-[#16A6A1]/15
  disabled:cursor-not-allowed
  disabled:bg-[#F9FAFB]
  disabled:text-[#98A2B3]
`;