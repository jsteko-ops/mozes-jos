"use client";

import {
  useEffect,
  useState,
} from "react";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import ChatWindow from "@/components/chat/ChatWindow";
import ChatInbox from "@/components/chat/ChatInbox";
import ClientChatInbox from "@/components/chat/ClientChatInbox";

import {
  getClientByUserId,
} from "@/lib/services/klijentiService";


export default function ChatPage() {
  const {
    user,
    userProfile,
  } = useAuth();


  const [
    clientId,
    setClientId,
  ] = useState("");


  const [
    trainerId,
    setTrainerId,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    async function load() {
      if (
        !user ||
        !userProfile
      ) {
        return;
      }


      try {
        setLoading(true);


        // TRAINER

        if (
          userProfile.role ===
          "trainer"
        ) {
          setTrainerId(
            user.uid
          );
        }


        // CLIENT

        if (
          userProfile.role ===
          "client"
        ) {
          const client: any =
            await getClientByUserId(
              user.uid
            );


          if (client) {
            setClientId(
              client.id
            );

            setTrainerId(
              client.trainerId
            );
          }
        }
      } catch (error) {
        console.error(
          "Greška kod učitavanja chata:",
          error
        );
      } finally {
        setLoading(false);
      }
    }


    void load();
  }, [
    user,
    userProfile,
  ]);


  const isTrainer =
    userProfile?.role ===
    "trainer";


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
        "client",
      ]}
    >
      <div className="space-y-7">

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
              Komunikacija
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
              Chat
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
              Brza i privatna
              komunikacija između
              trenera i klijenta.
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
              py-2
            "
          >
            <span
              className="
                h-2
                w-2
                animate-pulse
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
              Poruke uživo
            </span>
          </div>
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


        {/* LOADING */}

        {loading && (
          <div
            className="
              grid
              gap-5
              xl:grid-cols-[360px_minmax(0,1fr)]
            "
          >
            <div
              className="
                h-80
                animate-pulse
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
              "
            />

            <div
              className="
                h-[650px]
                animate-pulse
                rounded-2xl
                border
                border-[#E5E7EB]
                bg-white
              "
            />
          </div>
        )}


        {/* CHAT */}

        {!loading && user && (
          <div
            className="
              grid
              min-w-0
              gap-5
              xl:grid-cols-[360px_minmax(0,1fr)]
            "
          >

            {/* INBOX */}

            <div className="min-w-0">

              {isTrainer ? (
                <ChatInbox
                  trainerId={
                    user.uid
                  }
                  onSelectChat={(
                    id
                  ) => {
                    setClientId(
                      id
                    );
                  }}
                />
              ) : (
                clientId && (
                  <ClientChatInbox
                    clientId={
                      clientId
                    }
                    onSelectChat={(
                      id
                    ) => {
                      setTrainerId(
                        id
                      );
                    }}
                  />
                )
              )}

            </div>


            {/* CONVERSATION */}

            <div className="min-w-0">

              {clientId &&
              trainerId ? (
                <ChatWindow
                  trainerId={
                    trainerId
                  }
                  clientId={
                    clientId
                  }
                  currentUserId={
                    user.uid
                  }
                />
              ) : (
                <div
                  className="
                    flex
                    min-h-[500px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
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
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#16A6A1]/10
                      text-2xl
                    "
                  >
                    💬
                  </div>

                  <h2
                    className="
                      mt-5
                      text-xl
                      font-black
                      text-[#15171A]
                    "
                  >
                    Odaberi razgovor
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#667085]
                    "
                  >
                    {isTrainer
                      ? "Odaberi klijenta s lijeve strane kako bi otvorio razgovor."
                      : "Razgovor s trenerom pojavit će se ovdje."}
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </RoleGuard>
  );
}