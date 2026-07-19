"use client";

import { useState } from "react";

type Props = {
  onSendAction: (text: string) => Promise<void>;
};

export default function ChatInput({
  onSendAction,
}: Props) {

  const [text, setText] =
    useState("");

  async function send() {

    const message =
      text.trim();

    if (!message) {
      return;
    }

    await onSendAction(message);

    setText("");

  }

  return (

    <div className="flex gap-3 mt-4">

      <input

        className="flex-1 border rounded-xl p-3"

        placeholder="Napiši poruku..."

        value={text}

        onChange={(e) =>
          setText(e.target.value)
        }

        onKeyDown={(e) => {

          if (e.key === "Enter") {

            e.preventDefault();

            send();

          }

        }}

      />

      <button

        className="bg-black text-white px-6 rounded-xl"

        onClick={send}

      >

        Pošalji

      </button>

    </div>

  );

}