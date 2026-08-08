"use client";


interface Client {
  id: string;
  name: string;
}


interface ClientSelectProps {
  clients: Client[];
  value: string;
  onChange: (
    clientId: string
  ) => void;
  onLoadHistory:
    () => void;
}


export default function ClientSelect({
  clients,
  value,
  onChange,
  onLoadHistory,
}: ClientSelectProps) {
  const selectedClient =
    clients.find(
      (client) =>
        client.id === value
    );


  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-start
          gap-4
          border-b
          border-[#EEF0EC]
          p-5
          sm:p-6
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
            bg-[#16A6A1]/10
            text-lg
            font-black
            text-[#128D89]
          "
        >
          K
        </div>


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
            Odabir klijenta
          </p>


          <h2
            className="
              mt-1
              text-xl
              font-black
              tracking-tight
              text-[#15171A]
            "
          >
            Odaberi klijenta
          </h2>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Odaberi klijenta za
            pregled ili unos
            Check-ina.
          </p>
        </div>
      </div>


      {/* CONTENT */}

      <div
        className="
          space-y-5
          p-5
          sm:p-6
        "
      >

        <div>
          <label
            htmlFor="checkin-client"
            className="
              mb-2
              block
              text-xs
              font-bold
              text-[#344054]
            "
          >
            Klijent
          </label>


          <select
            id="checkin-client"
            value={value}
            onChange={(
              event
            ) =>
              onChange(
                event.target.value
              )
            }
            className="
              min-h-12
              w-full
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#15171A]
              outline-none
              transition
              focus:border-[#16A6A1]
              focus:ring-4
              focus:ring-[#16A6A1]/10
            "
          >
            <option value="">
              Odaberi klijenta
            </option>


            {clients.map(
              (client) => (
                <option
                  key={
                    client.id
                  }
                  value={
                    client.id
                  }
                >
                  {client.name}
                </option>
              )
            )}
          </select>
        </div>


        {selectedClient && (
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-[#C8D52B]/30
              bg-[#C8D52B]/10
              p-4
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
                bg-[#111317]
                text-xs
                font-black
                text-[#C8D52B]
              "
            >
              {getInitials(
                selectedClient.name
              )}
            </div>


            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#5F6810]
                "
              >
                Odabrani klijent
              </p>


              <p
                className="
                  mt-0.5
                  truncate
                  text-sm
                  font-black
                  text-[#15171A]
                "
              >
                {
                  selectedClient.name
                }
              </p>
            </div>
          </div>
        )}


        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-[#EEF0EC]
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-[#98A2B3]
            "
          >
            {value
              ? "Učitaj dosadašnje Check-inove odabranog klijenta."
              : "Prvo odaberi klijenta."}
          </p>


          <button
            type="button"
            onClick={
              onLoadHistory
            }
            disabled={
              !value
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#111317]
              px-5
              py-3
              text-sm
              font-black
              text-white
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#202328]
              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:translate-y-0
            "
          >
            Učitaj povijest

            <span
              className="
                text-[#C8D52B]
              "
            >
              →
            </span>
          </button>
        </div>

      </div>


      <div
        className="
          h-1
          bg-gradient-to-r
          from-[#C8D52B]
          via-[#16A6A1]
          to-transparent
        "
      />

    </section>
  );
}


function getInitials(
  name: string
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