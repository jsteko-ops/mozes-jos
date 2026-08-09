"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
  } = useAuth();


  const pathname =
    usePathname();


  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);


  /*
   * Kada se promijeni ruta,
   * mobilni sidebar se automatski
   * zatvara.
   */
  useEffect(() => {
    setMobileMenuOpen(
      false
    );
  }, [pathname]);


  /*
   * Dok je mobilni meni otvoren:
   * - zaključaj scroll stranice
   * - ESC zatvara meni
   */
  useEffect(() => {
    if (
      !mobileMenuOpen
    ) {
      return;
    }


    const previousOverflow =
      document.body.style
        .overflow;


    document.body.style.overflow =
      "hidden";


    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setMobileMenuOpen(
          false
        );
      }
    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileMenuOpen]);


  return (
    <div
      className="
        min-h-screen
        bg-[#F4F6F2]
        text-[#15171A]
      "
    >
      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}

        <div
          className="
            hidden
            shrink-0
            lg:block
          "
        >
          <Sidebar />
        </div>


        {/* MOBILE OVERLAY */}

        <button
          type="button"
          aria-label="Zatvori navigaciju"
          onClick={() =>
            setMobileMenuOpen(
              false
            )
          }
          className={`
            fixed
            inset-0
            z-40
            bg-black/55
            backdrop-blur-[2px]
            transition-opacity
            duration-300
            lg:hidden
            ${
              mobileMenuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        />


        {/* MOBILE SIDEBAR DRAWER */}

        <div
          className={`
            fixed
            inset-y-0
            left-0
            z-50
            w-64
            max-w-[85vw]
            transform
            shadow-2xl
            shadow-black/30
            transition-transform
            duration-300
            ease-out
            lg:hidden
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
          onClickCapture={(
            event
          ) => {
            const target =
              event.target as HTMLElement;


            if (
              target.closest(
                "a"
              )
            ) {
              setMobileMenuOpen(
                false
              );
            }
          }}
        >
          <Sidebar />
        </div>


        {/* CONTENT */}

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
          "
        >

          <Topbar
            user={user}
            onMenuClick={() =>
              setMobileMenuOpen(
                true
              )
            }
            mobileMenuOpen={
              mobileMenuOpen
            }
          />


          <main
            className="
              flex-1
              bg-[#F4F6F2]
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-[1600px]
              "
            >
              {children}
            </div>
          </main>

        </div>

      </div>
    </div>
  );
}