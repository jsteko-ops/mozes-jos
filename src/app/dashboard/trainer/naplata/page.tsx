"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function NaplataPage() {

  const { user } = useAuth();

  const [premium, setPremium] = useState(false);
  const [status, setStatus] = useState("");
  const [stripeCustomer, setStripeCustomer] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadSubscription(){

      if(!user){
        return;
      }


      const snap = await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );


      if(snap.exists()){

        const data = snap.data();


        setPremium(
          data.isPremium === true
        );


        setStatus(
          data.subscriptionStatus || ""
        );


        setStripeCustomer(
          data.stripeCustomerId || ""
        );


        setSubscriptionId(
          data.stripeSubscriptionId || ""
        );

      }


      setLoading(false);

    }


    loadSubscription();


  },[user]);





  async function startCheckout(){


    if(!user){

      alert(
        "Nema prijavljenog korisnika"
      );

      return;

    }



    const res =
    await fetch(
      "/api/stripe/checkout",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          userId:user.uid,

          email:user.email,

          plan:"pro"

        })

      }
    );



    const data =
    await res.json();



    if(data.error){

      alert(data.error);

      return;

    }



    if(data.url){

      window.location.href =
      data.url;

    }

  }






  return(

    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">
          💳 Naplata
        </h1>



        <div className="border rounded-xl p-5 space-y-4">


          <h2 className="text-xl font-bold">
            Možeš Još Pro
          </h2>



          {
            loading ?

            <p>
              Učitavanje...
            </p>

            :

            premium ?

            <div>

              <p className="font-bold text-green-600">
                ✅ Aktivna pretplata
              </p>


              <p>
                Status: {status}
              </p>


              <p>
                Stripe Customer:
                <br />
                {stripeCustomer || "-"}
              </p>


              <p>
                Subscription:
                <br />
                {subscriptionId || "-"}
              </p>


            </div>


            :


            <div>

              <p>
                Nema aktivne pretplate.
              </p>


              <button

                className="bg-black text-white px-5 py-2 rounded mt-5"

                onClick={startCheckout}

              >
                Aktiviraj Pro plan

              </button>


            </div>

          }



        </div>


      </div>


    </RoleGuard>

  );

}