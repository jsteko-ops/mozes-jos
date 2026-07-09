"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { addClient, getClients } from "@/lib/services/klijentiService";


type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;
};


export default function KlijentiPage() {

  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");


  async function loadClients() {

    if (!user) return;

    const data = await getClients(user.uid);

    setClients(data as Client[]);
  }


  useEffect(() => {
    loadClients();
  }, [user]);



  async function saveClient() {

    if (!user) return;


    await addClient(
      user.uid,
      {
        name,
        email,
        phone,
        note,
      }
    );


    setName("");
    setEmail("");
    setPhone("");
    setNote("");


    await loadClients();


    alert("Klijent dodan ✅");
  }



  return (

    <div className="p-6 space-y-8">


      <h1 className="text-3xl font-bold">
        Klijenti
      </h1>



      <div className="border rounded-xl p-5 max-w-md space-y-3">


        <h2 className="text-xl font-bold">
          Dodaj klijenta
        </h2>



        <input
          className="border p-2 w-full"
          placeholder="Ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />



        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />



        <input
          className="border p-2 w-full"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />



        <textarea
          className="border p-2 w-full"
          placeholder="Napomena"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />



        <button
          onClick={saveClient}
          className="bg-black text-white px-5 py-2 rounded"
        >
          Spremi
        </button>


      </div>




      <div>

        <h2 className="text-xl font-bold mb-4">
          Moji klijenti ({clients.length})
        </h2>



        <div className="space-y-3">


          {clients.map((client) => (

            <Link
              key={client.id}
              href={`/dashboard/trainer/klijenti/${client.id}`}
              className="block border rounded-xl p-4 hover:bg-gray-50"
            >

              <h3 className="font-bold">
                {client.name}
              </h3>


              <p>
                {client.email}
              </p>


              <p>
                {client.phone}
              </p>


              <p className="text-gray-500">
                {client.note}
              </p>


            </Link>

          ))}



          {clients.length === 0 && (

            <p>
              Nema još klijenata.
            </p>

          )}


        </div>

      </div>


    </div>

  );
}