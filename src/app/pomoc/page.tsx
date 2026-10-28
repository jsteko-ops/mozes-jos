type Country = "HR" | "BA" | "OTHER";

type Contact = {
  label: string;
  number: string;
  phone: string;
  description: string;
};

const contacts: Record<"HR" | "BA", Contact[]> = {
  HR: [
    {
      label: "Hitne službe",
      number: "112",
      phone: "112",
      description: "Neposredna životna opasnost."
    },
    {
      label: "Psihološka kriza - KBC Zagreb",
      number: "01 2376 335",
      phone: "+38512376335",
      description: "Centar za krizna stanja, 0-24 h."
    },
    {
      label: "Podrška žrtvama nasilja",
      number: "116 006",
      phone: "116006",
      description: "Podrška žrtvama kaznenih djela, 0-24 h."
    },
    {
      label: "Hrabri telefon za djecu",
      number: "116 111",
      phone: "116111",
      description: "Radnim danom 9-20 h."
    }
  ],
  BA: [
    {
      label: "Hitna medicinska pomoć",
      number: "124",
      phone: "124",
      description: "Ako je zdravlje ili život ugrožen."
    },
    {
      label: "Policija",
      number: "122",
      phone: "122",
      description: "Neposredna opasnost ili nasilje."
    },
    {
      label: "SOS za nasilje - Federacija BiH",
      number: "1265",
      phone: "1265",
      description: "Podrška i upućivanje na zaštitu."
    },
    {
      label: "SOS za nasilje - Republika Srpska",
      number: "1264",
      phone: "1264",
      description: "Podrška i upućivanje na zaštitu."
    },
    {
      label: "SOS crvena linija - Sarajevo",
      number: "033 222 000",
      phone: "+38733222000",
      description: "Pomoć kod nasilja, 0-24 h."
    }
  ]
};

const sources = {
  HR: [
    {
      name: "KBC Zagreb",
      url: "https://www.kbc-zagreb.hr/klinika-za-psihijatriju-i-psiholosku-medicinu.aspx"
    },
    {
      name: "Ministarstvo pravosuđa RH",
      url: "https://mpudt.gov.hr/o-ministarstvu/nadleznost-ministarstva-pravosudja-i-uprave/iz-pravosudnog-sustava-6372/podrska-zrtvama-i-svjedocima/kontakti-27338/27338"
    }
  ],
  BA: [
    {
      name: "Hitne službe u BiH",
      url: "https://www.gov.uk/foreign-travel-advice/bosnia-and-herzegovina/getting-help"
    },
    {
      name: "Fondacija lokalne demokratije",
      url: "https://fld.ba/bs/servisi/sos"
    }
  ]
};

