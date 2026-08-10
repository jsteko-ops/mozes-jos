"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGymMembers } from "@/lib/getGymMembers";


type StaffMember = {
  uid: string;

  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;

  gymRole?: string;

  trainerId?: string | null;

  membershipStatus?: string;
  membershipState?: string;

  membershipValidFrom?: any;
  membershipValidUntil?: any;

  membershipAmount?: number | null;
  membershipPlan?: string | null;
};


type MembershipStatus =
  | "active"
  | "expiring"
  | "expired"
  | "paused"
  | "none";


export default function StaffMembershipsPage() {
  const {
    userProfile,
    loading: authLoading,
  } = useAuth();


  const [
    members,
    setMembers,
  ] =
    useState<StaffMember[]>([]);


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
    search,
    setSearch,
  ] =
    useState("");


  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" | MembershipStatus
    >("all");


  useEffect(() => {
    let cancelled = false;


    async function loadMembers() {
      if (authLoading) {
        return;
      }


      if (!userProfile?.gymId) {
        if (!cancelled) {
          setMembers([]);

          setError(
            "Tvoj račun još nije povezan s teretanom."
          );

          setLoading(false);
        }

        return;
      }


      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
        }


        const result =
          await getGymMembers(
            userProfile.gymId
          );


        if (cancelled) {
          return;
        }


        const clients =
          result.filter(
            (member: any) =>
              member.gymRole ===
              "client"
          );


        setMembers(
          clients as StaffMember[]
        );
      } catch (loadError) {
        console.error(
          "Greška kod učitavanja članarina:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Članarine trenutno nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    void loadMembers();


    return () => {
      cancelled = true;
    };
  }, [
    userProfile,
    authLoading,
  ]);


  const stats =
    useMemo(() => {
      const result = {
        all: members.length,
        active: 0,
        expiring: 0,
        expired: 0,
        paused: 0,
        none: 0,
      };


      members.forEach(
        (member) => {
          const status =
            getMembershipStatus(
              member
            );

          result[status] += 1;
        }
      );


      return result;
    }, [members]);


  const visibleMembers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase(
            "hr"
          );


      return [...members]
        .filter(
          (member) => {
            const status =
              getMembershipStatus(
                member
              );


            if (
              filter !==
                "all" &&
              status !==
                filter
            ) {
              return false;
            }


            if (
              !normalizedSearch
            ) {
              return true;
            }


            const haystack = [
              member.name,
              member.displayName,
              member.email,
              member.phone,
            ]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase(
                "hr"
              );


            return haystack.includes(
              normalizedSearch
            );
          }
        )
        .sort(
          (a, b) =>
            getMemberName(a)
              .localeCompare(
                getMemberName(b),
                "hr"
              )
        );
    }, [
      members,
      filter,
      search,
    ]);


  return (
    <RoleGuard
      allowedRoles={[
        "gym_staff",
      ]}
    >
      <div className="space-y-6">

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
              Članarine
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
              Provjeri status članstva,
              vidi kome članarina uskoro
              istječe i evidentiraj uplate
              na recepciji.
            </p>
          </div>


          <Link
            href="/dashboard/staff/clients/new"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#111317]
              px-5
              py-3
              text-sm
              font-black
              text-white
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#202328]
            "
          >
            <span
              className="
                text-[#C8D52B]
              "
            >
              +
            </span>

            Novi član
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


        {/* INFO */}

        <section
          className="
            rounded-[24px]
            bg-[#111317]
            p-6
            text-white
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#C8D52B]
                "
              >
                Evidencija uplata
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                "
              >
                Gotovina, kartica ili
                transakcija
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
                Svaka uplata bit će
                spremljena s datumom,
                iznosom, načinom plaćanja
                i djelatnikom koji ju je
                evidentirao.
              </p>
            </div>


            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]
                text-xl
                font-black
                text-[#111317]
              "
            >
              €
            </div>
          </div>
        </section>


        {/* STATS */}

        {!loading &&
          !error && (
            <section
              className="
                grid
                gap-3
                sm:grid-cols-2
                xl:grid-cols-5
              "
            >
              <StatCard
                label="Svi članovi"
                value={
                  stats.all
                }
                active={
                  filter ===
                  "all"
                }
                onClick={() =>
                  setFilter(
                    "all"
                  )
                }
              />

              <StatCard
                label="Aktivne"
                value={
                  stats.active
                }
                color="green"
                active={
                  filter ===
                  "active"
                }
                onClick={() =>
                  setFilter(
                    "active"
                  )
                }
              />

              <StatCard
                label="Uskoro istječu"
                value={
                  stats.expiring
                }
                color="amber"
                active={
                  filter ===
                  "expiring"
                }
                onClick={() =>
                  setFilter(
                    "expiring"
                  )
                }
              />

              <StatCard
                label="Istekle"
                value={
                  stats.expired
                }
                color="red"
                active={
                  filter ===
                  "expired"
                }
                onClick={() =>
                  setFilter(
                    "expired"
                  )
                }
              />

              <StatCard
                label="Bez članarine"
                value={
                  stats.none
                }
                color="gray"
                active={
                  filter ===
                  "none"
                }
                onClick={() =>
                  setFilter(
                    "none"
                  )
                }
              />
            </section>
          )}


        {/* SEARCH */}

        {!loading &&
          !error && (
            <section
              className="
                rounded-[22px]
                border
                border-[#E5E7EB]
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                "
              >
                <div
                  className="
                    relative
                    flex-1
                  "
                >
                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#98A2B3]
                    "
                  >
                    🔎
                  </span>

                  <input
                    type="search"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Pretraži ime, email ili telefon..."
                    className="
                      min-h-12
                      w-full
                      rounded-xl
                      border
                      border-[#E5E7EB]
                      bg-[#F7F8F5]
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      font-semibold
                      text-[#15171A]
                      outline-none
                      transition
                      placeholder:text-[#98A2B3]
                      focus:border-[#16A6A1]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#16A6A1]/10
                    "
                  />
                </div>


                {filter !==
                  "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilter(
                        "all"
                      )
                    }
                    className="
                      min-h-12
                      rounded-xl
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-[#344054]
                    "
                  >
                    Ukloni filter
                  </button>
                )}
              </div>
            </section>
          )}


        {/* LOADING */}

        {loading && (
          <div
            className="
              space-y-3
            "
          >
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-32
                    animate-pulse
                    rounded-[22px]
                    border
                    border-[#E5E7EB]
                    bg-white
                  "
                />
              )
            )}
          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <div
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-5
                text-sm
                font-semibold
                text-red-700
              "
            >
              {error}
            </div>
          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          visibleMembers.length ===
            0 && (
            <section
              className="
                rounded-[26px]
                border
                border-dashed
                border-[#D8DDD0]
                bg-white
                px-6
                py-12
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#C8D52B]/15
                  text-2xl
                "
              >
                💳
              </div>

              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Nema članarina za prikaz
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-[#667085]
                "
              >
                Promijeni filter ili
                dodaj novog člana.
              </p>
            </section>
          )}


        {/* MEMBERS */}

        {!loading &&
          !error &&
          visibleMembers.length >
            0 && (
            <section
              className="
                space-y-3
              "
            >
              {visibleMembers.map(
                (member) => (
                  <MembershipRow
                    key={
                      member.uid
                    }
                    member={
                      member
                    }
                  />
                )
              )}
            </section>
          )}

      </div>
    </RoleGuard>
  );
}


function StatCard({
  label,
  value,
  color = "dark",
  active,
  onClick,
}: {
  label: string;
  value: number;

  color?:
    | "dark"
    | "green"
    | "amber"
    | "red"
    | "gray";

  active: boolean;

  onClick: () => void;
}) {
  const valueColor =
    color === "green"
      ? "text-emerald-600"
      : color === "amber"
        ? "text-amber-600"
        : color === "red"
          ? "text-red-600"
          : color === "gray"
            ? "text-[#98A2B3]"
            : "text-[#15171A]";


  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        rounded-[20px]
        border
        bg-white
        p-4
        text-left
        shadow-sm
        transition
        ${
          active
            ? "border-[#16A6A1] ring-4 ring-[#16A6A1]/10"
            : "border-[#E5E7EB] hover:border-[#C8D52B]"
        }
      `}
    >
      <div
        className={`
          text-2xl
          font-black
          ${valueColor}
        `}
      >
        {value}
      </div>

      <div
        className="
          mt-1
          text-[11px]
          font-bold
          uppercase
          tracking-[0.08em]
          text-[#98A2B3]
        "
      >
        {label}
      </div>
    </button>
  );
}


function MembershipRow({
  member,
}: {
  member: StaffMember;
}) {
  const status =
    getMembershipStatus(
      member
    );


  const statusInfo =
    getStatusInfo(
      status
    );


  const validUntil =
    toDate(
      member.membershipValidUntil
    );


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
            min-w-0
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
            {getInitials(
              getMemberName(
                member
              )
            )}
          </div>


          <div
            className="
              min-w-0
            "
          >
            <h2
              className="
                truncate
                text-base
                font-black
                text-[#15171A]
              "
            >
              {getMemberName(
                member
              )}
            </h2>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-[#667085]
              "
            >
              {member.email ||
                member.phone ||
                "Kontakt nije unesen"}
            </p>
          </div>
        </div>


        <div
          className="
            grid
            flex-1
            gap-3
            sm:grid-cols-3
            lg:max-w-xl
          "
        >
          <Info
            label="Status"
            value={
              statusInfo.label
            }
            valueClassName={
              statusInfo.className
            }
          />

          <Info
            label="Vrijedi do"
            value={
              validUntil
                ? formatDate(
                    validUntil
                  )
                : "—"
            }
          />

          <Info
            label="Zadnji iznos"
            value={
              typeof member.membershipAmount ===
              "number"
                ? `${member.membershipAmount.toFixed(
                    2
                  )} €`
                : "—"
            }
          />
        </div>


        <button
          type="button"
          disabled
          title="Spajamo sigurno serversko evidentiranje uplata u sljedećem koraku."
          className="
            inline-flex
            min-h-12
            shrink-0
            cursor-not-allowed
            items-center
            justify-center
            rounded-xl
            bg-[#C8D52B]
            px-5
            py-3
            text-sm
            font-black
            text-[#111317]
            opacity-60
          "
        >
          + Evidentiraj uplatu
        </button>
      </div>
    </div>
  );
}


function Info({
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
        rounded-xl
        bg-[#F7F8F5]
        px-4
        py-3
      "
    >
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.08em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-sm
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


function getMemberName(
  member: StaffMember
) {
  return (
    member.name ||
    member.displayName ||
    member.email ||
    "Član"
  );
}


function getMembershipStatus(
  member: StaffMember
): MembershipStatus {
  if (
    member.membershipState ===
      "paused" ||
    member.membershipStatus ===
      "paused"
  ) {
    return "paused";
  }


  const validUntil =
    toDate(
      member.membershipValidUntil
    );


  if (!validUntil) {
    return "none";
  }


  const now =
    new Date();


  const endOfToday =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );


  if (
    validUntil <
    endOfToday
  ) {
    return "expired";
  }


  const warningDate =
    new Date(
      endOfToday
    );

  warningDate.setDate(
    warningDate.getDate() +
      14
  );


  if (
    validUntil <=
    warningDate
  ) {
    return "expiring";
  }


  return "active";
}


function getStatusInfo(
  status: MembershipStatus
) {
  switch (status) {
    case "active":
      return {
        label:
          "Aktivna",
        className:
          "text-emerald-600",
      };

    case "expiring":
      return {
        label:
          "Uskoro istječe",
        className:
          "text-amber-600",
      };

    case "expired":
      return {
        label:
          "Istekla",
        className:
          "text-red-600",
      };

    case "paused":
      return {
        label:
          "Zamrznuta",
        className:
          "text-blue-600",
      };

    default:
      return {
        label:
          "Nije postavljena",
        className:
          "text-[#98A2B3]",
      };
  }
}


function toDate(
  value: any
): Date | null {
  if (!value) {
    return null;
  }


  if (
    value instanceof Date
  ) {
    return value;
  }


  if (
    typeof value?.toDate ===
    "function"
  ) {
    return value.toDate();
  }


  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }
  }


  return null;
}


function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}


function getInitials(
  name: string
) {
  return (
    name
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