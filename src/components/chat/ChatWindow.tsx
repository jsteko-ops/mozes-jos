"use client";

import {
  useEffect,
  useState,
} from "react";

import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import {
  getOrCreateChat,
  sendMessage,
  listenMessages,
} from "@/lib/services/chat/chatService";


type Props = {
  trainerId: string;
  clientId: string;
  currentUserId: string;
};


export default function ChatWindow({
  trainerId,
  clientId,
  currentUserId,
}: Props) {
  const [
    chatId,
    setChatId,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    let unsubscribe:
      | (() => void)
      | undefined;

    async function loadChat() {
      try {
        setLoading(true);

        const id =
          await getOrCreateChat(
            trainerId,
            clientId
          );

        setChatId(id);

        unsubscribe =
          listenMessages(
            id,
            (data) => {
              setMessages(
                data
              );

              setLoading(
                false
              );
            }
          );
      } catch (error) {
        console.error(
          "Greška kod učitavanja razgovora:",
          error
        );

        setLoading(false);
      }
    }


    void loadChat();


    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    trainerId,
    clientId,
  ]);


  async function handleSend(
    text: string
  ) {
    if (!chatId) {
      return;
    }

    await sendMessage(
      chatId,
      currentUserId,
      text
    );
  }


  if (loading) {
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
        <div
          className="
            border-b
            border-[#EEF0EC]
            bg-[#FBFCFA]
            p-5
          "
        >
          <div
            className="
              h-5
              w-36
              animate-pulse
              rounded
              bg-[#E9ECE6]
            "
          />

          <div
            className="
              mt-2
              h-3
              w-52
              animate-pulse
              rounded
              bg-[#F0F1EE]
            "
          />
        </div>


        <div
          className="
            space-y-4
            p-5
          "
        >
          <div
            className="
              h-16
              w-3/5
              animate-pulse
              rounded-2xl
              bg-[#F4F6F2]
            "
          />

          <div
            className="
              ml-auto
              h-16
              w-2/5
              animate-pulse
              rounded-2xl
              bg-[#E9ECE6]
            "
          />

          <div
            className="
              h-16
              w-1/2
              animate-pulse
              rounded-2xl
              bg-[#F4F6F2]
            "
          />
        </div>
      </div>
    );
  }


  return (
    <div
      className="
        space-y-3
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          px-5
          py-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#111317]
              text-lg
            "
          >
            💬
          </div>


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
              Razgovor
            </p>

            <h3
              className="
                mt-0.5
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Privatni chat
            </h3>
          </div>
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
            {messages.length}{" "}
            {messages.length === 1
              ? "poruka"
              : "poruka"}
          </span>
        </div>
      </div>


      {/* MESSAGES */}

      <ChatMessages
        messages={messages}
        currentUserId={
          currentUserId
        }
      />


      {/* INPUT */}

      <ChatInput
        onSendAction={
          handleSend
        }
      />

    </div>
  );
}