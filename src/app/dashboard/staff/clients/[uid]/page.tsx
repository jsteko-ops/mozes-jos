"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";
import EditGymMemberModal from "@/components/staff/EditGymMemberModal";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  getMembershipPayments,
} from "@/lib/getMembershipPayments";

import type {
  MembershipMember,
  MembershipPayment,
} from "@/lib/getMembershipPayments";

import {
  recordMembershipPayment,
} from "@/lib/recordMembershipPayment";

import type {
  MembershipDuration,
  PaymentMethod,
} from "@/lib/createClientForTrainer";


export default function StaffClientDetailPage() {
  const params =
    useParams();


  const memberId =
    typeof params.uid ===
      "string"
      ? params.uid
      : "";


  const {
    userProfile,
    loading:
      authLoading,
  } =
    useAuth();


  const [
    member,
    setMember,
  ] =
    useState<MembershipMember | null>(
      null
    );


  const [
    payments,
    setPayments,
  ] =
    useState<MembershipPayment[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");

const [
editOpen,
setEditOpen,
] =
useState(false);


  const [
    paymentOpen,
    setPaymentOpen,
  ] =
    useState(false);


  const [
    paymentStart,
    setPaymentStart,
  ] =
    useState("");


  const [
    paymentDuration,
    setPaymentDuration,
  ] =
    useState<MembershipDuration>(
      1
    );


  const [
    paymentAmount,
    setPaymentAmount,
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
    paymentNote,
    setPaymentNote,
  ] =
    useState("");


  const [
    paymentError,
    setPaymentError,
  ] =
    useState("");


  const [
    savingPayment,
    setSavingPayment,
  ] =
    useState(false);


  async function loadData() {
    if (!memberId) {
      setError(
        "Član nije pronađen."
      );

      setLoading(false);

      return;
    }


    try {
      setLoading(true);

      setError("");


      const result =
        await getMembershipPayments(
          memberId
        );


      setMember(
        result.member
      );

      setPayments(
        result.payments
      );
    } catch (
      loadError: unknown
    ) {
      console.error(
        "Greška kod učitavanja člana:",
        loadError
      );


      setError(
        loadError instanceof Error
          ? loadError.message
          : "Podatke člana trenutno nije moguće učitati."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (
      authLoading ||
      !userProfile
    ) {
      return;
    }


    void loadData();
  }, [
    memberId,
    authLoading,
    userProfile,
  ]);


  function openPaymentModal() {
    if (!member) {
      return;
    }


    const now =
      new Date();


    const today = [
      now.getFullYear(),

      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      ),

      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      ),
    ].join("-");


    setPaymentStart(
      today
    );

    setPaymentDuration(
      1
    );

    setPaymentAmount(
      typeof member.membershipAmount ===
        "number"
        ? member.membershipAmount.toFixed(
            2
          )
        : ""
    );

    setPaymentMethod(
      "cash"
    );

    setPaymentNote(
      ""
    );

    setPaymentError(
      ""
    );

    setSuccess(
      ""
    );

    setPaymentOpen(
      true
    );
  }


  async function submitPayment() {
    if (!member) {
      return;
    }


    const parsedAmount =
      Number(
        paymentAmount
      );


    if (!paymentStart) {
      setPaymentError(
        "Odaberi datum početka članarine."
      );

      return;
    }


    if (
      !Number.isFinite(
        parsedAmount
      ) ||
      parsedAmount <= 0
    ) {
      setPaymentError(
        "Upiši ispravan iznos uplate."
      );

      return;
    }


    try {
      setSavingPayment(
        true
      );

      setPaymentError(
        ""
      );


      await recordMembershipPayment(
        {
          memberId:
            member.uid,

          membershipStart:
            paymentStart,

          membershipDuration:
            paymentDuration,

          amount:
            parsedAmount,

          paymentMethod,

          note:
            paymentNote,
        }
      );


      const refreshed =
        await getMembershipPayments(
          member.uid
        );


      setMember(
        refreshed.member
      );

      setPayments(
        refreshed.payments
      );

      setPaymentOpen(
        false
      );

      setSuccess(
        "Uplata je uspješno evidentirana."
      );
    } catch (
      submitError: unknown
    ) {
      console.error(
        "Greška kod evidentiranja uplate:",
        submitError
      );


      setPaymentError(
        submitError instanceof Error
          ? submitError.message
          : "Uplatu trenutno nije moguće evidentirati."
      );
    } finally {
      setSavingPayment(
        false
      );
    }
  }


  const membership =
    member
      ? getMembershipStatus(
          member
        )
      : null;


  return (
    <RoleGuard
      allowedRoles={[
        "gym_staff",
      ]}
    >
      <div className="space-y-6">

        {/* BACK */}

        <Link
          href="/dashboard/staff/clients"
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
          ← Natrag na članove
        </Link>


        {/* LOADING */}

        {loading && (
          <div
            className="
              space-y-4
            "
          >
            <div
              className="
                h-48
                animate-pulse
                rounded-[28px]
                bg-white
              "
            />

            <div
              className="
                h-72
                animate-pulse
                rounded-[28px]
                bg-white
              "
            />
          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <div
              className="
                rounded-[24px]
                border
                border-red-200
                bg-red-50
                p-6
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  text-red-700
                "
              >
                {error}
              </p>
            </div>
          )}


        {!loading &&
          !error &&
          member && (
            <>
              {/* HEADER */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  bg-[#111317]
                  p-6
                  text-white
                  shadow-sm
                  sm:p-8
                "
              >
                <div
                  className="
                    absolute
                    -right-16
                    -top-16
                    h-52
                    w-52
                    rounded-full
                    bg-[#16A6A1]/10
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-20
                    right-24
                    h-44
                    w-44
                    rounded-full
                    bg-[#C8D52B]/10
                  "
                />


                <div
                  className="
                    relative
                    flex
                    flex-col
                    gap-6
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#C8D52B]
                        text-lg
                        font-black
                        text-[#111317]
                      "
                    >
                      {getInitials(
                        getMemberName(
                          member
                        )
                      )}
                    </div>


                    <div>
                      <p
                        className="
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.16em]
                          text-[#16A6A1]
                        "
                      >
                        Recepcija · član
                      </p>

                      <h1
                        className="
                          mt-1
                          text-2xl
                          font-black
                          tracking-tight
                          sm:text-4xl
                        "
                      >
                        {getMemberName(
                          member
                        )}
                      </h1>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-white/55
                        "
                      >
                        {member.email ||
                          "Email nije unesen"}
                      </p>
                    </div>
                  </div>


                 <div
  className="
    flex
    flex-col
    gap-3
    sm:flex-row
  "
>
  <button
    type="button"
    onClick={() =>
      setEditOpen(
        true
      )
    }
    className="
      inline-flex
      min-h-12
      items-center
      justify-center
      rounded-xl
      border
      border-white/20
      bg-white/10
      px-6
      py-3
      text-sm
      font-black
      text-white
      transition
      hover:-translate-y-0.5
      hover:bg-white/15
    "
  >
    Uredi podatke
  </button>

  <button
    type="button"
    onClick={
      openPaymentModal
    }
    className="
      inline-flex
      min-h-12
      items-center
      justify-center
      rounded-xl
      bg-[#C8D52B]
      px-6
      py-3
      text-sm
      font-black
      text-[#111317]
      transition
      hover:-translate-y-0.5
      hover:bg-[#D6E23B]
    "
  >
    + Nova uplata
  </button>
</div>
                </div>
              </section>


              {/* SUCCESS */}

              {success && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-5
                    py-4
                    text-sm
                    font-bold
                    text-emerald-700
                  "
                >
                  {success}
                </div>
              )}


              {/* MEMBER INFO */}

              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-2
                  xl:grid-cols-4
                "
              >
                <InfoCard
                  label="Status članarine"
                  value={
                    membership?.label ||
                    "—"
                  }
                  valueClassName={
                    membership
                      ?.className ||
                    ""
                  }
                />

                <InfoCard
                  label="Vrijedi do"
                  value={
                    formatDate(
                      member.membershipValidUntil
                    )
                  }
                />

                <InfoCard
                  label="Zadnji iznos"
                  value={
                    typeof member.membershipAmount ===
                      "number"
                      ? formatMoney(
                          member.membershipAmount
                        )
                      : "—"
                  }
                />

                <InfoCard
                  label="Trajanje"
                  value={
                    member.membershipDurationMonths
                      ? formatDuration(
                          member.membershipDurationMonths
                        )
                      : "—"
                  }
                />
              </section>


              {/* CONTACT + MEMBERSHIP */}

              <section
                className="
                  grid
                  gap-5
                  lg:grid-cols-2
                "
              >
                <div
                  className="
                    rounded-[26px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    p-6
                    shadow-sm
                  "
                >
                  <p
                    className="
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-[#16A6A1]
                    "
                  >
                    Podaci člana
                  </p>

                  <div
                    className="
                      mt-5
                      divide-y
                      divide-[#EEF0EC]
                    "
                  >
                    <DetailRow
                      label="Ime"
                      value={
                        getMemberName(
                          member
                        )
                      }
                    />

                    <DetailRow
                      label="Email"
                      value={
                        member.email ||
                        "Nije uneseno"
                      }
                    />

                    <DetailRow
                      label="Telefon"
                      value={
                        member.phone ||
                        "Nije uneseno"
                      }
                    />

<DetailRow
  label="Trener"
  value={
    member.trainerId
      ? member.trainerName || "Dodijeljen"
      : "Bez trenera"
  }
/>
                  </div>
                </div>


                <div
                  className="
                    rounded-[26px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    p-6
                    shadow-sm
                  "
                >
                  <p
                    className="
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-[#C8D52B]
                    "
                  >
                    Članarina
                  </p>

                  <div
                    className="
                      mt-5
                      divide-y
                      divide-[#EEF0EC]
                    "
                  >
                    <DetailRow
                      label="Početak"
                      value={
                        formatDate(
                          member.membershipValidFrom
                        )
                      }
                    />

                    <DetailRow
                      label="Istek"
                      value={
                        formatDate(
                          member.membershipValidUntil
                        )
                      }
                    />

                    <DetailRow
                      label="Status"
                      value={
                        membership?.label ||
                        "—"
                      }
                    />

                    <DetailRow
                      label="Zadnji iznos"
                      value={
                        typeof member.membershipAmount ===
                          "number"
                          ? formatMoney(
                              member.membershipAmount
                            )
                          : "—"
                      }
                    />
                  </div>
                </div>
              </section>


              {/* PAYMENT HISTORY */}

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
                <div
                  className="
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-[#EEF0EC]
                    p-6
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
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
                      Evidencija
                    </p>

                    <h2
                      className="
                        mt-1
                        text-xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      Povijest uplata
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-[#667085]
                      "
                    >
                      Ukupno evidentiranih uplata:{" "}
                      {payments.length}
                    </p>
                  </div>


                  <button
                    type="button"
                    onClick={
                      openPaymentModal
                    }
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#111317]
                      px-5
                      text-sm
                      font-black
                      text-white
                      transition
                      hover:bg-[#25282D]
                    "
                  >
                    + Nova uplata
                  </button>
                </div>


                {payments.length ===
                0 ? (
                  <div
                    className="
                      px-6
                      py-14
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#C8D52B]/15
                        text-xl
                      "
                    >
                      €
                    </div>

                    <h3
                      className="
                        mt-4
                        text-lg
                        font-black
                        text-[#15171A]
                      "
                    >
                      Još nema uplata
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-[#667085]
                      "
                    >
                      Prva evidentirana uplata
                      pojavit će se ovdje.
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      divide-y
                      divide-[#EEF0EC]
                    "
                  >
                    {payments.map(
                      (
                        payment
                      ) => (
                        <PaymentRow
                          key={
                            payment.id
                          }
                          payment={
                            payment
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            </>
          )}


        {/* PAYMENT MODAL */}

        {paymentOpen &&
          member && (
            <div
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/60
                p-4
                backdrop-blur-sm
              "
            >
              <div
                className="
                  max-h-[92vh]
                  w-full
                  max-w-2xl
                  overflow-y-auto
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
                    gap-4
                    border-b
                    border-[#EEF0EC]
                    p-6
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-[#16A6A1]
                      "
                    >
                      Evidencija uplate
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      Nova uplata
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-[#667085]
                      "
                    >
                      {getMemberName(
                        member
                      )}
                    </p>
                  </div>


                  <button
                    type="button"
                    disabled={
                      savingPayment
                    }
                    onClick={() =>
                      setPaymentOpen(
                        false
                      )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#F4F5F2]
                      text-lg
                      font-black
                      text-[#667085]
                    "
                  >
                    ×
                  </button>
                </div>


                <form
                  onSubmit={(
                    event
                  ) => {
                    event.preventDefault();

                    void submitPayment();
                  }}
                  className="
                    space-y-5
                    p-6
                  "
                >
                  <div
                    className="
                      grid
                      gap-4
                      sm:grid-cols-2
                    "
                  >
                    <FormField
                      label="Datum početka"
                    >
                      <input
                        type="date"
                        required
                        value={
                          paymentStart
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentStart(
                            event
                              .target
                              .value
                          )
                        }
                        className="
                          min-h-12
                          w-full
                          rounded-xl
                          border
                          border-[#D8DDD0]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          focus:border-[#16A6A1]
                        "
                      />
                    </FormField>


                    <FormField
                      label="Trajanje"
                    >
                      <select
                        value={
                          paymentDuration
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentDuration(
                            Number(
                              event
                                .target
                                .value
                            ) as MembershipDuration
                          )
                        }
                        className="
                          min-h-12
                          w-full
                          rounded-xl
                          border
                          border-[#D8DDD0]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          focus:border-[#16A6A1]
                        "
                      >
                        <option
                          value="1"
                        >
                          1 mjesec
                        </option>

                        <option
                          value="3"
                        >
                          3 mjeseca
                        </option>

                        <option
                          value="6"
                        >
                          6 mjeseci
                        </option>

                        <option
                          value="12"
                        >
                          12 mjeseci
                        </option>
                      </select>
                    </FormField>


                    <FormField
                      label="Iznos (€)"
                    >
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={
                          paymentAmount
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentAmount(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="0.00"
                        className="
                          min-h-12
                          w-full
                          rounded-xl
                          border
                          border-[#D8DDD0]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          focus:border-[#16A6A1]
                        "
                      />
                    </FormField>


                    <FormField
                      label="Način plaćanja"
                    >
                      <select
                        value={
                          paymentMethod
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentMethod(
                            event
                              .target
                              .value as PaymentMethod
                          )
                        }
                        className="
                          min-h-12
                          w-full
                          rounded-xl
                          border
                          border-[#D8DDD0]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-[#15171A]
                          outline-none
                          transition
                          focus:border-[#16A6A1]
                        "
                      >
                        <option
                          value="cash"
                        >
                          Gotovina
                        </option>

                        <option
                          value="card"
                        >
                          Kartica
                        </option>

                        <option
                          value="bank_transfer"
                        >
                          Bankovna uplata
                        </option>
                      </select>
                    </FormField>
                  </div>


                  <FormField
                    label="Napomena"
                  >
                    <textarea
                      rows={3}
                      maxLength={
                        500
                      }
                      value={
                        paymentNote
                      }
                      onChange={(
                        event
                      ) =>
                        setPaymentNote(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Opcionalna napomena uz uplatu..."
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-[#D8DDD0]
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-[#15171A]
                        outline-none
                        transition
                        focus:border-[#16A6A1]
                      "
                    />
                  </FormField>


                  {paymentError && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-red-700
                      "
                    >
                      {paymentError}
                    </div>
                  )}


                  <div
                    className="
                      flex
                      flex-col-reverse
                      gap-3
                      pt-2
                      sm:flex-row
                      sm:justify-end
                    "
                  >
                    <button
                      type="button"
                      disabled={
                        savingPayment
                      }
                      onClick={() =>
                        setPaymentOpen(
                          false
                        )
                      }
                      className="
                        min-h-12
                        rounded-xl
                        border
                        border-[#D8DDD0]
                        bg-white
                        px-6
                        text-sm
                        font-black
                        text-[#667085]
                        disabled:opacity-60
                      "
                    >
                      Odustani
                    </button>


                    <button
                      type="submit"
                      disabled={
                        savingPayment
                      }
                      className="
                        min-h-12
                        rounded-xl
                        bg-[#C8D52B]
                        px-6
                        text-sm
                        font-black
                        text-[#111317]
                        transition
                        hover:bg-[#D6E23B]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {savingPayment
                        ? "Spremanje..."
                        : "Spremi uplatu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
           )}

      {member &&
        userProfile?.gymId && (
          <EditGymMemberModal
            open={
              editOpen
            }
            member={
              member
            }
            gymId={
              userProfile.gymId
            }
            onClose={() =>
              setEditOpen(
                false
              )
            }
            onSaved={
              async () => {
                const refreshed =
                  await getMembershipPayments(
                    member.uid
                  );

                setMember(
                  refreshed.member
                );

                setPayments(
                  refreshed.payments
                );

                setSuccess(
                  "Podaci člana su uspješno spremljeni."
                );
              }
            }
          />
        )}
    </div>
  </RoleGuard>
  );
}


function InfoCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-[#E5E7EB]
        bg-white
        p-5
        shadow-sm
      "
    >
      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-3
          text-xl
          font-black
          text-[#15171A]
          ${valueClassName}
        `}
      >
        {value}
      </p>
    </div>
  );
}


function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-5
        py-4
      "
    >
      <span
        className="
          text-sm
          font-semibold
          text-[#98A2B3]
        "
      >
        {label}
      </span>

      <span
        className="
          text-right
          text-sm
          font-black
          text-[#15171A]
        "
      >
        {value}
      </span>
    </div>
  );
}


function PaymentRow({
  payment,
}: {
  payment: MembershipPayment;
}) {
  return (
    <div
      className="
        p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div
          className="
            flex
            items-center
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
              text-sm
              font-black
              text-[#C8D52B]
            "
          >
            €
          </div>


          <div>
            <p
              className="
                text-lg
                font-black
                text-[#15171A]
              "
            >
              {typeof payment.amount ===
              "number"
                ? formatMoney(
                    payment.amount
                  )
                : "—"}
            </p>

            <p
              className="
                mt-1
                text-xs
                font-semibold
                text-[#667085]
              "
            >
              {formatDateTime(
                payment.paidAt
              )}
            </p>
          </div>
        </div>


        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:min-w-[520px]
            lg:grid-cols-4
          "
        >
          <PaymentInfo
            label="Način"
            value={
              paymentMethodLabel(
                payment.method
              )
            }
          />

          <PaymentInfo
            label="Trajanje"
            value={
              payment.durationMonths
                ? formatDuration(
                    payment.durationMonths
                  )
                : "—"
            }
          />

          <PaymentInfo
            label="Vrijedi do"
            value={
              formatDate(
                payment.periodUntil
              )
            }
          />

          <PaymentInfo
            label="Evidentirao"
            value={
              payment.recordedByName ||
              "—"
            }
          />
        </div>
      </div>


      {payment.note && (
        <div
          className="
            mt-5
            rounded-xl
            bg-[#F7F8F5]
            px-4
            py-3
            text-sm
            leading-6
            text-[#667085]
          "
        >
          <span
            className="
              font-black
              text-[#15171A]
            "
          >
            Napomena:
          </span>{" "}
          {payment.note}
        </div>
      )}
    </div>
  );
}


function PaymentInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.12em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-black
          text-[#15171A]
        "
      >
        {value}
      </p>
    </div>
  );
}


function FormField({
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
        space-y-2
      "
    >
      <span
        className="
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


function getMemberName(
  member: MembershipMember
) {
  return (
    member.name ||
    member.displayName ||
    member.email ||
    "Član"
  );
}


function getInitials(
  value: string
) {
  return (
    value
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .toUpperCase() ||
    "Č"
  );
}


function getMembershipStatus(
  member: MembershipMember
) {
  if (
    member.membershipState ===
      "paused" ||
    member.membershipStatus ===
      "paused"
  ) {
    return {
      label:
        "Zamrznuta",

      className:
        "text-amber-600",
    };
  }


  const validUntil =
    parseDate(
      member.membershipValidUntil
    );


  if (!validUntil) {
    return {
      label:
        "Nije postavljena",

      className:
        "text-[#98A2B3]",
    };
  }


  const now =
    new Date();


  const today =
    new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );


  const expiry =
    new Date(
      Date.UTC(
        validUntil.getUTCFullYear(),
        validUntil.getUTCMonth(),
        validUntil.getUTCDate()
      )
    );


  if (
    expiry < today
  ) {
    return {
      label:
        "Istekla",

      className:
        "text-red-600",
    };
  }


  const warning =
    new Date(
      today
    );


  warning.setUTCDate(
    warning.getUTCDate() +
      14
  );


  if (
    expiry <= warning
  ) {
    return {
      label:
        "Uskoro istječe",

      className:
        "text-amber-600",
    };
  }


  return {
    label:
      "Aktivna",

    className:
      "text-emerald-600",
  };
}


function parseDate(
  value:
    | string
    | null
) {
  if (!value) {
    return null;
  }


  const date =
    new Date(
      value
    );


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatDate(
  value:
    | string
    | null
) {
  const date =
    parseDate(
      value
    );


  if (!date) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "hr-HR",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  ).format(
    date
  );
}


function formatDateTime(
  value:
    | string
    | null
) {
  const date =
    parseDate(
      value
    );


  if (!date) {
    return "Datum nije dostupan";
  }


  return new Intl.DateTimeFormat(
    "hr-HR",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
  );
}


function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "hr-HR",
    {
      style:
        "currency",

      currency:
        "EUR",
    }
  ).format(
    value
  );
}


function formatDuration(
  months: number
) {
  if (months === 1) {
    return "1 mjesec";
  }


  if (
    months >= 2 &&
    months <= 4
  ) {
    return `${months} mjeseca`;
  }


  return `${months} mjeseci`;
}


function paymentMethodLabel(
  method:
    | PaymentMethod
    | null
) {
  if (
    method === "cash"
  ) {
    return "Gotovina";
  }


  if (
    method === "card"
  ) {
    return "Kartica";
  }


  if (
    method ===
    "bank_transfer"
  ) {
    return "Bankovna uplata";
  }


  return "—";
}