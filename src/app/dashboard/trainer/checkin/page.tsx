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
  addCheckin,
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


  const [weight, setWeight] =
    useState("");


  const [energy, setEnergy] =
    useState(0);


  const [sleep, setSleep] =
    useState(0);


  const [hunger, setHunger] =
    useState(0);


  const [water, setWater] =
    useState("");


  const [comment, setComment] =
    useState("");


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



  async function saveCheckin() {

    if (!clientId) {

      alert("Odaberi klijenta");

      return;

    }


    if (!weight) {

      alert("Upiši težinu");

      return;

    }


    await addCheckin(
      clientId,
      {
        weight:
          Number(
            weight.replace(",", ".")
          ),

        energy,

        sleep,

        hunger,

        water,

        comment,

      }
    );


    setWeight("");

    setEnergy(0);

    setSleep(0);

    setHunger(0);

    setWater("");

    setComment("");


    await loadCheckins();


    alert("Check-in spremljen ✅");

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

            weight={weight}
            energy={energy}
            sleep={sleep}
            hunger={hunger}
            water={water}
            comment={comment}

            setWeight={setWeight}
            setEnergy={setEnergy}
            setSleep={setSleep}
            setHunger={setHunger}
            setWater={setWater}
            setComment={setComment}

            onSave={saveCheckin}

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