"use client";

type Props = {
  clients: any[];
  value: string;
  onChange: (id:string)=>void;
};


export default function ChatClientSelect({

  clients,

  value,

  onChange,

}: Props) {


  return (

    <select

      className="border rounded-xl p-3 w-full"

      value={value}

      onChange={(e)=>
        onChange(e.target.value)
      }

    >

      <option value="">
        Odaberi klijenta
      </option>


      {clients.map((client)=>(

        <option

          key={client.id}

          value={client.id}

        >

          {client.name} - {client.email}

        </option>

      ))}


    </select>

  );

}