"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { userProfile } = useAuth();

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


  if (!userProfile) {
    return null;
  }



  return (
    <aside className="w-64 min-h-screen border-r bg-white p-5 flex flex-col">


      <div className="mb-8">

        <h1 className="text-2xl font-bold">
          Možeš Još
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {userProfile.role}
        </p>

      </div>




      <nav className="flex flex-col gap-2">



        {/* TRAINER MENU */}
        {userProfile.role === "trainer" && (
          <>

            <Link
              href="/dashboard/trainer"
              className={linkClass("/dashboard/trainer")}
            >
              Dashboard
            </Link>

<Link
  href="/dashboard/chat"
  className={linkClass("/dashboard/chat")}
>
  💬 Chat
</Link>

            <Link
              href="/dashboard/trainer/klijenti"
              className={linkClass("/dashboard/trainer/klijenti")}
            >
              Klijenti
            </Link>


            <Link
              href="/dashboard/trainer/mjerenja"
              className={linkClass("/dashboard/trainer/mjerenja")}
            >
              Mjerenja
            </Link>


            <Link
              href="/dashboard/trainer/checkin"
              className={linkClass("/dashboard/trainer/checkin")}
            >
              Check-in
            </Link>


            <Link
              href="/dashboard/trainer/izvjestaji"
              className={linkClass("/dashboard/trainer/izvjestaji")}
            >
              Izvještaji
            </Link>


            <Link
              href="/dashboard/trainer/naplata"
              className={linkClass("/dashboard/trainer/naplata")}
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
              className={linkClass("/dashboard/owner")}
            >
              Moja teretana
            </Link>



            <Link
              href="/dashboard/owner/trainers"
              className={linkClass("/dashboard/owner/trainers")}
            >
              Moji treneri
            </Link>



            <Link
              href="/dashboard/owner/clients"
              className={linkClass("/dashboard/owner/clients")}
            >
              Moji klijenti
            </Link>



            <Link
              href="/dashboard/reports"
              className={linkClass("/dashboard/reports")}
            >
              Izvještaji
            </Link>

<Link
  href="/dashboard/chat"
  className={linkClass("/dashboard/chat")}
>
  💬 Chat
</Link>

            <Link
              href="/dashboard/settings"
              className={linkClass("/dashboard/settings")}
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
              className={linkClass("/dashboard/client")}
            >
              Moj napredak
            </Link>

            <Link
              href="/dashboard/client"
              className={linkClass("/dashboard/client")}
            >
              Moji treninzi
            </Link>

            <Link
              href="/dashboard/client"
              className={linkClass("/dashboard/client")}
            >
              Mjerenja
            </Link>

<Link
  href="/dashboard/chat"
  className={linkClass("/dashboard/chat")}
>
  💬 Chat
</Link>

            <Link
              href="/dashboard/settings"
              className={linkClass("/dashboard/settings")}
            >
              Profil
            </Link>

          </>
        )}







        {/* ADMIN */}
        {userProfile.role === "admin" && (
          <>

            <Link
              href="/dashboard"
              className={linkClass("/dashboard")}
            >
              Admin Dashboard
            </Link>

          </>
        )}



      </nav>





      <button
        onClick={logout}
        className="mt-auto rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Odjava
      </button>



    </aside>
  );
}