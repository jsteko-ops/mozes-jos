"use client";

import type {
  ClientGender,
} from "@/lib/createClientForTrainer";


type Client = {

  id: string;

  name?: string;

  email?: string;

  phone?: string;

  note?: string;

  goal?: string;

  gender?: ClientGender;

};


type Props = {

  client: Client;

  onEdit: () => void;

};


function formatGender(
  gender?: ClientGender
) {

  switch (gender) {

    case "male":

      return "Muški";


    case "female":

      return "Ženski";


    case "prefer_not_to_say":

      return "Ne želi se izjasniti";


    default:

      return "-";

  }

}


export default function ClientHeader({

  client,

  onEdit,

}: Props) {


  return (

    <div className="space-y-3 rounded-xl border bg-white p-6">


      <h2 className="text-2xl font-bold">

        👤 {client.name || "-"}

      </h2>


      <div>

        <b>Email:</b>{" "}

        {client.email || "-"}

      </div>


      <div>

        <b>Spol:</b>{" "}

        {formatGender(
          client.gender
        )}

      </div>


      <div>

        <b>Telefon:</b>{" "}

        {client.phone || "-"}

      </div>


      <div>

        <b>Napomena:</b>{" "}

        {client.note || "-"}

      </div>


      <div>

        <b>Cilj:</b>{" "}

        {client.goal || "-"}

      </div>


      <button

        type="button"

        onClick={onEdit}

        className="
          rounded-lg
          bg-black
          px-5
          py-2
          text-white
          hover:bg-gray-800
        "

      >

        ✏️ Uredi klijenta

      </button>


    </div>

  );

}