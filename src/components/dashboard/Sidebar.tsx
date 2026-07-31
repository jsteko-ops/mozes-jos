"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  listenUnreadCheckins,
  listenUnreadNotifications,
} from "@/lib/services/notificationService";

import {
  listenUnreadTrainerMessages,
} from "@/lib/services/chat/chatNotifications";


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { userProfile } = useAuth();

  const [messageCount, setMessageCount] =
    useState(0);

  const [checkinCount, setCheckinCount] =
    useState(0);

  const [notificationCount, setNotificationCount] =
    useState(0);


  useEffect(() => {
    if (!userProfile?.uid) {
      setMessageCount(0);
      setCheckinCount(0);
      setNotificationCount(0);

      return;
    }


    const unsubscribeMessages =
      listenUnreadTrainerMessages(
        userProfile.uid,
        (count) => {
          setMessageCount(count);
        }
      );


    const unsubscribeCheckins =
      listenUnreadCheckins(
        userProfile.uid,
        (count) => {
          setCheckinCount(count);
        }
      );


    const unsubscribeNotifications =
      listenUnreadNotifications(
        userProfile.uid,
        (count) => {
          setNotificationCount(count);
        }
      );


    return () => {
      unsubscribeMessages();
      unsubscribeCheckins();
      unsubscribeNotifications();
    };
  }, [userProfile?.uid]);


  const logout = async () => {
    await signOut(auth);

    router.replace("/login");
  };


  const linkClass = (href: string) =>
    `block rounded-lg px-3 py-2 transition ${
      pathname === href
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;


  const badge = (count: number) => {
    if (count <= 0) {
      return null;
    }

    return (
      <span
        className="
          rounded-full
          bg-red-600
          px-2
          py-1
          text-xs
          text-white
        "
      >
        {count}
      </span>
    );
  };


  if (!userProfile) {
    return null;
  }


  return (
    <aside
      className="
        flex
        min-h-screen
        w-64
        flex-col
        border-r
        bg-white
        p-5
      "
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Možeš Još
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {userProfile.role}
        </p>
      </div>


      <nav className="flex flex-col gap-2">

        {/* TRAINER MENU */}

        {userProfile.role === "trainer" && (
          <>
            <Link
              href="/dashboard/trainer"
              className={linkClass(
                "/dashboard/trainer"
              )}
            >
              Dashboard
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              <div className="flex items-center justify-between">
                <span>
                  💬 Chat
                </span>

                {badge(messageCount)}
              </div>
            </Link>


            <Link
              href="/dashboard/trainer/klijenti"
              className={linkClass(
                "/dashboard/trainer/klijenti"
              )}
            >
              Klijenti
            </Link>


            <Link
              href="/dashboard/trainer/mjerenja"
              className={linkClass(
                "/dashboard/trainer/mjerenja"
              )}
            >
              Mjerenja
            </Link>


            <Link
              href="/dashboard/trainer/checkin"
              className={linkClass(
                "/dashboard/trainer/checkin"
              )}
            >
              <div className="flex items-center justify-between">
                <span>
                  Check-in
                </span>

                {badge(checkinCount)}
              </div>
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <div className="flex items-center justify-between">
                <span>
                  🔔 Obavijesti
                </span>

                {badge(notificationCount)}
              </div>
            </Link>


            <Link
              href="/dashboard/reports"
              className={linkClass(
                "/dashboard/reports"
              )}
            >
              📄 Izvještaji
            </Link>


            <Link
              href="/dashboard/trainer/naplata"
              className={linkClass(
                "/dashboard/trainer/naplata"
              )}
            >
              Naplata
            </Link>
          </>
        )}


        {/* OWNER MENU */}

        {userProfile.role === "gym_owner" && (
          <>
            <Link
              href="/dashboard/owner"
              className={linkClass(
                "/dashboard/owner"
              )}
            >
              Moja teretana
            </Link>


            <Link
              href="/dashboard/owner/trainers"
              className={linkClass(
                "/dashboard/owner/trainers"
              )}
            >
              Moji treneri
            </Link>


            <Link
              href="/dashboard/owner/clients"
              className={linkClass(
                "/dashboard/owner/clients"
              )}
            >
              Moji klijenti
            </Link>


            <Link
              href="/dashboard/reports"
              className={linkClass(
                "/dashboard/reports"
              )}
            >
              📄 Izvještaji
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              💬 Chat
            </Link>


            <Link
              href="/dashboard/settings"
              className={linkClass(
                "/dashboard/settings"
              )}
            >
              Postavke
            </Link>
          </>
        )}


        {/* CLIENT MENU */}

        {userProfile.role === "client" && (
          <>
            <Link
              href="/dashboard/client"
              className={linkClass(
                "/dashboard/client"
              )}
            >
              Moj napredak
            </Link>


            <Link
              href="/dashboard/client/workouts"
              className={linkClass(
                "/dashboard/client/workouts"
              )}
            >
              Moji treninzi
            </Link>


            <Link
              href="/dashboard/client/measurements"
              className={linkClass(
                "/dashboard/client/measurements"
              )}
            >
              Mjerenja
            </Link>


            <Link
              href="/dashboard/nutrition"
              className={linkClass(
                "/dashboard/nutrition"
              )}
            >
              🥗 Prehrana
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              💬 Chat
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <div className="flex items-center justify-between">
                <span>
                  🔔 Obavijesti
                </span>

                {badge(notificationCount)}
              </div>
            </Link>


            <Link
              href="/dashboard/settings"
              className={linkClass(
                "/dashboard/settings"
              )}
            >

<Link
  href="/dashboard/safe-report"
  className={linkClass(
    "/dashboard/safe-report"
  )}
>
  🛡️ Sigurna prijava
</Link>
              Profil
            </Link>
          </>
        )}


        {/* ADMIN MENU */}

        {userProfile.role === "admin" && (
          <>
            <Link
              href="/dashboard"
              className={linkClass(
                "/dashboard"
              )}
            >
              Admin Dashboard
            </Link>
          </>
        )}

      </nav>


      <button
        type="button"
        onClick={logout}
        className="
          mt-auto
          rounded-lg
          bg-red-600
          px-4
          py-2
          text-white
          hover:bg-red-700
        "
      >
        Odjava
      </button>
    </aside>
  );
}