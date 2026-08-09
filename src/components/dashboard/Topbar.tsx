"use client";

import {
  User,
} from "firebase/auth";

import NotificationBell from "@/components/notifications/NotificationBell";


export default function Topbar({
  user,
  onMenuClick,
  mobileMenuOpen,
}: {
  user: User | null;
  onMenuClick: () => void;
  mobileMenuOpen: boolean;
}) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-black/5
        bg-white/95
        backdrop-blur
      "
    >
      <div
        className="
          flex
          h-16
          items-center
          justify-between
          gap-3
          px-4
          sm:px-6
          lg:px-8
        "
      >

        {/* LEFT */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Zatvori navigaciju"
                : "Otvori navigaciju"
            }
            aria-expanded={
              mobileMenuOpen
            }
            onClick={
              onMenuClick
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              text-[#15171A]
              shadow-sm
              transition
              hover:border-[#C8D52B]
              hover:bg-[#F7F8F5]
              active:scale-95
              lg:hidden
            "
          >
            <span
              className="
                flex
                h-5
                w-5
                flex-col
                items-center
                justify-center
                gap-[4px]
              "
            >
              <span
                className="
                  block
                  h-[2px]
                  w-5
                  rounded-full
                  bg-[#15171A]
                "
              />

              <span
                className="
                  block
                  h-[2px]
                  w-5
                  rounded-full
                  bg-[#15171A]
                "
              />

              <span
                className="
                  block
                  h-[2px]
                  w-5
                  rounded-full
                  bg-[#15171A]
                "
              />
            </span>
          </button>


          {/* USER */}

          <div className="min-w-0">

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#16A6A1]
                sm:text-[11px]
              "
            >
              Možeš Još
            </p>


            <p
              className="
                max-w-[150px]
                truncate
                text-xs
                font-medium
                text-[#667085]
                sm:max-w-[280px]
                sm:text-sm
              "
            >
              {user?.email ??
                "Učitavanje korisnika..."}
            </p>

          </div>
        </div>


        {/* RIGHT */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >

          {/* NOTIFICATIONS */}

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              shadow-sm
            "
          >
            <NotificationBell />
          </div>


          {/* BRAND PILL */}

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              bg-[#111317]
              px-3
              py-2
              sm:flex
            "
          >
            <span
              className="
                h-2.5
                w-2.5
                rounded-full
                bg-[#C8D52B]
              "
            />


            <span
              className="
                text-xs
                font-bold
                tracking-wide
                text-white
              "
            >
              MOŽEŠ JOŠ
            </span>
          </div>

        </div>
      </div>


      {/* ACCENT LINE */}

      <div
        className="
          h-[3px]
          bg-gradient-to-r
          from-[#C8D52B]
          via-[#16A6A1]
          to-[#C8D52B]
        "
      />

    </header>
  );
}