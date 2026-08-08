"use client";

import {
  useState,
} from "react";


type Props = {
  onSendAction: (
    text: string
  ) => Promise<void>;
};


export default function ChatInput({
  onSendAction,
}: Props) {
  const [
    text,
    setText,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);


  async function send() {
    const cleanText =
      text.trim();

    if (
      !cleanText ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      await onSendAction(
        cleanText
      );

      setText("");
    } catch (error) {
      console.error(
        "Greška kod slanja poruke:",
        error
      );

      alert(
        "Poruka se nije mogla poslati."
      );
    } finally {
      setSending(false);
    }
  }


  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white
        p-3
        shadow-sm
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
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#16A6A1]/10
            text-lg
          "
        >
          💬
        </div>


        <input
          type="text"
          value={text}
          disabled={sending}
          placeholder="Napiši poruku..."
          onChange={(
            event
          ) =>
            setText(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              void send();
            }
          }}
          className="
            min-w-0
            flex-1
            rounded-xl
            border
            border-[#E5E7EB]
            bg-[#F8F9F7]
            px-4
            py-3
            text-sm
            text-[#15171A]
            outline-none
            transition
            placeholder:text-[#98A2B3]
            focus:border-[#16A6A1]
            focus:bg-white
            focus:ring-4
            focus:ring-[#16A6A1]/10
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />


        <button
          type="button"
          onClick={() =>
            void send()
          }
          disabled={
            sending ||
            !text.trim()
          }
          className="
            inline-flex
            min-h-11
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#111317]
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-[#202328]
            hover:shadow-md
            disabled:cursor-not-allowed
            disabled:opacity-40
            disabled:hover:translate-y-0
          "
        >
          {sending ? (
            <>
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-[#C8D52B]
                "
              />

              Šaljem...
            </>
          ) : (
            <>
              <span
                className="
                  font-black
                  text-[#C8D52B]
                "
              >
                ↑
              </span>

              Pošalji
            </>
          )}
        </button>
      </div>


      <p
        className="
          mt-2
          pl-[52px]
          text-[10px]
          text-[#98A2B3]
        "
      >
        Enter za slanje poruke
      </p>
    </div>
  );
}