"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


interface PremiumGuardProps {
  children: React.ReactNode;
}


export default function PremiumGuard({
  children,
}: PremiumGuardProps) {
  const {
    user,
  } = useAuth();


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    premium,
    setPremium,
  ] =
    useState(false);


  useEffect(() => {
    let cancelled =
      false;


    async function checkPremium() {
      if (!user) {
        if (!cancelled) {
          setPremium(
            false
          );

          setLoading(
            false
          );
        }

        return;
      }


      try {
        if (!cancelled) {
          setLoading(
            true
          );
        }


        const snap =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );


        if (cancelled) {
          return;
        }


        if (!snap.exists()) {
          setPremium(
            false
          );

          return;
        }


        const data =
          snap.data();


        const isPremium =
          data.isPremium ===
          true;


        const active =
          data.subscriptionStatus ===
          "active";


        setPremium(
          isPremium &&
            active
        );
      } catch (
        error
      ) {
        console.error(
          "Premium check error:",
          error
        );


        if (!cancelled) {
          setPremium(
            false
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
        }
      }
    }


    void checkPremium();


    return () => {
      cancelled =
        true;
    };
  }, [user]);


  if (loading) {
    return (
      <div className="space-y-5">

        <div
          className="
            h-48
            animate-pulse
            rounded-[28px]
            bg-[#111317]
          "
        />


        <div
          className="
            grid
            gap-4
            md:grid-cols-2
          "
        >
          {[1, 2].map(
            (item) => (
              <div
                key={item}
                className="
                  h-32
                  animate-pulse
                  rounded-[24px]
                  border
                  border-[#E5E7EB]
                  bg-white
                "
              />
            )
          )}
        </div>

      </div>
    );
  }


  if (!premium) {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-[#111317]
          p-6
          text-white
          shadow-xl
          shadow-black/10
          sm:p-8
        "
      >
        <div
          className="
            absolute
            -right-20
            -top-24
            h-72
            w-72
            rounded-full
            bg-[#C8D52B]/15
            blur-3xl
          "
        />


        <div
          className="
            absolute
            -bottom-24
            left-1/3
            h-52
            w-52
            rounded-full
            bg-[#16A6A1]/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            z-10
            max-w-2xl
          "
        >

          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#C8D52B]
              px-3
              py-1.5
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#111317]
            "
          >
            PRO funkcija
          </div>


          {/* TITLE */}

          <h2
            className="
              mt-5
              text-3xl
              font-black
              tracking-tight
              text-white
              sm:text-4xl
            "
          >
            Otključaj puni
            potencijal aplikacije
          </h2>


          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-7
              text-white/55
            "
          >
            Ova funkcija dostupna je
            korisnicima s aktivnim
            Možeš Još Pro planom.
          </p>


          {/* FEATURES */}

          <div
            className="
              mt-7
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            <ProFeature
              title="Napredno praćenje"
              text="Više mjerenja, povijest i usporedbe."
            />

            <ProFeature
              title="Profesionalni alati"
              text="Check-in, izvještaji i napredna analiza."
            />
          </div>


          {/* ACTIONS */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <Link
              href="/dashboard/trainer/naplata"
              className="
                inline-flex
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]
                px-6
                py-4
                text-sm
                font-black
                text-[#111317]
                transition
                hover:bg-[#D7E33A]
              "
            >
              Aktiviraj Pro plan
            </Link>


            <Link
              href="/dashboard/trainer"
              className="
                inline-flex
                items-center
                justify-center
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-6
                py-4
                text-sm
                font-black
                text-white
                transition
                hover:bg-white/[0.08]
              "
            >
              Natrag na Dashboard
            </Link>
          </div>


          <p
            className="
              mt-5
              text-[11px]
              leading-5
              text-white/30
            "
          >
            Pro pristup vrijedi samo
            kada su i Premium status i
            Stripe pretplata aktivni.
          </p>

        </div>
      </section>
    );
  }


  return (
    <>
      {children}
    </>
  );
}


function ProFeature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      className="
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
          h-8
          w-8
          items-center
          justify-center
          rounded-xl
          bg-[#C8D52B]/15
          text-xs
          font-black
          text-[#C8D52B]
        "
      >
        ✓
      </div>


      <p
        className="
          mt-3
          text-sm
          font-black
          text-white
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1
          text-xs
          leading-5
          text-white/45
        "
      >
        {text}
      </p>
    </div>
  );
}