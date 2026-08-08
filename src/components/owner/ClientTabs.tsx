"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";


type Props = {
  profile: React.ReactNode;
  measurements: React.ReactNode;
  plans: React.ReactNode;
  checkin?: React.ReactNode;
  nutrition?: React.ReactNode;
  chat?: React.ReactNode;
};


export default function ClientTabs({
  profile,
  measurements,
  plans,
  checkin,
  nutrition,
  chat,
}: Props) {
  const searchParams =
    useSearchParams();

  const [
    active,
    setActive,
  ] = useState("profile");


  const tabs = [
    {
      id: "profile",
      name: "Profil",
      icon: "👤",
      content: profile,
    },

    {
      id: "measurements",
      name: "Mjerenja",
      icon: "📏",
      content: measurements,
    },

    {
      id: "plans",
      name: "Planovi",
      icon: "🏋️",
      content: plans,
    },

    ...(checkin
      ? [
          {
            id: "checkin",
            name: "Check-in",
            icon: "✓",
            content: checkin,
          },
        ]
      : []),

    ...(nutrition
      ? [
          {
            id: "nutrition",
            name: "Prehrana",
            icon: "🥗",
            content: nutrition,
          },
        ]
      : []),

    ...(chat
      ? [
          {
            id: "chat",
            name: "Chat",
            icon: "💬",
            content: chat,
          },
        ]
      : []),
  ];


  useEffect(() => {
    const tab =
      searchParams.get("tab");

    if (
      tab &&
      tabs.some(
        (item) =>
          item.id === tab
      )
    ) {
      setActive(tab);
    }
  }, [searchParams]);


  const current =
    tabs.find(
      (tab) =>
        tab.id === active
    ) ?? tabs[0];


  return (
    <div className="mt-6 space-y-5">

      {/* TAB NAVIGATION */}

      <div
        className="
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-2
          shadow-sm
        "
      >
        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-1
            sm:flex-wrap
            sm:overflow-visible
            sm:pb-0
          "
        >
          {tabs.map(
            (tab) => {
              const isActive =
                active ===
                tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActive(
                      tab.id
                    )
                  }
                  className={`
                    group
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? `
                          bg-[#111317]
                          text-white
                          shadow-sm
                        `
                        : `
                          bg-transparent
                          text-[#667085]
                          hover:bg-[#F4F6F2]
                          hover:text-[#15171A]
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      text-sm
                      transition
                      ${
                        isActive
                          ? `
                            bg-[#C8D52B]
                            text-[#111317]
                          `
                          : `
                            bg-[#F4F6F2]
                            text-[#667085]
                            group-hover:bg-white
                          `
                      }
                    `}
                  >
                    {tab.icon}
                  </span>

                  <span>
                    {tab.name}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>


      {/* ACTIVE TAB INDICATOR */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            h-1
            w-10
            rounded-full
            bg-[#C8D52B]
          "
        />

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.15em]
            text-[#16A6A1]
          "
        >
          {current?.name}
        </p>
      </div>


      {/* CONTENT */}

      <div className="min-w-0">
        {current?.content ? (
          current.content
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D8DDD0]
              bg-white
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
                bg-[#C8D52B]/15
                text-xl
              "
            >
              🚀
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Modul uskoro dolazi
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-[#667085]
              "
            >
              Ova funkcionalnost
              još nije dostupna.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}