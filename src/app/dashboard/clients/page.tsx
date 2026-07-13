"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/components/auth/AuthProvider";

import ClientForm from "@/components/clients/ClientForm";

import ClientList from "@/components/clients/ClientList";


type Client = {
  id: string;
  name: string;
  email: string;
  goal: string;
};



export default function ClientsPage() {


  const { user, loading } = useAuth();


  const [clients, setClients] = useState<Client[]>([]);



  const fetchClients = async () => {


    if (!user) return;


    const ref = collection(
      db,
      "users",
      user.uid,
      "clients"
    );


    const snap = await getDocs(ref);



    setClients(

      snap.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      })) as Client[]

    );


  };



  useEffect(() => {

    if (!loading && user) {

      fetchClients();

    }

  }, [user, loading]);



  if (loading) {

    return <p>Loading...</p>;

  }



  return (

    <div className="space-y-6">


      <h1 className="text-2xl font-bold">
        Klijenti
      </h1>



      <ClientForm
        onCreatedAction={fetchClients}
      />



      <ClientList
        clients={clients}
      />


    </div>

  );

}