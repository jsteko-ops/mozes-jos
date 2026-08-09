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
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  db,
} from "@/lib/firebase";


const freeFeatures = [
  "Upravljanje klijentima",
  "Chat s klijentima",
  "Osnovni profil klijenta",
  "Planovi treninga",
  "Prvo mjerenje klijenta",
];


const proFeatures = [
  "Neograničena dodatna mjerenja",
  "Povijest i usporedba mjerenja",
  "Grafovi napretka",
  "Check-in sustav",
  "Planovi prehrane",
  "PDF izvještaji",
  "Napredna statistika i analitika",
];


export default function UpgradePage() {
  const {
    user,
  } = useAuth();


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    checkoutLoading,
    setCheckoutLoading,
  ] =
    useState(false);


  const [
    premium,
    setPremium,
  ] =
    useState(false);


  const [
    subscriptionStatus,
    setSubscriptionStatus,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let cancelled =
      false;


    async function loadSubscription() {
      if (!user) {
        if (!cancelled) {
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

          setError(
            ""
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


        if (
          cancelled
        ) {
          return;
        }


        if (
          snap.exists()
        ) {
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


          setSubscriptionStatus(
            data.subscriptionStatus ||
              ""
          );
        } else {
          setPremium(
            false
          );

          setSubscriptionStatus(
            ""
          );
        }
      } catch (
        loadError
      ) {
        console.error(
          "Greška kod učitavanja Pro statusa:",
          loadError
        );


        if (
          !cancelled
        ) {
          setError(
            "Pro status trenutno nije moguće provjeriti."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }


    void loadSubscription();


    return () => {
      cancelled =
        true;
    };
  }, [user]);


  async function startCheckout() {
    if (!user) {
      setError(
        "Moraš biti prijavljen kako bi aktivirao Pro plan."
      );

      return;
    }


    if (premium) {
      return;
    }


    try {
      setCheckoutLoading(
        true
      );

      setError(
        ""
      );


      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/stripe/checkout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                plan:
                  "pro",
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        data.error
      ) {
        setError(
          data.error ||
            "Checkout trenutno nije moguće pokrenuti."
        );

        return;
      }


      if (
        !data.url
      ) {
        setError(
          "Stripe nije vratio poveznicu za plaćanje."
        );

        return;
      }


      window.location.href =
        data.url;
    } catch (
      checkoutError
    ) {
      console.error(
        "Checkout greška:",
        checkoutError
      );


      setError(
        "Checkout trenutno nije moguće pokrenuti."
      );
    } finally {
      setCheckoutLoading(
        false
      );
    }
  }


  return (
    <div className="space-y-8">

      {/* BACK */}

      <Link
        href="/dashboard"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-[#667085]
          transition
          hover:text-[#15171A]
        "
      >
        <span className="text-[#16A6A1]">
          ←
        </span>

        Natrag na Dashboard
      </Link>


      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
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
            Možeš Još Pro
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
            Više alata.
            Više kontrole.
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
            Besplatni plan daje ti
            sve potrebno za početak.
            Pro otključava naprednije
            praćenje, prehranu,
            izvještaje i analitiku.
          </p>
        </div>


        {!loading && (
          <div
            className={`
              inline-flex
              w-fit
              items-center
              gap-3
              rounded-2xl
              border
              px-4
              py-3
              shadow-sm
              ${
                premium
                  ? "border-[#C8D52B]/40 bg-[#C8D52B]/10"
                  : "border-[#E5E7EB] bg-white"
              }
            `}
          >
            <span
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${
                  premium
                    ? "bg-[#C8D52B]"
                    : "bg-[#98A2B3]"
                }
              `}
            />


            <div>
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#98A2B3]
                "
              >
                Trenutni plan
              </p>


              <p
                className="
                  text-xs
                  font-black
                  text-[#15171A]
                "
              >
                {premium
                  ? "PRO"
                  : "FREE"}
              </p>
            </div>
          </div>
        )}
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


      {/* LOADING */}

      {loading && (
        <div
          className="
            grid
            gap-6
            lg:grid-cols-2
          "
        >
          {[1, 2].map(
            (item) => (
              <div
                key={item}
                className="
                  h-[560px]
                  animate-pulse
                  rounded-[30px]
                  border
                  border-[#E5E7EB]
                  bg-white
                "
              />
            )
          )}
        </div>
      )}


      {/* ERROR */}

      {!loading &&
        error && (
          <section
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  font-black
                  text-red-600
                "
              >
                !
              </div>


              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-red-800
                  "
                >
                  Nešto nije u redu
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-700
                  "
                >
                  {error}
                </p>
              </div>
            </div>
          </section>
        )}


      {!loading && (
        <>

          {/* HERO */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[30px]
              bg-[#111317]
              px-6
              py-8
              text-white
              sm:px-8
              sm:py-10
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
                -bottom-28
                left-1/3
                h-56
                w-56
                rounded-full
                bg-[#16A6A1]/10
                blur-3xl
              "
            />


            <div
              className="
                relative
                z-10
                grid
                gap-8
                lg:grid-cols-[1fr_auto]
                lg:items-center
              "
            >
              <div>
                <span
                  className="
                    inline-flex
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
                  PRO
                </span>


                <h2
                  className="
                    mt-5
                    max-w-2xl
                    text-3xl
                    font-black
                    tracking-tight
                    text-white
                    sm:text-4xl
                  "
                >
                  Napredak koji možeš
                  stvarno pratiti
                </h2>


                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-7
                    text-white/55
                  "
                >
                  Pro je namijenjen
                  trenerima koji žele
                  više od osnovnog
                  upravljanja
                  klijentima — detaljnu
                  povijest, check-in,
                  prehranu, izvještaje
                  i analitiku na jednom
                  mjestu.
                </p>
              </div>


              <div
                className="
                  rounded-[24px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-6
                  py-5
                  backdrop-blur
                "
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-white/35
                  "
                >
                  Status
                </p>


                <p
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-white
                  "
                >
                  {premium
                    ? "Pro aktivan"
                    : "Spreman za Pro"}
                </p>


                {subscriptionStatus && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/40
                    "
                  >
                    Stripe status:{" "}
                    {subscriptionStatus}
                  </p>
                )}
              </div>
            </div>
          </section>


          {/* PLANS */}

          <section
            className="
              grid
              gap-6
              lg:grid-cols-2
            "
          >

            {/* FREE */}

            <article
              className="
                overflow-hidden
                rounded-[30px]
                border
                border-[#E5E7EB]
                bg-white
                shadow-sm
              "
            >
              <div
                className="
                  border-b
                  border-[#EEF0EC]
                  p-7
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[#98A2B3]
                      "
                    >
                      Za početak
                    </p>


                    <h3
                      className="
                        mt-1
                        text-3xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      FREE
                    </h3>
                  </div>


                  {!premium && (
                    <span
                      className="
                        rounded-full
                        bg-[#F4F6F2]
                        px-3
                        py-2
                        text-[9px]
                        font-black
                        uppercase
                        tracking-wider
                        text-[#667085]
                      "
                    >
                      Trenutni
                    </span>
                  )}
                </div>


                <p
                  className="
                    mt-4
                    text-sm
                    leading-6
                    text-[#667085]
                  "
                >
                  Osnovni alati za rad
                  s klijentima bez
                  mjesečne pretplate.
                </p>


                <div
                  className="
                    mt-6
                    flex
                    items-end
                    gap-2
                  "
                >
                  <span
                    className="
                      text-4xl
                      font-black
                      tracking-tight
                      text-[#15171A]
                    "
                  >
                    0 €
                  </span>


                  <span
                    className="
                      pb-1
                      text-sm
                      font-bold
                      text-[#98A2B3]
                    "
                  >
                    / mjesečno
                  </span>
                </div>
              </div>


              <div className="p-7">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[#98A2B3]
                  "
                >
                  Uključeno
                </p>


                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >
                  {freeFeatures.map(
                    (
                      feature
                    ) => (
                      <FeatureRow
                        key={
                          feature
                        }
                        text={
                          feature
                        }
                        accent="gray"
                      />
                    )
                  )}
                </div>


                <div
                  className="
                    mt-8
                    rounded-2xl
                    bg-[#F6F7F3]
                    px-5
                    py-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-bold
                      leading-5
                      text-[#667085]
                    "
                  >
                    FREE ostaje
                    dostupan i bez
                    aktivacije Pro
                    pretplate.
                  </p>
                </div>
              </div>
            </article>


            {/* PRO */}

            <article
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-[#C8D52B]/50
                bg-white
                shadow-xl
                shadow-[#C8D52B]/10
              "
            >
              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-32
                  w-32
                  rounded-bl-full
                  bg-[#C8D52B]/10
                "
              />


              <div
                className="
                  relative
                  border-b
                  border-[#EEF0EC]
                  p-7
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[#16A6A1]
                      "
                    >
                      Puni potencijal
                    </p>


                    <h3
                      className="
                        mt-1
                        text-3xl
                        font-black
                        text-[#15171A]
                      "
                    >
                      PRO
                    </h3>
                  </div>


                  <span
                    className="
                      rounded-full
                      bg-[#C8D52B]
                      px-3
                      py-2
                      text-[9px]
                      font-black
                      uppercase
                      tracking-wider
                      text-[#111317]
                    "
                  >
                    {premium
                      ? "Aktivan"
                      : "Preporučeno"}
                  </span>
                </div>


                <p
                  className="
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-[#667085]
                  "
                >
                  Napredni alati za
                  ozbiljnije praćenje
                  klijenata i
                  profesionalniji rad.
                </p>


                <div
                  className="
                    mt-6
                    flex
                    items-end
                    gap-2
                  "
                >
                  <span
                    className="
                      text-4xl
                      font-black
                      tracking-tight
                      text-[#15171A]
                    "
                  >
                    PRO
                  </span>


                  <span
                    className="
                      pb-1
                      text-sm
                      font-bold
                      text-[#98A2B3]
                    "
                  >
                    Stripe pretplata
                  </span>
                </div>
              </div>


              <div
                className="
                  relative
                  p-7
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[#16A6A1]
                  "
                >
                  Sve iz Free plana +
                </p>


                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >
                  {proFeatures.map(
                    (
                      feature
                    ) => (
                      <FeatureRow
                        key={
                          feature
                        }
                        text={
                          feature
                        }
                        accent="lime"
                      />
                    )
                  )}
                </div>


                <button
                  type="button"
                  disabled={
                    premium ||
                    checkoutLoading ||
                    !user
                  }
                  onClick={
                    startCheckout
                  }
                  className="
                    mt-8
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#C8D52B]
                    px-6
                    py-4
                    text-sm
                    font-black
                    text-[#111317]
                    transition
                    hover:bg-[#D7E33A]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {checkoutLoading
                    ? "Otvaram sigurnu naplatu..."
                    : premium
                    ? "Pro je već aktivan"
                    : "Aktiviraj Možeš Još Pro"}
                </button>


                {!premium && (
                  <p
                    className="
                      mt-3
                      text-center
                      text-[11px]
                      leading-5
                      text-[#98A2B3]
                    "
                  >
                    Plaćanje i upravljanje
                    pretplatom odvija se
                    sigurnim Stripe
                    sustavom.
                  </p>
                )}
              </div>
            </article>

          </section>


          {/* SECURITY */}

          <section
            className="
              grid
              gap-4
              md:grid-cols-3
            "
          >
            <InfoCard
              title="Sigurna naplata"
              text="Checkout se otvara preko Stripe sustava. Podaci kartice ne spremaju se u aplikaciji."
              code="01"
            />


            <InfoCard
              title="FREE ostaje"
              text="Osnovne funkcije i dalje možeš koristiti bez aktivne Pro pretplate."
              code="02"
            />


            <InfoCard
              title="Jedan Pro plan"
              text="Nema kompliciranih paketa. Trenutni model aplikacije je jednostavno FREE ili PRO."
              code="03"
            />
          </section>

        </>
      )}

    </div>
  );
}


function FeatureRow({
  text,
  accent,
}: {
  text: string;
  accent:
    | "gray"
    | "lime";
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className={`
          mt-0.5
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[10px]
          font-black
          ${
            accent ===
            "lime"
              ? "bg-[#C8D52B]/20 text-[#68720F]"
              : "bg-[#F0F2ED] text-[#667085]"
          }
        `}
      >
        ✓
      </div>


      <p
        className="
          pt-0.5
          text-sm
          font-semibold
          leading-5
          text-[#344054]
        "
      >
        {text}
      </p>
    </div>
  );
}


function InfoCard({
  title,
  text,
  code,
}: {
  title: string;
  text: string;
  code: string;
}) {
  return (
    <article
      className="
        rounded-[24px]
        border
        border-[#E5E7EB]
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-[#111317]
          text-xs
          font-black
          text-[#C8D52B]
        "
      >
        {code}
      </div>


      <h3
        className="
          mt-4
          text-base
          font-black
          text-[#15171A]
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-2
          text-sm
          leading-6
          text-[#667085]
        "
      >
        {text}
      </p>
    </article>
  );
}