"use client";

import {
  User,
} from "firebase/auth";

import NotificationBell from "@/components/notifications/NotificationBell";


export default function Topbar({
  user,
}: {
  user: User | null;
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
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div className="min-w-0">

          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#16A6A1]
            "
          >
            Možeš Još
          </p>

          <p
            className="
              truncate
              text-sm
              font-medium
              text-[#667085]
            "
          >
            {user?.email ?? "Učitavanje korisnika..."}
          </p>

        </div>


        <div className="flex items-center gap-3">

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