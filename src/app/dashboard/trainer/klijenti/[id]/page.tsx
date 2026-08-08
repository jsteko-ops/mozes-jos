"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import ChatWindow from "@/components/chat/ChatWindow";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import PremiumGuard from "@/components/auth/PremiumGuard";
import RoleGuard from "@/components/auth/RoleGuard";

import ClientPlans from "@/components/owner/ClientPlans";
import ClientEditForm from "@/components/clients/ClientEditForm";
import ClientTabs from "@/components/owner/ClientTabs";
import ClientNutrition from "@/components/nutrition/ClientNutrition";
import ClientMeasurements from "@/components/owner/ClientMeasurements";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  getCheckins,
  getClient,
} from "@/lib/services/klijentiService";


type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  note?: string;
};


export default function KlijentProfilPage() {
  const {
    user,
  } = useAuth();

  const params =
    useParams();

  const searchParams =
    useSearchParams();

  const id =
    params.id as string;

  const checkinId =
    searchParams.get(
      "checkinId"
    ) ??
    searchParams.get(
      "checkin"
    );


  const [
    client,
    setClient,
  ] =
    useState<Client | null>(
      null
    );

  const [
    checkins,
    setCheckins,
  ] =
    useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshCheckins,
    setRefreshCheckins,
  ] =
    useState(false);


  async function loadData() {
    if (!id) {
      return;
    }

    setLoading(true);

    try {
      const [
        clientData,
        checkinData,
      ] =
        await Promise.all([
          getClient(id),
          getCheckins(id),
        ]);

      setClient(
        clientData as Client
      );

      setCheckins(
        checkinData as any[]
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, [
    id,
    refreshCheckins,
  ]);


  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return "K";
    }

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .toUpperCase();
  };


  const profileContent =
    client ? (
      <ClientEditForm
        client={client}
        onSaved={() => {
          loadData();
        }}
      />
    ) : null;


  const measurementsContent = (
    <ClientMeasurements
      clientId={id}
    />
  );


  const plansContent = (
    <ClientPlans
      clientId={id}
    />
  );


  const nutritionContent = (
    <PremiumGuard>
      <ClientNutrition
        clientId={id}
      />
    </PremiumGuard>
  );


  const chatContent =
    user && client ? (
      <ChatWindow
        trainerId={user.uid}
        clientId={id}
        currentUserId={
          user.uid
        }
      />
    ) : null;


  const checkinContent = (
    <CheckinHistory
      clientId={id}
      checkins={checkins}
      targetCheckinId={
        checkinId
      }
      onReviewed={() => {
        setRefreshCheckins(
          (value) => !value
        );
      }}
    />
  );


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
      <div className="space-y-6">

        {/* HEADER */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[26px]
            border
            border-[#E5E7EB]
            bg-white
            p-6
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-40
              bg-gradient-to-bl
              from-[#C8D52B]/15
              via-transparent
              to-transparent
            "
          />


          <div
            className="
              relative
              z-10
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
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
                  bg-[#111317]
                  text-lg
                  font-black
                  tracking-wide
                  text-[#C8D52B]
                  shadow-lg
                  shadow-black/10
                "
              >
                {getInitials(
                  client?.name
                )}
              </div>


              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[#16A6A1]
                  "
                >
                  Profil klijenta
                </p>

                <h1
                  className="
                    mt-1
                    truncate
                    text-2xl
                    font-black
                    tracking-tight
                    text-[#15171A]
                    sm:text-3xl
                  "
                >
                  {loading
                    ? "Učitavanje..."
                    : client?.name ||
                      "Klijent"}
                </h1>

                {client?.email && (
                  <p
                    className="
                      mt-1
                      truncate
                      text-sm
                      text-[#667085]
                    "
                  >
                    {client.email}
                  </p>
                )}
              </div>
            </div>


            {!loading &&
              client && (
                <div
                  className="
                    flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#C8D52B]/40
                    bg-[#C8D52B]/10
                    px-3
                    py-2
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
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#5F6810]
                    "
                  >
                    Aktivan klijent
                  </span>
                </div>
              )}
          </div>


          <div
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-full
              bg-gradient-to-r
              from-[#C8D52B]
              via-[#16A6A1]
              to-transparent
            "
          />
        </section>


        {/* LOADING */}

        {loading ? (
          <div
            className="
              rounded-2xl
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
            "
          >
            <div
              className="
                h-5
                w-44
                animate-pulse
                rounded
                bg-[#E9ECE6]
              "
            />

            <div
              className="
                mt-4
                h-24
                animate-pulse
                rounded-xl
                bg-[#F4F6F2]
              "
            />
          </div>
        ) : (
          <ClientTabs
            profile={
              profileContent
            }
            measurements={
              measurementsContent
            }
            plans={
              plansContent
            }
            checkin={
              checkinContent
            }
            nutrition={
              nutritionContent
            }
            chat={
              chatContent
            }
          />
        )}

      </div>
    </RoleGuard>
  );
}