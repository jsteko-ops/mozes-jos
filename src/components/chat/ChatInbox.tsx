"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  listenTrainerChats,
  markChatRead,
} from "@/lib/services/chat/chatService";

import {
  getClient,
} from "@/lib/services/klijentiService";


type Chat = {
  id: string;
  clientId: string;
  trainerId: string;
  lastMessage?: string;
  updatedAt?: any;
  unreadForTrainer?: boolean;
};


type Props = {
  trainerId: string;

  onSelectChat: (
    clientId: string
  ) => void;
};


function formatTime(
  value: any
) {
  if (!value) {
    return "";
  }

  const date =
    typeof value.toDate ===
    "function"
      ? value.toDate()
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const today =
    new Date();

  const sameDay =
    date.getDate() ===
      today.getDate() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getFullYear() ===
      today.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString(
      "hr-HR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return date.toLocaleDateString(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  );
}


function getInitials(
  name?: string
) {
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
}


export default function ChatInbox({
  trainerId,
  onSelectChat,
}: Props) {
  const [
    chats,
    setChats,
  ] =
    useState<Chat[]>([]);


  const [
    clientNames,
    setClientNames,
  ] =
    useState<
      Record<string, string>
    >({});


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {
    const unsubscribe =
      listenTrainerChats(
        trainerId,

        async (data) => {
          const chatData =
            data as Chat[];

          setChats(
            chatData
          );


          const names:
            Record<
              string,
              string
            > = {};


          await Promise.all(
            chatData.map(
              async (chat) => {
                const client =
                  await getClient(
                    chat.clientId
                  );

                if (client) {
                  names[
                    chat.clientId
                  ] =
                    client.name ||
                    "Klijent";
                }
              }
            )
          );


          setClientNames(
            names
          );

          setLoading(false);
        }
      );


    return () => {
      unsubscribe();
    };
  }, [trainerId]);


  if (loading) {
    return (
      <div
        className="
          space-y-3
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-5
          shadow-sm
        "
      >
        <div
          className="
            h-5
            w-32
            animate-pulse
            rounded
            bg-[#E9ECE6]
          "
        />

        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                h-20
                animate-pulse
                rounded-xl
                bg-[#F4F6F2]
              "
            />
          )
        )}
      </div>
    );
  }


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
          items-center
          justify-between
          gap-4
          border-b
          border-[#EEF0EC]
          bg-[#FBFCFA]
          px-5
          py-4
        "
      >
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
            Inbox
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-black
              text-[#15171A]
            "
          >
            Poruke klijenata
          </h2>
        </div>


        <div
          className="
            rounded-full
            bg-[#C8D52B]/15
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-[#5F6810]
          "
        >
          {chats.length}{" "}
          {chats.length === 1
            ? "razgovor"
            : "razgovora"}
        </div>
      </div>


      {/* EMPTY */}

      {chats.length === 0 && (
        <div
          className="
            px-6
            py-12
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
              bg-[#16A6A1]/10
              text-xl
            "
          >
            💬
          </div>

          <h3
            className="
              mt-4
              text-lg
              font-black
              text-[#15171A]
            "
          >
            Nema razgovora
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-[#667085]
            "
          >
            Novi razgovori s
            klijentima pojavit će se
            ovdje.
          </p>
        </div>
      )}


      {/* CHAT LIST */}

      {chats.length > 0 && (
        <div
          className="
            divide-y
            divide-[#EEF0EC]
          "
        >
          {chats.map(
            (chat) => {
              const name =
                clientNames[
                  chat.clientId
                ] ||
                "Klijent";


              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={
                    async () => {
                      await markChatRead(
                        chat.id,
                        "trainer"
                      );

                      onSelectChat(
                        chat.clientId
                      );
                    }
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-[#F8F9F7]
                  "
                >

                  {/* AVATAR */}

                  <div
                    className={`
                      relative
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      text-sm
                      font-black
                      tracking-wide

                      ${
                        chat.unreadForTrainer
                          ? `
                            bg-[#111317]
                            text-[#C8D52B]
                          `
                          : `
                            bg-[#F4F6F2]
                            text-[#667085]
                          `
                      }
                    `}
                  >
                    {getInitials(
                      name
                    )}


                    {chat.unreadForTrainer && (
                      <span
                        className="
                          absolute
                          -right-1
                          -top-1
                          h-3
                          w-3
                          rounded-full
                          border-2
                          border-white
                          bg-[#C8D52B]
                        "
                      />
                    )}
                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <p
                        className={`
                          truncate
                          text-sm
                          text-[#15171A]

                          ${
                            chat.unreadForTrainer
                              ? "font-black"
                              : "font-bold"
                          }
                        `}
                      >
                        {name}
                      </p>


                      {formatTime(
                        chat.updatedAt
                      ) && (
                        <span
                          className="
                            shrink-0
                            text-[10px]
                            font-medium
                            text-[#98A2B3]
                          "
                        >
                          {formatTime(
                            chat.updatedAt
                          )}
                        </span>
                      )}
                    </div>


                    <p
                      className={`
                        mt-1
                        truncate
                        text-xs

                        ${
                          chat.unreadForTrainer
                            ? `
                              font-semibold
                              text-[#15171A]
                            `
                            : `
                              text-[#667085]
                            `
                        }
                      `}
                    >
                      {chat.lastMessage ??
                        "Nema poruke"}
                    </p>
                  </div>


                  {/* ARROW */}

                  <span
                    className="
                      shrink-0
                      font-black
                      text-[#16A6A1]
                      transition-transform
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </button>
              );
            }
          )}
        </div>
      )}

    </div>
  );
}