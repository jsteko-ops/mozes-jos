"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import {
  canAccessFeature,
} from "@/lib/auth/checkPremium";

import {
  getClients,
} from "@/lib/services/klijentiService";

import ClientReport from "@/components/reports/ClientReport";


type Client = {
  id: string;
  name: string;
  email: string;
};


export default function ReportsPage() {
  const {
    user,
    userProfile,
    loading,
  } = useAuth();


  const [
    clients,
    setClients,
  ] = useState<Client[]>(
    []
  );


  const [
    loadingClients,
    setLoadingClients,
  ] = useState(true);


  useEffect(() => {
    async function load() {
      if (
        !user ||
        !userProfile
      ) {
        return;
      }


      try {
        setLoadingClients(
          true
        );


        if (
          userProfile.role ===
          "trainer"
        ) {
          const data =
            await getClients(
              user.uid
            );


          setClients(
            data as Client[]
          );
        }
      } catch (error) {
        console.error(
          "Greška kod učitavanja klijenata za izvještaje:",
          error
        );
      } finally {
        setLoadingClients(
          false
        );
      }
    }


    void load();
  }, [
    user,
    userProfile,
  ]);


  function getInitials(
    name?: string
  ) {
    if (!name) {
      return "K";
    }


    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .toUpperCase();
  }


  if (loading) {
    return (
      <div className="space-y-5">
        <div
          className="
            h-32
            animate-pulse
            rounded-[26px]
            border
            border-[#E5E7EB]
            bg-white
          "
        />

        <div
          className="
            h-40
            animate-pulse
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
          "
        />
      </div>
    );
  }


  if (!userProfile) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-6
          text-sm
          text-[#667085]
          shadow-sm
        "
      >
        Korisnički profil nije
        dostupan.
      </div>
    );
  }


  const hasReportsAccess =
    canAccessFeature(
      userProfile,
      "reports"
    );


  if (!hasReportsAccess) {
    return (
      <div className="space-y-7">

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
            Izvještaji
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
            Izvještaji klijenata
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
            Generiraj profesionalne
            PDF izvještaje o napretku,
            mjerenjima, Check-inovima,
            treninzima i prehrani.
          </p>
        </div>


        {/* LOCKED */}

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
              -right-20
              -top-24
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
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#C8D52B]
                  text-xl
                  text-[#111317]
                "
              >
                🔒
              </div>


              <div>
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
                      tracking-wider
                      text-[#DDE84B]
                    "
                  >
                    Možeš Još Pro
                  </span>
                </div>


                <h2
                  className="
                    mt-4
                    text-2xl
                    font-black
                    text-white
                  "
                >
                  Otključaj profesionalne
                  izvještaje
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-white/60
                  "
                >
                  Pro omogućuje izradu
                  PDF izvještaja za
                  klijente s pregledom
                  mjerenja, Check-inova,
                  treninga i prehrane.
                </p>
              </div>
            </div>


            <Link
              href="/dashboard/trainer/naplata"
              className="
                inline-flex
                min-h-12
                shrink-0
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
              "
            >
              Otključaj Pro

              <span>
                →
              </span>
            </Link>
          </div>
        </section>

      </div>
    );
  }


  return (
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
            Pro izvještaji
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
            Izvještaji klijenata
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
            Odaberi klijenta i
            razdoblje te generiraj
            PDF izvještaj o njegovom
            napretku.
          </p>
        </div>


        {!loadingClients && (
          <div
            className="
              flex
              w-fit
              items-center
              gap-3
              rounded-2xl
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-3
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
                bg-[#C8D52B]/20
                text-sm
                font-black
                text-[#15171A]
              "
            >
              {clients.length}
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
                Dostupno
              </p>

              <p
                className="
                  text-sm
                  font-bold
                  text-[#15171A]
                "
              >
                {clients.length === 1
                  ? "1 klijent"
                  : `${clients.length} klijenata`}
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


      {/* INFO */}

      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-[#16A6A1]/20
          bg-[#16A6A1]/5
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
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
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#16A6A1]
              text-white
            "
          >
            ↓
          </div>


          <div>
            <p
              className="
                text-sm
                font-black
                text-[#15171A]
              "
            >
              PDF izvještaj
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[#667085]
              "
            >
              Izvještaj uključuje
              dostupne podatke o
              napretku odabranog
              klijenta.
            </p>
          </div>
        </div>


        <span
          className="
            w-fit
            rounded-full
            bg-[#C8D52B]/15
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-[#5F6810]
          "
        >
          Pro aktivan
        </span>
      </div>


      {/* LOADING */}

      {loadingClients && (
        <div
          className="
            space-y-4
          "
        >
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="
                  h-28
                  animate-pulse
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  bg-white
                "
              />
            )
          )}
        </div>
      )}


      {/* EMPTY */}

      {!loadingClients &&
        clients.length ===
          0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D8DDD0]
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#C8D52B]/15
                text-2xl
              "
            >
              📄
            </div>


            <h2
              className="
                mt-5
                text-xl
                font-black
                text-[#15171A]
              "
            >
              Još nema klijenata
            </h2>


            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-[#667085]
              "
            >
              Kada dodaš klijente,
              ovdje ćeš moći
              generirati njihove
              PDF izvještaje.
            </p>
          </div>
        )}


      {/* CLIENT LIST */}

      {!loadingClients &&
        clients.length > 0 && (
          <div
            className="
              space-y-4
            "
          >
            {clients.map(
              (
                client,
                index
              ) => (
                <div
                  key={
                    client.id
                  }
                  className="
                    group
                    flex
                    flex-col
                    gap-5
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-[#C8D52B]
                    hover:shadow-md
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#111317]
                        text-sm
                        font-black
                        tracking-wide
                        text-[#C8D52B]
                      "
                    >
                      {getInitials(
                        client.name
                      )}
                    </div>


                    <div
                      className="
                        min-w-0
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <h2
                          className="
                            truncate
                            text-lg
                            font-black
                            text-[#15171A]
                          "
                        >
                          {client.name ||
                            "Klijent"}
                        </h2>


                        {index ===
                          0 && (
                          <span
                            className="
                              rounded-full
                              bg-[#16A6A1]/10
                              px-2.5
                              py-1
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-[#128D89]
                            "
                          >
                            Klijent
                          </span>
                        )}
                      </div>


                      <p
                        className="
                          mt-1
                          truncate
                          text-sm
                          text-[#667085]
                        "
                      >
                        {client.email}
                      </p>
                    </div>
                  </div>


                  <div
                    className="
                      shrink-0
                    "
                  >
                    <ClientReport
                      clientId={
                        client.id
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}

    </div>
  );
}