// Server-rendered contacts: country selection works even if browser JavaScript is blocked.
// Next.js 16 requires awaiting searchParams.
export default async function PomocPage({
  searchParams,
}: {
  searchParams: Promise<{ zemlja?: string | string[] }>;
}) {
  const requested = (await searchParams).zemlja;
  const country: Country | null =
    requested === "HR" || requested === "BA" || requested === "OTHER"
      ? requested
      : null;

  const card: React.CSSProperties = {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    overflowWrap: "anywhere",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20
  };

  return (
    <main className="mj-help-page" style={{
      width: "min(100%, 100vw)",
      minWidth: 0,
      boxSizing: "border-box",
      overflowWrap: "anywhere",
      minHeight: "100vh",
      background: "#f5f7fb",
      color: "#18243a",
      padding: "32px 16px",
      fontFamily: "Arial, sans-serif"
    }}>
      <style>{`
        .mj-help-page, .mj-help-page * { box-sizing: border-box; }
        .mj-help-page p, .mj-help-page h1, .mj-help-page h2,
        .mj-help-page a { white-space: normal; overflow-wrap: anywhere; }
        @media (max-width: 480px) {
          .mj-help-page { padding: 20px 12px !important; }
          .mj-help-page h1 { font-size: 28px !important; }
          .mj-help-page .mj-help-card { padding: 16px !important; }
          .mj-help-page .mj-help-country-links { gap: 8px !important; }
          .mj-help-page .mj-help-country-links a {
            padding: 10px 12px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 760, width: "100%", minWidth: 0, margin: "0 auto" }}>
        <p style={{ color: "#4169ad", fontWeight: 700 }}>
          MOŽEŠ JoŠ FIT
        </p>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>
          Pomoć i sigurnost
        </h1>
        <p>
          Ako prolaziš kroz teško razdoblje, razmišljaš o
          samoozljeđivanju ili se ne osjećaš sigurno,
          pomoć je dostupna. Ne moraš kroz to prolaziti sam/a.
        </p>

        <section className="mj-help-card" style={{ ...card, marginTop: 24 }}>
          <h2>U kojoj se zemlji nalaziš?</h2>
          <p>Odaberi zemlju u kojoj trenutno trebaš pomoć.</p>
          <div className="mj-help-country-links" style={{
            display: "flex",
            minWidth: 0,
            gap: 10,
            flexWrap: "wrap"
          }}>
            {([
              ["HR", "Hrvatska"],
              ["BA", "Bosna i Hercegovina"],
              ["OTHER", "Druga zemlja"]
            ] as const).map(([code, title]) => (
              <a
                key={code}
                href={`/pomoc?zemlja=${code}`}
                aria-current={country === code ? "page" : undefined}
                style={{
                  textDecoration: "none",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  overflowWrap: "anywhere",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #aab8d0",
                  background: country === code ? "#193e81" : "#fff",
                  color: country === code ? "#fff" : "#18243a",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {title}
              </a>
            ))}
          </div>
        </section>

        {country === null && (
          <p role="status" style={{ marginTop: 24 }}>
            Odaberi svoju zemlju za prikaz odgovarajućih kontakata.
          </p>
        )}

        {country === "OTHER" && (
          <section className="mj-help-card" style={{ ...card, marginTop: 20 }}>
            <h2>Pomoć u tvojoj zemlji</h2>
            <p>
              Lokalni kontakti za ovu zemlju još nisu potvrđeni.
              U neposrednoj opasnosti kontaktiraj lokalnu
              hitnu službu ili najbližu bolnicu.
            </p>
            <p>
              Možeš potražiti dostupne linije pomoći
              prema zemlji na međunarodnom imeniku.
            </p>
            <a
              href="https://findahelpline.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pronađi liniju pomoći
            </a>
          </section>
        )}

        {(country === "HR" || country === "BA") && (
          <>
            <section className="mj-help-card" style={{
              ...card,
              marginTop: 20,
              borderColor: "#dc9f9f"
            }}>
              <h2>U neposrednoj opasnosti</h2>
              <p>
                Ako postoji opasnost od ozljeđivanja, odmah
                nazovi hitnu službu. Ako možeš, udalji se
                od predmeta kojima se možeš ozlijediti
                i potraži osobu od povjerenja.
              </p>
            </section>

            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              minWidth: 0,
              gap: 14,
              marginTop: 20
            }}>
              {contacts[country].map((item) => (
                <section className="mj-help-card" key={item.label} style={card}>
                  <h2 style={{ fontSize: 19, marginTop: 0 }}>
                    {item.label}
                  </h2>
                  <p>{item.description}</p>
                  <a
                    href={`tel:${item.phone}`}
                    style={{
                      display: "inline-block",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      overflowWrap: "anywhere",
                      background: "#193e81",
                      color: "white",
                      padding: "12px 18px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontWeight: 700
                    }}
                  >
                    Nazovi {item.number}
                  </a>
                </section>
              ))}
            </div>

            <section className="mj-help-card" style={{ ...card, marginTop: 20 }}>
              <h2>Sigurna kuća i zaštita od nasilja</h2>
              <p>
                Ako ti treba zaštita ili siguran smještaj,
                obrati se navedenim službama za podršku,
                policiji ili centru za socijalni rad.
                Oni mogu pomoći oko sigurnog postupanja
                i odgovarajućeg smještaja.
              </p>
              <p>
                Zbog sigurnosti ne objavljujemo povjerljive
                adrese skloništa.
              </p>
            </section>

            <section style={{ marginTop: 24 }}>
              <h2>Provjereni izvori</h2>
              {sources[country].map((source) => (
                <p key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.name}
                  </a>
                </p>
              ))}
            </section>
          </>
        )}

        <p style={{ marginTop: 28, fontSize: 13, color: "#57647a" }}>
          Ova stranica ne zahtijeva prijavu niti Premium.
          Ne šalje podatke treneru ili vlasniku teretane.
          Sama stranica ne sprema odabranu zemlju.
          Ako je uređaj pod nadzorom druge osobe,
          imaj na umu da preglednik može čuvati povijest.
          Brojeve i radno vrijeme potrebno je redovito provjeravati.
        </p>
      </div>
    </main>
  );
}
