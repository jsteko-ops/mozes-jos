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


export default function ClientsPage() {

  const { user, loading } = useAuth();

  const [clients, setClients] = useState<any[]>([]);



  const fetchClients = async () => {

    if (!user) return;


    try {

      const ref = collection(
        db,
        "users",
        user.uid,
        "clients"
      );


      const snap = await getDocs(ref);



      const data = snap.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      }));



      setClients(data);



    } catch (error) {

      console.error(
        "Greška kod dohvaćanja klijenata:",
        error
      );

    }

  };



  useEffect(() => {

    if (!loading && user) {

      fetchClients();

    }

  }, [user, loading]);



  if (loading) {

    return (

      <div className="p-6">

        Učitavanje...

      </div>

    );

  }



  if (!user) {

    return (

      <div className="p-6">

        Nisi prijavljen.

      </div>

    );

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