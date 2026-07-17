"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import PremiumGuard from "@/components/auth/PremiumGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import ClientSelect from "@/components/checkins/ClientSelect";
import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import {
  getClients,
  getCheckins,
} from "@/lib/services/klijentiService";


export default function CheckinPage() {


  const { user } = useAuth();


  const [clients, setClients] =
    useState<any[]>([]);


  const [clientId, setClientId] =
    useState("");


  const [checkins, setCheckins] =
    useState<any[]>([]);


  const [loading, setLoading] =
    useState(true);




  useEffect(() => {


    async function loadClients() {


      if (!user) return;


      const data =
        await getClients(user.uid);


      setClients(data);


      setLoading(false);


    }


    loadClients();


  }, [user]);






  async function loadCheckins() {


    if (!clientId) {


      setCheckins([]);


      return;


    }



    const data =
      await getCheckins(clientId);



    setCheckins(data);


  }






  return (


    <RoleGuard allowedRoles={["trainer"]}>


      <PremiumGuard>


        <div className="p-6 space-y-6">


          <h1 className="text-3xl font-bold">
            ✅ Check-in klijenata
          </h1>




          {loading && (

            <p>
              Učitavanje klijenata...
            </p>

          )}






          <ClientSelect

            clients={clients}

            value={clientId}

            onChange={setClientId}

            onLoadHistory={loadCheckins}

          />







          <CheckinForm

            clientId={clientId}

            onSave={loadCheckins}

          />







          <CheckinHistory

            checkins={checkins}

            clientId={clientId}

            onReviewed={loadCheckins}

          />




        </div>


      </PremiumGuard>


    </RoleGuard>


  );


}