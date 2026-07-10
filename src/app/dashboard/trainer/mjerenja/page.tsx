"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import PremiumGuard from "@/components/auth/PremiumGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  getClients,
  getMeasurements,
} from "@/lib/services/klijentiService";



export default function MjerenjaPage() {


  const { user } = useAuth();



  const [data, setData] =
    useState<any[]>([]);



  const [loading, setLoading] =
    useState(true);





  useEffect(() => {


    async function load() {


      if (!user) return;




      const clients =
        await getClients(user.uid);




      const allMeasurements:any[] = [];




      for (const client of clients) {


        const measurements =
          await getMeasurements(client.id);




        measurements.forEach((m:any)=>{


          allMeasurements.push({

            clientName: client.name,

            weight: m.weight,

            height: m.height,

            waist: m.waist,

            chest: m.chest,

            arm: m.arm,

            createdAt: m.createdAt

          });


        });


      }





      allMeasurements.sort((a,b)=>{


        const dateA =
          a.createdAt?.seconds || 0;


        const dateB =
          b.createdAt?.seconds || 0;



        return dateB - dateA;


      });





      setData(allMeasurements);


      setLoading(false);



    }




    load();



  },[user]);







  function formatDate(timestamp:any){


    if(!timestamp) return "";



    if(timestamp.toDate){


      return timestamp
        .toDate()
        .toLocaleDateString("hr-HR");


    }


    return "";


  }








  return (

    <RoleGuard allowedRoles={["trainer"]}>

      <PremiumGuard>



        <div className="p-6 space-y-6">



          <h1 className="text-3xl font-bold">
            ⚖️ Mjerenja klijenata
          </h1>





          {
            loading &&

            <p>
              Učitavanje...
            </p>

          }





          {
            !loading && data.length === 0 &&

            <p>
              Nema spremljenih mjerenja.
            </p>

          }





          <div className="space-y-4">



            {
              data.map((m,index)=>(


                <div

                  key={index}

                  className="border rounded-xl p-4"

                >



                  <h2 className="text-xl font-bold">
                    👤 {m.clientName}
                  </h2>




                  <p className="text-sm text-gray-500">
                    📅 {formatDate(m.createdAt)}
                  </p>




                  <p>
                    ⚖️ Težina: {String(m.weight).replace(".",",")} kg
                  </p>





                  {
                    m.height > 0 &&

                    <p>
                      📏 Visina: {m.height} cm
                    </p>

                  }





                  {
                    m.waist > 0 &&

                    <p>
                      📐 Struk: {m.waist} cm
                    </p>

                  }





                  {
                    m.chest > 0 &&

                    <p>
                      🫁 Prsa: {m.chest} cm
                    </p>

                  }





                  {
                    m.arm > 0 &&

                    <p>
                      💪 Ruka: {m.arm} cm
                    </p>

                  }



                </div>


              ))

            }



          </div>



        </div>



      </PremiumGuard>

    </RoleGuard>

  );

}