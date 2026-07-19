"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import ClientMeasurements from "@/components/owner/ClientMeasurements";
import ClientPlans from "@/components/owner/ClientPlans";
import ClientEditForm from "@/components/clients/ClientEditForm";
import ClientTabs from "@/components/owner/ClientTabs";
import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinHistory from "@/components/checkins/CheckinHistory";

import { db } from "@/lib/firebase";

import {
  getCheckins,
} from "@/lib/services/klijentiService";

import {
  doc,
  getDoc,
} from "firebase/firestore";


type Client = {

  id: string;

  name?: string;

  email?: string;

  phone?: string;

  note?: string;

  goal?: string;

  trainerId?: string;

  gymId?: string;

};




export default function OwnerClientProfile() {


  const params = useParams();


  const [client, setClient] =
    useState<Client | null>(null);



  const [trainer, setTrainer] =
    useState<any>(null);



  const [gym, setGym] =
    useState<any>(null);



  const [loading, setLoading] =
    useState(true);



  const [refresh, setRefresh] =
    useState(false);


const [checkins, setCheckins] =
  useState<any[]>([]);



  useEffect(() => {

    loadClient();
    

  }, [refresh]);







  async function loadClient() {


    try {


      const id =
        params.uid as string;




      const clientSnap =
        await getDoc(
          doc(
            db,
            "clients",
            id
          )
        );




      if (!clientSnap.exists()) {

        setLoading(false);

        return;

      }






      const clientData = {

        id: clientSnap.id,

        ...clientSnap.data(),

      } as Client;





      setClient(clientData);

const checkinData =
  await getCheckins(clientData.id);


setCheckins(checkinData);





      if (clientData.trainerId) {


        const trainerSnap =
          await getDoc(
            doc(
              db,
              "users",
              clientData.trainerId
            )
          );



        if (trainerSnap.exists()) {


          setTrainer(
            trainerSnap.data()
          );


        }


      }







      if (clientData.gymId) {


        const gymSnap =
          await getDoc(
            doc(
              db,
              "gyms",
              clientData.gymId
            )
          );



        if (gymSnap.exists()) {


          setGym(
            gymSnap.data()
          );


        }


      }




    } catch(error) {


      console.error(
        "Greška kod učitavanja profila:",
        error
      );


    }



    setLoading(false);


  }








  return (

    <ProtectedRoute
      allowedRoles={[
        "gym_owner",
        "trainer"
      ]}
    >


      <div className="p-6 space-y-6">






        {loading ? (


          <p>
            Učitavanje...
          </p>



        ) : !client ? (


          <p>
            Klijent nije pronađen.
          </p>



        ) : (



          <>



            <h1 className="text-3xl font-bold">
              👤 Profil klijenta
            </h1>







            <div className="rounded-xl border bg-white p-6 space-y-3">


              <div>

                <b>Ime:</b>{" "}

                {client.name || "-"}

              </div>




              <div>

                <b>Email:</b>{" "}

                {client.email || "-"}

              </div>




              <div>

                <b>Telefon:</b>{" "}

                {client.phone || "-"}

              </div>




              <div>

                <b>Cilj:</b>{" "}

                {client.goal || "-"}

              </div>




              <div>

                <b>Napomena:</b>{" "}

                {client.note || "-"}

              </div>




              <hr />





              <div>

                <b>Trener:</b>{" "}

                {
                  trainer?.name ||
                  trainer?.email ||
                  "-"
                }

              </div>




              <div>

                <b>Teretana:</b>{" "}

                {
                  gym?.name ||
                  "-"
                }

              </div>



            </div>








           <ClientTabs

  profile={

    <ClientEditForm

      client={client}

      onSaved={() => {

        setRefresh(
          !refresh
        );

      }}

    />

  }



  measurements={

    <ClientMeasurements

      clientId={client.id}

    />

  }



  plans={

    <ClientPlans

      clientId={client.id}

    />

  }



 checkin={

  <div className="space-y-6">


   <CheckinForm

  clientId={client.id}

  onSaveAction={async()=>{

    const updated =
      await getCheckins(client.id);

    setCheckins(updated);

  }}

/>


    <CheckinHistory

  checkins={checkins}

  clientId={client.id}

  onReviewed={async ()=>{


    const updated =
      await getCheckins(client.id);


    setCheckins(updated);


  }}

/>


  </div>

}



  nutrition={

    <div className="border rounded-xl bg-white p-6">

      <h2 className="text-xl font-bold">

        🥗 Prehrana

      </h2>


      <p className="mt-2">

        Modul prehrane dolazi.

      </p>


    </div>

  }



  chat={

    <div className="border rounded-xl bg-white p-6">

      <h2 className="text-xl font-bold">

        💬 Chat

      </h2>


      <p className="mt-2">

        Trener - klijent komunikacija.

      </p>


    </div>

  }

/>





          </>


        )}



      </div>



    </ProtectedRoute>

  );


}