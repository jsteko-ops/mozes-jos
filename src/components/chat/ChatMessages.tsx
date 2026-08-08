"use client";

type Message = {
  id?: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

type Props = {
  messages: Message[];
  currentUserId: string;
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

  return date.toLocaleTimeString(
    "hr-HR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


export default function ChatMessages({
  messages,
  currentUserId,
}: Props) {
  return (
    <div
      className="
        h-[500px]
        space-y-4
        overflow-y-auto
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >

      {/* EMPTY */}

      {messages.length === 0 && (
        <div
          className="
            flex
            h-full
            min-h-72
            flex-col
            items-center
            justify-center
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

          <h3
            className="
              mt-4
              text-lg
              font-black
              text-[#15171A]
            "
          >
            Još nema poruka
          </h3>

          <p
            className="
              mt-2
              max-w-sm
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Započni razgovor slanjem
            prve poruke.
          </p>
        </div>
      )}


      {/* PORUKE */}

      {messages.map(
        (message) => {
          const isMine =
            message.senderId ===
            currentUserId;

          return (
            <div
              key={
                message.id ??
                `${message.senderId}-${message.text}`
              }
              className={
                isMine
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className="
                  max-w-[85%]
                  sm:max-w-[72%]
                "
              >

                <div
                  className={
                    isMine
                      ? `
                        rounded-2xl
                        rounded-br-md
                        bg-[#111317]
                        px-4
                        py-3
                        text-white
                        shadow-sm
                      `
                      : `
                        rounded-2xl
                        rounded-bl-md
                        border
                        border-[#E5E7EB]
                        bg-[#F4F6F2]
                        px-4
                        py-3
                        text-[#15171A]
                      `
                  }
                >
                  <p
                    className="
                      whitespace-pre-wrap
                      break-words
                      text-sm
                      leading-6
                    "
                  >
                    {message.text}
                  </p>
                </div>


                <div
                  className={`
                    mt-1.5
                    flex
                    items-center
                    gap-1.5
                    px-1

                    ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        isMine
                          ? "bg-[#C8D52B]"
                          : "bg-[#16A6A1]"
                      }
                    `}
                  />

                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-[#98A2B3]
                    "
                  >
                    {isMine
                      ? "Ti"
                      : "Sugovornik"}

                    {formatTime(
                      message.createdAt
                    ) &&
                      ` • ${formatTime(
                        message.createdAt
                      )}`}
                  </span>
                </div>

              </div>
            </div>
          );
        }
      )}

    </div>
  );
}