"use client";

import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";


export default function StaffDashboardPage() {
  const {
    userProfile,
  } = useAuth();


  return (
    <RoleGuard
      allowedRoles={[
        "gym_staff",
      ]}
    >
      <div className="space-y-6">

        {/* HEADER */}

        <div>
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Recepcija / djelatnik
          </p>

          <h1
            className="
              mt-1
              text-3xl
              font-black
              tracking-tight
              text-[#15171A]
              sm:text-4xl
            "
          >
            Radni pult
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Upravljaj članovima teretane,
            članarinama i uplatama bez pristupa
            privatnim trenerskim podacima.
          </p>
        </div>


        <div
          className="
            h-1
            w-20
            rounded-full
            bg-gradient-to-r
            from-[#C8D52B]
            to-[#16A6A1]
          "
        />


        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#111317]
            p-6
            text-white
            sm:p-8
          "
        >
          <div
            className="
              absolute
              -right-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-[#C8D52B]/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-24
              -left-20
              h-64
              w-64
              rounded-full
              bg-[#16A6A1]/10
              blur-3xl
            "
          />

          <div className="relative z-10">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#C8D52B]
              "
            >
              Današnji rad
            </p>

            <h2
              className="
                mt-2
                max-w-2xl
                text-2xl
                font-black
                tracking-tight
                sm:text-3xl
              "
            >
              Sve što recepciji treba na jednom mjestu.
            </h2>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-white/55
              "
            >
              Upis članova, provjera članarine,
              evidentiranje gotovinskih i drugih
              uplata te pregled statusa članstva.
            </p>

            {userProfile?.gymId && (
              <div
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-white/70
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

                Teretana povezana
              </div>
            )}
          </div>
        </section>


        {/* ACTIONS */}

        <section
          className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          <Link
            href="/dashboard/staff/clients"
            className="
              group
              rounded-[24px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:border-[#16A6A1]
              hover:shadow-lg
              hover:shadow-black/5
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#16A6A1]/10
                text-xl
              "
            >
              👥
            </div>

            <h3
              className="
                mt-5
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Članovi
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Upis novog člana, pregled članova
              i dodjela trenera kada je potrebna.
            </p>

            <div
              className="
                mt-5
                text-sm
                font-black
                text-[#128D89]
              "
            >
              Otvori članove →
            </div>
          </Link>


          <Link
            href="/dashboard/staff/memberships"
            className="
              group
              rounded-[24px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:border-[#C8D52B]
              hover:shadow-lg
              hover:shadow-black/5
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]/20
                text-xl
              "
            >
              💳
            </div>

            <h3
              className="
                mt-5
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Članarine
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Provjeri do kada članarina vrijedi
              i evidentiraj novu uplatu.
            </p>

            <div
              className="
                mt-5
                text-sm
                font-black
                text-[#758000]
              "
            >
              Otvori članarine →
            </div>
          </Link>


          <Link
            href="/dashboard/settings"
            className="
              group
              rounded-[24px]
              border
              border-[#E5E7EB]
              bg-white
              p-6
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:border-[#111317]
              hover:shadow-lg
              hover:shadow-black/5
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#111317]
                text-xl
              "
            >
              ⚙️
            </div>

            <h3
              className="
                mt-5
                text-lg
                font-black
                text-[#15171A]
              "
            >
              Postavke
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Pregled vlastitog računa i
              osnovnih postavki.
            </p>

            <div
              className="
                mt-5
                text-sm
                font-black
                text-[#15171A]
              "
            >
              Otvori postavke →
            </div>
          </Link>

        </section>


        {/* PAYMENT NOTE */}

        <section
          className="
            rounded-[24px]
            border
            border-[#DDE4B2]
            bg-[#F8FBE9]
            p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#C8D52B]
                font-black
                text-[#111317]
              "
            >
              €
            </div>

            <div>
              <h3
                className="
                  text-base
                  font-black
                  text-[#15171A]
                "
              >
                Gotovinske uplate
              </h3>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[#667085]
                "
              >
                Kada član plati na recepciji,
                djelatnik će moći evidentirati
                iznos, način plaćanja i razdoblje
                članarine. Uplata ostaje zapisana
                u povijesti.
              </p>
            </div>
          </div>
        </section>

      </div>
    </RoleGuard>
  );
}