"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  listenClientChats,
  markChatRead,
} from "@/lib/services/chat/chatService";


type Chat = {
  id: string;
  trainerId: string;
  clientId: string;
  lastMessage?: string;
  updatedAt?: any;
  unreadForClient?: boolean;
};


type Props = {
  clientId: string;

  onSelectChat: (
    trainerId: string
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


export default function ClientChatInbox({
  clientId,
  onSelectChat,
}: Props) {
  const [
    chats,
    setChats,
  ] =
    useState<Chat[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {
    const unsubscribe =
      listenClientChats(
        clientId,

        (data) => {
          setChats(
            data as Chat[]
          );

          setLoading(false);
        }
      );


    return () => {
      unsubscribe();
    };
  }, [clientId]);


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

        {[1, 2].map(
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
            Poruke trenera
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
            Poruke tvog trenera
            pojavit će se ovdje.
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
            (chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={
                  async () => {
                    await markChatRead(
                      chat.id,
                      "client"
                    );

                    onSelectChat(
                      chat.trainerId
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
                      chat.unreadForClient
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
                  TR


                  {chat.unreadForClient && (
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
                          chat.unreadForClient
                            ? "font-black"
                            : "font-bold"
                        }
                      `}
                    >
                      Trener
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
                        chat.unreadForClient
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
            )
          )}
        </div>
      )}

    </div>
  );
}