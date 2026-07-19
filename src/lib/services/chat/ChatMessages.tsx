"use client";

type Message = {
  id?: string;
  senderId: string;
  text: string;
  createdAt?: any;
  read?: boolean;
};

type Props = {
  messages: Message[];
  currentUserId: string;
};

export default function ChatMessages({
  messages,
  currentUserId,
}: Props) {
  return (
    <div className="border rounded-xl bg-white p-4 h-[500px] overflow-y-auto space-y-3">

      {messages.length === 0 && (
        <p className="text-center text-gray-500">
          Još nema poruka.
        </p>
      )}

      {messages.map((message) => {

        const mine =
          message.senderId === currentUserId;

        return (

          <div
            key={message.id}
            className={`flex ${
              mine
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[70%] rounded-xl px-4 py-2 ${
                mine
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
            >

              <p className="whitespace-pre-wrap">
                {message.text}
              </p>

              {message.createdAt?.toDate && (

                <p className="text-xs mt-2 opacity-70">

                  {message.createdAt
                    .toDate()
                    .toLocaleString("hr-HR")}

                </p>

              )}

            </div>

          </div>

        );

      })}

    </div>
  );
}