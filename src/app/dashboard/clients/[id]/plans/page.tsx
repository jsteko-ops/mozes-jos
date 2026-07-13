"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import Card from "@/components/ui/Card";
import PlanForm from "@/components/plans/PlanForm";
import PlanList from "@/components/plans/PlanList";


type Plan = {
  id: string;
  name: string;
  description?: string;
};



export default function PlansPage() {


  const { user, loading } = useAuth();

  const params = useParams();

  const clientId = params.id as string;



  const [plans, setPlans] = useState<Plan[]>([]);



  const fetchPlans = async () => {


    if (!clientId) return;



    const ref = collection(
      db,
      "clients",
      clientId,
      "plans"
    );



    const snap = await getDocs(ref);



    setPlans(

      snap.docs.map((doc) => ({

        id: doc.id,

        ...doc.data(),

      })) as Plan[]

    );

  };





  useEffect(() => {


    if (!loading && user && clientId) {

      fetchPlans();

    }


  }, [
    user,
    loading,
    clientId
  ]);






  if (loading) {

    return (
      <p>
        Loading...
      </p>
    );

  }





  return (

    <div className="space-y-6">


      <Card>

        <h1 className="text-2xl font-bold">
          Trening planovi
        </h1>


        <p className="text-gray-600 mt-1">
          Planovi ovog klijenta
        </p>


      </Card>





      <PlanForm

        clientId={clientId}

        onCreated={fetchPlans}

      />





      <PlanList

        plans={plans}

        clientId={clientId}

      />



    </div>

  );

}