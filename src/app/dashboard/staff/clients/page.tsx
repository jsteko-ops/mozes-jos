"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  getGymMembers,
} from "@/lib/getGymMembers";


type StaffClient = {
  uid: string;

  name?: string;

  displayName?: string;

  email?: string;

  phone?: string;

  gymRole?: string;

  trainerId?: string | null;
trainerName?: string | null;

  membershipStatus?: string;

  membershipState?: string;

  membershipValidUntil?: any;

  membershipAmount?: number | null;
};


export default function StaffClientsPage() {
  const {
    userProfile,
    loading: authLoading,
  } = useAuth();


  const [
    clients,
    setClients,
  ] =
    useState<StaffClient[]>([]);


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
membershipFilter,
setMembershipFilter,
] =
useState<
  | "all"
  | "active"
  | "expiring"
  | "expired"
  | "none"
  | "paused"
>("all");

const [
trainerFilter,
setTrainerFilter,
] =
useState<
  | "all"
  | "with"
  | "without"
>("all");


const sortedClients =
useMemo(
() => {
  const cleanSearch =
    search
      .trim()
      .toLocaleLowerCase(
        "hr"
      );


  return [...clients]
    .filter(
      (
        client
      ) => {
        if (
          cleanSearch
        ) {
          const searchableText =
            [
              getClientName(
                client
              ),

              client.email ||
                "",

              client.phone ||
                "",
            ]
              .join(" ")
              .toLocaleLowerCase(
                "hr"
              );


          if (
            !searchableText.includes(
              cleanSearch
            )
          ) {
            return false;
          }
        }


        if (
          trainerFilter ===
            "with" &&
          !client.trainerId
        ) {
          return false;
        }


        if (
          trainerFilter ===
            "without" &&
          client.trainerId
        ) {
          return false;
        }


        if (
          membershipFilter !==
          "all"
        ) {
          const membership =
            getMembershipLabel(
              client
            );


          const statusMatches =
            membershipFilter ===
              "active"
              ? membership.label ===
                "Aktivna"

              : membershipFilter ===
                  "expiring"
                ? membership.label ===
                  "Uskoro istječe"

                : membershipFilter ===
                    "expired"
                  ? membership.label ===
                    "Istekla"

                  : membershipFilter ===
                      "none"
                    ? membership.label ===
                      "Nije postavljena"

                    : membershipFilter ===
                        "paused"
                      ? membership.label ===
                        "Zamrznuta"

                      : true;


          if (
            !statusMatches
          ) {
            return false;
          }
        }


        return true;
      }
    )
    .sort(
      (
        a,
        b
      ) =>
        getClientName(
          a
        ).localeCompare(
          getClientName(
            b
          ),
          "hr"
        )
    );
},
[
  clients,
  search,
  membershipFilter,
  trainerFilter,
]
);

  useEffect(() => {
    let cancelled =
      false;


    async function loadClients() {
      if (authLoading) {
        return;
      }


      if (
        !userProfile?.gymId
      ) {
        if (!cancelled) {
          setClients([]);

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


        const members =
          await getGymMembers(
            userProfile.gymId
          );


        if (cancelled) {
          return;
        }


      const trainerNames =
  new Map<string, string>(
    members
      .filter(
        (member: any) =>
          member.gymRole ===
          "trainer"
      )
 .map(
  (trainer: any) => {
    const firstName =
      typeof trainer.firstName ===
        "string"
        ? trainer.firstName.trim()
        : "";

    const lastName =
      typeof trainer.lastName ===
        "string"
        ? trainer.lastName.trim()
        : "";

    const fullName =
      [firstName, lastName]
        .filter(Boolean)
        .join(" ");

    return [
      String(trainer.uid),
      trainer.name ||
        trainer.displayName ||
        fullName ||
        trainer.email ||
        "Trener",
    ];
  }
)
  );


const onlyClients =
  members
    .filter(
      (member: any) =>
        member.gymRole ===
        "client"
    )
    .map(
      (member: any) => ({
        ...member,
        trainerName:
          member.trainerId
            ? trainerNames.get(
                String(
                  member.trainerId
                )
              ) ?? null
            : null,
      })
    );


setClients(
  onlyClients as StaffClient[]
);
      } catch (loadError) {
        console.error(
          "Greška kod učitavanja članova:",
          loadError
        );


        if (!cancelled) {
          setError(
            "Članove trenutno nije moguće učitati."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    void loadClients();


    return () => {
      cancelled = true;
    };
  }, [
    userProfile,
    authLoading,
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
              Članovi teretane
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
              Pregled članova, statusa
              članarine i dodijeljenog
              trenera.
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


        {/* SUMMARY */}

        {!loading &&
          !error && (
            <section
              className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              <SummaryCard
                label="Ukupno članova"
                value={
                  clients.length
                }
                color="lime"
              />

              <SummaryCard
                label="S trenerom"
                value={
                  clients.filter(
                    (client) =>
                      !!client.trainerId
                  ).length
                }
                color="teal"
              />

              <SummaryCard
                label="Samostalni"
                value={
                  clients.filter(
                    (client) =>
                      !client.trainerId
                  ).length
                }
                color="dark"
              />
            </section>
          )}


        {/* LOADING */}

        {loading && (
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-52
                    animate-pulse
                    rounded-[24px]
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
          clients.length === 0 && (
            <section
              className="
                rounded-[28px]
                border
                border-dashed
                border-[#D8DDD0]
                bg-white
                px-6
                py-14
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
                👥
              </div>

              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-[#15171A]
                "
              >
                Još nema članova
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
                Dodaj prvog člana
                teretane. Član može
                imati trenera ili
                vježbati samostalno.
              </p>

              <Link
                href="/dashboard/staff/clients/new"
                className="
                  mt-6
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#111317]
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                "
              >
                + Novi član
              </Link>
            </section>
          )}

{/* FILTERS */}

{!loading &&
  !error &&
  clients.length > 0 && (
    <section
      className="
        rounded-[24px]
        border
        border-[#E5E7EB]
        bg-white
        p-4
        shadow-sm
      "
    >
      <div
        className="
          grid
          gap-3
          lg:grid-cols-[1fr_220px_200px]
        "
      >
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
          placeholder="Pretraži po imenu, e-mailu ili telefonu..."
          className="
            min-h-12
            w-full
            rounded-xl
            border
            border-[#D0D5DD]
            bg-white
            px-4
            text-sm
            font-semibold
            text-[#15171A]
            outline-none
            transition
            placeholder:text-[#98A2B3]
            focus:border-[#16A6A1]
            focus:ring-2
            focus:ring-[#16A6A1]/15
          "
        />

        <select
          value={
            membershipFilter
          }
          onChange={(
            event
          ) =>
            setMembershipFilter(
              event.target.value as
                | "all"
                | "active"
                | "expiring"
                | "expired"
                | "none"
                | "paused"
            )
          }
          className="
            min-h-12
            rounded-xl
            border
            border-[#D0D5DD]
            bg-white
            px-4
            text-sm
            font-bold
            text-[#344054]
            outline-none
            focus:border-[#16A6A1]
          "
        >
          <option value="all">
            Sve članarine
          </option>

          <option value="active">
            Aktivne
          </option>

          <option value="expiring">
            Uskoro istječu
          </option>

          <option value="expired">
            Istekle
          </option>

          <option value="none">
            Bez članarine
          </option>

          <option value="paused">
            Zamrznute
          </option>
        </select>

        <select
          value={
            trainerFilter
          }
          onChange={(
            event
          ) =>
            setTrainerFilter(
              event.target.value as
                | "all"
                | "with"
                | "without"
            )
          }
          className="
            min-h-12
            rounded-xl
            border
            border-[#D0D5DD]
            bg-white
            px-4
            text-sm
            font-bold
            text-[#344054]
            outline-none
            focus:border-[#16A6A1]
          "
        >
          <option value="all">
            Svi treneri
          </option>

          <option value="with">
            S trenerom
          </option>

          <option value="without">
            Bez trenera
          </option>
        </select>
      </div>

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        "
      >
        <p
          className="
            text-xs
            font-bold
            text-[#667085]
          "
        >
          Prikazano{" "}
      <span className="text-[#15171A]">
        {sortedClients.length}
      </span>{" "}
      od{" "}
      <span className="text-[#15171A]">
        {clients.length}
      </span>{" "}
      članova
    </p>

    {(search ||
      membershipFilter !== "all" ||
      trainerFilter !== "all") && (
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setMembershipFilter("all");
          setTrainerFilter("all");
        }}
        className="
          text-xs
          font-black
          text-[#16A6A1]
          transition
          hover:text-[#0F7F7B]
        "
      >
        Poništi filtere
      </button>
    )}
  </div>
</section>
)}

{/* CLIENTS */}

{!loading &&
  !error &&
  clients.length > 0 &&
  sortedClients.length === 0 && (
    <section
      className="
        rounded-[24px]
        border
        border-dashed
        border-[#D8DDD0]
        bg-white
        px-6
        py-12
        text-center
      "
    >
      <p
        className="
          text-lg
          font-black
          text-[#15171A]
        "
      >
        Nema rezultata
      </p>

      <p
        className="
          mt-2
          text-sm
          text-[#667085]
        "
      >
        Nijedan član ne odgovara odabranoj pretrazi ili filterima.
      </p>

      <button
        type="button"
        onClick={() => {
          setSearch("");
          setMembershipFilter("all");
          setTrainerFilter("all");
        }}
        className="
          mt-5
          rounded-xl
          bg-[#111317]
          px-5
          py-3
          text-sm
          font-black
          text-white
        "
      >
        Poništi filtere
      </button>
    </section>
  )}


        {!loading &&
          !error &&
          sortedClients.length >
            0 && (
            <section
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {sortedClients.map(
                (client) => (
                  <ClientCard
                    key={
                      client.uid
                    }
                    client={
                      client
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


function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color:
    | "lime"
    | "teal"
    | "dark";
}) {
  const colorClass =
    color === "lime"
      ? "bg-[#C8D52B] text-[#111317]"
      : color === "teal"
        ? "bg-[#16A6A1] text-white"
        : "bg-[#111317] text-white";


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
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          text-base
          font-black
          ${colorClass}
        `}
      >
        {value}
      </div>

      <p
        className="
          mt-4
          text-xs
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#98A2B3]
        "
      >
        {label}
      </p>
    </div>
  );
}


function ClientCard({
  client,
}: {
  client: StaffClient;
}) {
  const name =
    getClientName(client);


  const membership =
    getMembershipLabel(
      client
    );


  return (
    <div
      className="
        rounded-[24px]
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
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
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
              name
            )}
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate
                text-base
                font-black
                text-[#15171A]
              "
            >
              {name}
            </h2>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-[#667085]
              "
            >
              {client.email ||
                "Email nije unesen"}
            </p>
          </div>
        </div>
      </div>


      <div
        className="
          mt-5
          space-y-3
          border-t
          border-[#F0F1EE]
          pt-4
        "
      >
   <Row
  label="Trener"
  value={
    client.trainerId
      ? client.trainerName || "Dodijeljen"
      : "Bez trenera"
  }
/>

        <Row
          label="Članarina"
          value={
            membership.label
          }
          valueClassName={
            membership.className
          }
        />
      </div>


      <Link
        href={`/dashboard/staff/clients/${client.uid}`}
        className="
          mt-5
          inline-flex
          w-full
          items-center
          justify-center
          rounded-xl
          border
          border-[#E5E7EB]
          bg-[#F7F8F5]
          px-4
          py-3
          text-sm
          font-black
          text-[#15171A]
          transition
          hover:border-[#16A6A1]
          hover:bg-white
        "
      >
        Otvori člana →
      </Link>
    </div>
  );
}


function Row({
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
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <span
        className="
          text-xs
          font-semibold
          text-[#98A2B3]
        "
      >
        {label}
      </span>

      <span
        className={`
          text-right
          text-xs
          font-black
          text-[#15171A]
          ${valueClassName}
        `}
      >
        {value}
      </span>
    </div>
  );
}


function getClientName(
  client: StaffClient
) {
  return (
    client.name ||
    client.displayName ||
    client.email ||
    "Član"
  );
}


function getInitials(
  name: string
) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .toUpperCase() || "Č";
}


function getMembershipLabel(
  client: StaffClient
) {
  if (
    client.membershipState === "paused" ||
    client.membershipStatus === "paused"
  ) {
    return {
      label: "Zamrznuta",
      className: "text-amber-600",
    };
  }


  const validUntil =
    toMembershipDate(
      client.membershipValidUntil
    );


  if (!validUntil) {
    return {
      label: "Nije postavljena",
      className: "text-[#98A2B3]",
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


  const expiryDate =
    new Date(
      Date.UTC(
        validUntil.getUTCFullYear(),
        validUntil.getUTCMonth(),
        validUntil.getUTCDate()
      )
    );


  if (expiryDate < today) {
    return {
      label: "Istekla",
      className: "text-red-600",
    };
  }


  const warningDate =
    new Date(today);

  warningDate.setUTCDate(
    warningDate.getUTCDate() + 14
  );


  if (expiryDate <= warningDate) {
    return {
      label: "Uskoro istječe",
      className: "text-amber-600",
    };
  }


  return {
    label: "Aktivna",
    className: "text-emerald-600",
  };
}


function toMembershipDate(
  value: any
): Date | null {
  if (!value) {
    return null;
  }


  if (value instanceof Date) {
    return value;
  }


  if (
    typeof value?.toDate === "function"
  ) {
    return value.toDate();
  }


  if (
    typeof value === "string" ||
    typeof value === "number"
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
