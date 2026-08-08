"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  signOut,
} from "firebase/auth";

import {
  useEffect,
  useState,
} from "react";

import {
  auth,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  listenUnreadCheckins,
  listenUnreadNotifications,
} from "@/lib/services/notificationService";

import {
  listenUnreadTrainerMessages,
} from "@/lib/services/chat/chatNotifications";


export default function Sidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    userProfile,
  } = useAuth();


  const [
    messageCount,
    setMessageCount,
  ] = useState(0);

  const [
    checkinCount,
    setCheckinCount,
  ] = useState(0);

  const [
    notificationCount,
    setNotificationCount,
  ] = useState(0);


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


  const isActive = (
    href: string
  ) => {
    if (
      href === "/dashboard"
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };


  const linkClass = (
    href: string
  ) =>
    `
      group
      flex
      min-h-11
      items-center
      rounded-xl
      px-3
      py-2.5
      text-sm
      font-medium
      transition-all
      duration-200
      ${
        isActive(href)
          ? `
            bg-[#C8D52B]
            text-[#111317]
            shadow-sm
          `
          : `
            text-white/75
            hover:bg-white/10
            hover:text-white
          `
      }
    `;


  const badge = (
    count: number
  ) => {
    if (count <= 0) {
      return null;
    }

    return (
      <span
        className="
          ml-auto
          flex
          min-w-6
          items-center
          justify-center
          rounded-full
          bg-[#16A6A1]
          px-2
          py-1
          text-[11px]
          font-bold
          text-white
        "
      >
        {count}
      </span>
    );
  };


  const roleLabel = () => {
    switch (
      userProfile?.role
    ) {
      case "trainer":
        return "Trener";

      case "gym_owner":
        return "Vlasnik teretane";

      case "client":
        return "Klijent";

      case "admin":
        return "Administrator";

      default:
        return "";
    }
  };


  if (!userProfile) {
    return null;
  }


  return (
    <aside
      className="
        sticky
        top-0
        flex
        h-screen
        w-64
        shrink-0
        flex-col
        overflow-y-auto
        bg-[#111317]
        px-4
        py-5
        text-white
      "
    >

      {/* BRAND */}

      <div
        className="
          mb-7
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          p-4
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
              items-center
              justify-center
              rounded-xl
              bg-[#C8D52B]
              text-lg
              font-black
              text-[#111317]
              shadow-lg
              shadow-[#C8D52B]/10
            "
          >
            MJ
          </div>


          <div className="min-w-0">
            <h1
              className="
                text-lg
                font-black
                tracking-tight
                text-white
              "
            >
              Možeš Još
            </h1>

            <p
              className="
                text-xs
                font-medium
                text-[#16A6A1]
              "
            >
              {roleLabel()}
            </p>
          </div>
        </div>


        {userProfile.isPremium && (
          <div
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#C8D52B]/30
              bg-[#C8D52B]/10
              px-3
              py-1.5
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
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-[#DDE84B]
              "
            >
              Pro aktivan
            </span>
          </div>
        )}
      </div>


      <p
        className="
          mb-2
          px-3
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-white/35
        "
      >
        Navigacija
      </p>


      <nav
        className="
          flex
          flex-col
          gap-1
        "
      >

        {/* TRAINER */}

        {userProfile.role ===
          "trainer" && (
          <>
            <Link
              href="/dashboard/trainer"
              className={linkClass(
                "/dashboard/trainer"
              )}
            >
              <span className="mr-3">
                ◫
              </span>

              Dashboard
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              <span className="mr-3">
                💬
              </span>

              Chat

              {badge(
                messageCount
              )}
            </Link>


            <Link
              href="/dashboard/trainer/klijenti"
              className={linkClass(
                "/dashboard/trainer/klijenti"
              )}
            >
              <span className="mr-3">
                👥
              </span>

              Klijenti
            </Link>


            <Link
              href="/dashboard/trainer/mjerenja"
              className={linkClass(
                "/dashboard/trainer/mjerenja"
              )}
            >
              <span className="mr-3">
                📏
              </span>

              Mjerenja
            </Link>


            <Link
              href="/dashboard/trainer/checkin"
              className={linkClass(
                "/dashboard/trainer/checkin"
              )}
            >
              <span className="mr-3">
                ✓
              </span>

              Check-in

              {badge(
                checkinCount
              )}
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <span className="mr-3">
                🔔
              </span>

              Obavijesti

              {badge(
                notificationCount
              )}
            </Link>


            <Link
              href="/dashboard/safe-reports-inbox"
              className={linkClass(
                "/dashboard/safe-reports-inbox"
              )}
            >
              <span className="mr-3">
                🛡️
              </span>

              Sigurne prijave
            </Link>


            <Link
              href="/dashboard/reports"
              className={linkClass(
                "/dashboard/reports"
              )}
            >
              <span className="mr-3">
                📄
              </span>

              Izvještaji
            </Link>


            <Link
              href="/dashboard/trainer/naplata"
              className={linkClass(
                "/dashboard/trainer/naplata"
              )}
            >
              <span className="mr-3">
                💳
              </span>

              Naplata
            </Link>
          </>
        )}


        {/* OWNER */}

        {userProfile.role ===
          "gym_owner" && (
          <>
            <Link
              href="/dashboard/owner"
              className={linkClass(
                "/dashboard/owner"
              )}
            >
              <span className="mr-3">
                ◫
              </span>

              Moja teretana
            </Link>


            <Link
              href="/dashboard/owner/trainers"
              className={linkClass(
                "/dashboard/owner/trainers"
              )}
            >
              <span className="mr-3">
                🏋️
              </span>

              Moji treneri
            </Link>


            <Link
              href="/dashboard/owner/clients"
              className={linkClass(
                "/dashboard/owner/clients"
              )}
            >
              <span className="mr-3">
                👥
              </span>

              Moji klijenti
            </Link>


            <Link
              href="/dashboard/reports"
              className={linkClass(
                "/dashboard/reports"
              )}
            >
              <span className="mr-3">
                📄
              </span>

              Izvještaji
            </Link>


            <Link
              href="/dashboard/safe-reports-inbox"
              className={linkClass(
                "/dashboard/safe-reports-inbox"
              )}
            >
              <span className="mr-3">
                🛡️
              </span>

              Sigurne prijave
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <span className="mr-3">
                🔔
              </span>

              Obavijesti

              {badge(
                notificationCount
              )}
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              <span className="mr-3">
                💬
              </span>

              Chat
            </Link>


            <Link
              href="/dashboard/settings"
              className={linkClass(
                "/dashboard/settings"
              )}
            >
              <span className="mr-3">
                ⚙️
              </span>

              Postavke
            </Link>
          </>
        )}


        {/* CLIENT */}

        {userProfile.role ===
          "client" && (
          <>
            <Link
              href="/dashboard/client"
              className={linkClass(
                "/dashboard/client"
              )}
            >
              <span className="mr-3">
                ◫
              </span>

              Moj napredak
            </Link>


            <Link
              href="/dashboard/client/workouts"
              className={linkClass(
                "/dashboard/client/workouts"
              )}
            >
              <span className="mr-3">
                🏋️
              </span>

              Moji treninzi
            </Link>


            <Link
              href="/dashboard/client/measurements"
              className={linkClass(
                "/dashboard/client/measurements"
              )}
            >
              <span className="mr-3">
                📏
              </span>

              Mjerenja
            </Link>


            <Link
              href="/dashboard/nutrition"
              className={linkClass(
                "/dashboard/nutrition"
              )}
            >
              <span className="mr-3">
                🥗
              </span>

              Prehrana
            </Link>


            <Link
              href="/dashboard/chat"
              className={linkClass(
                "/dashboard/chat"
              )}
            >
              <span className="mr-3">
                💬
              </span>

              Chat
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <span className="mr-3">
                🔔
              </span>

              Obavijesti

              {badge(
                notificationCount
              )}
            </Link>


            <Link
              href="/dashboard/safe-report"
              className={linkClass(
                "/dashboard/safe-report"
              )}
            >
              <span className="mr-3">
                🛡️
              </span>

              Sigurna prijava
            </Link>


            <Link
              href="/dashboard/settings"
              className={linkClass(
                "/dashboard/settings"
              )}
            >
              <span className="mr-3">
                👤
              </span>

              Profil
            </Link>
          </>
        )}


        {/* ADMIN */}

        {userProfile.role ===
          "admin" && (
          <>
            <Link
              href="/dashboard"
              className={linkClass(
                "/dashboard"
              )}
            >
              <span className="mr-3">
                ◫
              </span>

              Admin Dashboard
            </Link>


            <Link
              href="/dashboard/safe-reports-inbox"
              className={linkClass(
                "/dashboard/safe-reports-inbox"
              )}
            >
              <span className="mr-3">
                🛡️
              </span>

              Sigurne prijave
            </Link>


            <Link
              href="/dashboard/notifications"
              className={linkClass(
                "/dashboard/notifications"
              )}
            >
              <span className="mr-3">
                🔔
              </span>

              Obavijesti

              {badge(
                notificationCount
              )}
            </Link>
          </>
        )}
      </nav>


      <div
        className="
          mt-auto
          pt-6
        "
      >
        <div
          className="
            mb-4
            h-px
            bg-white/10
          "
        />


        <button
          type="button"
          onClick={logout}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.05]
            px-4
            py-3
            text-sm
            font-semibold
            text-white/80
            transition
            hover:border-red-400/30
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <span>
            ↪
          </span>

          Odjava
        </button>


        <p
          className="
            mt-4
            text-center
            text-[10px]
            uppercase
            tracking-[0.15em]
            text-white/20
          "
        >
          JoŠ bolje • JoŠ jače
        </p>
      </div>

    </aside>
  );
}