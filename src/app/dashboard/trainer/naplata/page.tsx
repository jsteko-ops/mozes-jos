"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  db,
} from "@/lib/firebase";


export default function NaplataPage() {
  const {
    user,
  } = useAuth();


  const [
    premium,
    setPremium,
  ] = useState(false);


  const [
    status,
    setStatus,
  ] = useState("");


  const [
    activatedAt,
    setActivatedAt,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);


  const [
    portalLoading,
    setPortalLoading,
  ] = useState(false);


  useEffect(() => {
    async function loadSubscription() {
      if (!user) {
        return;
      }

      try {
        setLoading(true);

        const snap =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );

        if (snap.exists()) {
          const data =
            snap.data();

          setPremium(
            data.isPremium === true
          );

          setStatus(
            data.subscriptionStatus ||
              ""
          );

          if (
            data.premiumActivatedAt
          ) {
            const date =
              data.premiumActivatedAt
                .toDate
                ? data
                    .premiumActivatedAt
                    .toDate()
                : new Date(
                    data
                      .premiumActivatedAt
                  );

            setActivatedAt(
              date.toLocaleDateString(
                "hr-HR"
              )
            );
          } else {
            setActivatedAt("");
          }
        }
      } catch (error) {
        console.error(
          "Greška kod učitavanja pretplate:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSubscription();
  }, [user]);


  async function startCheckout() {
    if (!user) {
      alert(
        "Nema prijavljenog korisnika."
      );

      return;
    }


    try {
      setCheckoutLoading(true);

      const token =
        await user.getIdToken();


      const res =
        await fetch(
          "/api/stripe/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                plan: "pro",
              }),
          }
        );


      const data =
        await res.json();


      if (
        !res.ok ||
        data.error
      ) {
        alert(
          data.error ||
            "Checkout nije moguće pokrenuti."
        );

        return;
      }


      if (data.url) {
        window.location.href =
          data.url;
      }
    } catch (error) {
      console.error(
        "Checkout greška:",
        error
      );

      alert(
        "Checkout nije moguće pokrenuti."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }


  async function openPortal() {
    if (!user) {
      alert(
        "Nema prijavljenog korisnika."
      );

      return;
    }


    try {
      setPortalLoading(true);

      const token =
        await user.getIdToken();


      const res =
        await fetch(
          "/api/stripe/portal",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await res.json();


      if (
        !res.ok ||
        data.error
      ) {
        alert(
          data.error ||
            "Portal pretplate nije moguće otvoriti."
        );

        return;
      }


      if (data.url) {
        window.location.href =
          data.url;
      }
    } catch (error) {
      console.error(
        "Portal greška:",
        error
      );

      alert(
        "Portal pretplate nije moguće otvoriti."
      );
    } finally {
      setPortalLoading(false);
    }
  }


  function statusLabel() {
    switch (status) {
      case "active":
        return "Aktivna";

      case "trialing":
        return "Probno razdoblje";

      case "past_due":
        return "Plaćanje kasni";

      case "canceled":
        return "Otkazana";

      case "unpaid":
        return "Neplaćena";

      default:
        return status || "Nije aktivna";
    }
  }


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
      <div className="space-y-7">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
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
              Pretplata
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
              Možeš Još Pro
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
              Upravljaj Pro
              pretplatom i otključaj
              napredne alate za rad
              s klijentima.
            </p>
          </div>


          {!loading && (
            <div
              className={`
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                px-3
                py-2

                ${
                  premium
                    ? `
                      bg-[#C8D52B]/15
                      text-[#5F6810]
                    `
                    : `
                      bg-[#F4F6F2]
                      text-[#667085]
                    `
                }
              `}
            >
              <span
                className={`
                  h-2
                  w-2
                  rounded-full

                  ${
                    premium
                      ? "bg-[#C8D52B]"
                      : "bg-[#98A2B3]"
                  }
                `}
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                "
              >
                {premium
                  ? "Pro aktivan"
                  : "Free plan"}
              </span>
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

        {loading ? (
          <div
            className="
              grid
              gap-5
              lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]
            "
          >
            <div
              className="
                h-96
                animate-pulse
                rounded-[28px]
                bg-[#111317]
              "
            />

            <div
              className="
                h-96
                animate-pulse
                rounded-[28px]
                border
                border-[#E5E7EB]
                bg-white
              "
            />
          </div>
        ) : (
          <div
            className="
              grid
              gap-5
              lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]
            "
          >

            {/* PRO CARD */}

            <section
              className="
                relative
                overflow-hidden
                rounded-[28px]
                bg-[#111317]
                p-6
                text-white
                shadow-xl
                shadow-black/5
                sm:p-8
              "
            >
              <div
                className="
                  absolute
                  -right-24
                  -top-24
                  h-72
                  w-72
                  rounded-full
                  bg-[#C8D52B]/10
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-28
                  right-20
                  h-64
                  w-64
                  rounded-full
                  bg-[#16A6A1]/10
                  blur-3xl
                "
              />


              <div
                className="
                  relative
                  z-10
                "
              >
                <div
                  className="
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
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#DDE84B]
                    "
                  >
                    Profesionalni plan
                  </span>
                </div>


                <h2
                  className="
                    mt-6
                    text-3xl
                    font-black
                    tracking-tight
                    text-white
                    sm:text-4xl
                  "
                >
                  Više alata.
                  <br />
                  Više kontrole.
                  <br />

                  <span
                    className="
                      text-[#C8D52B]
                    "
                  >
                    JoŠ napretka.
                  </span>
                </h2>


                <p
                  className="
                    mt-5
                    max-w-xl
                    text-sm
                    leading-6
                    text-white/60
                  "
                >
                  Pro je namijenjen
                  trenerima koji žele
                  pratiti napredak,
                  izrađivati izvještaje
                  i koristiti napredne
                  module aplikacije.
                </p>


                <div
                  className="
                    mt-7
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  {[
                    "Dodatna mjerenja i povijest",
                    "Check-in praćenje",
                    "Planovi prehrane",
                    "PDF izvještaji",
                    "Napredna analiza napretka",
                    "Profesionalni alati za trenere",
                  ].map(
                    (feature) => (
                      <div
                        key={
                          feature
                        }
                        className="
                          flex
                          items-start
                          gap-3
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.05]
                          px-4
                          py-3
                        "
                      >
                        <div
                          className="
                            mt-0.5
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#C8D52B]
                            text-[10px]
                            font-black
                            text-[#111317]
                          "
                        >
                          ✓
                        </div>

                        <span
                          className="
                            text-xs
                            font-semibold
                            leading-5
                            text-white/75
                          "
                        >
                          {feature}
                        </span>
                      </div>
                    )
                  )}
                </div>


                <div
                  className="
                    mt-8
                    border-t
                    border-white/10
                    pt-6
                  "
                >
                  {premium ? (
                    <button
                      type="button"
                      onClick={() =>
                        void openPortal()
                      }
                      disabled={
                        portalLoading
                      }
                      className="
                        inline-flex
                        min-h-12
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#C8D52B]
                        px-6
                        py-3
                        text-sm
                        font-black
                        text-[#111317]
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-[#B8C525]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        disabled:hover:translate-y-0
                      "
                    >
                      {portalLoading ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-[#111317]/20
                              border-t-[#111317]
                            "
                          />

                          Otvaranje...
                        </>
                      ) : (
                        <>
                          Upravljaj
                          pretplatom

                          <span>
                            →
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        void startCheckout()
                      }
                      disabled={
                        checkoutLoading
                      }
                      className="
                        inline-flex
                        min-h-12
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#C8D52B]
                        px-6
                        py-3
                        text-sm
                        font-black
                        text-[#111317]
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-[#B8C525]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        disabled:hover:translate-y-0
                      "
                    >
                      {checkoutLoading ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-[#111317]/20
                              border-t-[#111317]
                            "
                          />

                          Otvaranje...
                        </>
                      ) : (
                        <>
                          Aktiviraj Pro

                          <span>
                            →
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </section>


            {/* STATUS CARD */}

            <section
              className="
                rounded-[28px]
                border
                border-[#E5E7EB]
                bg-white
                p-6
                shadow-sm
              "
            >
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#16A6A1]
                "
              >
                Moj plan
              </p>


              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  text-[#15171A]
                "
              >
                Status pretplate
              </h2>


              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  bg-[#F4F6F2]
                  p-4
                "
              >
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    text-lg

                    ${
                      premium
                        ? `
                          bg-[#C8D52B]
                          text-[#111317]
                        `
                        : `
                          bg-white
                          text-[#667085]
                        `
                    }
                  `}
                >
                  {premium
                    ? "✓"
                    : "○"}
                </div>


                <div>
                  <p
                    className="
                      text-[10px]
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
                      mt-1
                      text-lg
                      font-black
                      text-[#15171A]
                    "
                  >
                    {premium
                      ? "Možeš Još Pro"
                      : "Free"}
                  </p>
                </div>
              </div>


              <div
                className="
                  mt-6
                  divide-y
                  divide-[#EEF0EC]
                  border-y
                  border-[#EEF0EC]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    py-4
                  "
                >
                  <span
                    className="
                      text-sm
                      text-[#667085]
                    "
                  >
                    Status
                  </span>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-bold

                      ${
                        premium
                          ? `
                            bg-[#16A6A1]/10
                            text-[#128D89]
                          `
                          : `
                            bg-[#F4F6F2]
                            text-[#667085]
                          `
                      }
                    `}
                  >
                    {premium
                      ? statusLabel()
                      : "Neaktivna"}
                  </span>
                </div>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    py-4
                  "
                >
                  <span
                    className="
                      text-sm
                      text-[#667085]
                    "
                  >
                    Aktivirano
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-[#15171A]
                    "
                  >
                    {activatedAt ||
                      "—"}
                  </span>
                </div>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    py-4
                  "
                >
                  <span
                    className="
                      text-sm
                      text-[#667085]
                    "
                  >
                    Naplata
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-[#15171A]
                    "
                  >
                    Stripe
                  </span>
                </div>
              </div>


              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-[#16A6A1]/20
                  bg-[#16A6A1]/5
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-black
                    text-[#15171A]
                  "
                >
                  {premium
                    ? "Pro račun je aktivan."
                    : "Trenutno koristiš Free plan."}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-[#667085]
                  "
                >
                  {premium
                    ? "Sve dostupne Pro funkcije možeš koristiti odmah."
                    : "Pro možeš aktivirati kada ti zatrebaju napredne funkcije."}
                </p>
              </div>

            </section>

          </div>
        )}

      </div>
    </RoleGuard>
  );
}