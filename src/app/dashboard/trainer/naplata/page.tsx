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
  const [activatedAt, setActivatedAt] = useState("");
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


        if(data.premiumActivatedAt){

          const date =
          data.premiumActivatedAt.toDate();

          setActivatedAt(
            date.toLocaleDateString("hr-HR")
          );

        }

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



        <div className="border rounded-xl p-6 bg-white shadow-sm">


          <h2 className="text-2xl font-bold">
            Možeš Još Pro
          </h2>



          <p className="mt-2 text-gray-600">
            Profesionalni alati za trenere.
          </p>




          {
            loading ?


            <p className="mt-5">
              Učitavanje...
            </p>



            :



            premium ?



            <div className="mt-6 space-y-3">


              <p className="text-green-600 font-bold text-lg">
                ✅ Aktivna pretplata
              </p>


              <p>
                Status: 
                <span className="font-bold ml-2">
                  {status}
                </span>
              </p>



              {
                activatedAt &&

                <p>
                  Aktivirano:
                  <span className="font-bold ml-2">
                    {activatedAt}
                  </span>
                </p>

              }



              <div className="mt-5 rounded-lg bg-gray-100 p-4">

                <p className="font-semibold">
                  Vaš Pro račun je aktivan.
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Možete koristiti sve dostupne Pro funkcije.
                </p>

              </div>



            </div>



            :



            <div className="mt-6">


              <p>
                Trenutno nemate aktivnu pretplatu.
              </p>



              <button

                className="mt-5 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"

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