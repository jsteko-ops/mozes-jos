"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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


  const searchParams =
    useSearchParams();


  const urlClientId =
    searchParams.get("client");


  const urlCheckinId =
    searchParams.get("checkin");



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




      if(urlClientId){


        setClientId(urlClientId);



        const dataCheckins =
          await getCheckins(urlClientId);



        setCheckins(dataCheckins);



      }



      setLoading(false);


    }



    loadClients();



  }, [user, urlClientId]);







  async function loadCheckins(
    id?: string
  ) {


    const selectedId =
      id || clientId;



    if(!selectedId){


      setCheckins([]);


      return;


    }



    const data =
      await getCheckins(selectedId);



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

            onChange={(id)=>{


              setClientId(id);


            }}


            onLoadHistory={() =>
              loadCheckins(clientId)
            }

          />








          <CheckinForm

            clientId={clientId}

            onSaveAction={() =>
              loadCheckins(clientId)
            }

          />








          <CheckinHistory

            checkins={checkins}

            clientId={clientId}

            onReviewed={() =>
              loadCheckins(clientId)
            }

          />





        </div>


      </PremiumGuard>


    </RoleGuard>


  );

}