"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import Card from "@/components/ui/Card";

import {
  listenUnreadCheckins,
} from "@/lib/services/notificationService";

import {
  listenUnreadTrainerMessages,
} from "@/lib/services/chat/chatNotifications";

import {
  getTrainerStats,
} from "@/lib/services/klijentiService";


export default function TrainerPage() {


  const { user } = useAuth();

  const router = useRouter();



  const [stats, setStats] = useState({

    clientsCount: 0,

    measurementsCount: 0,

  });



  const [checkinCount, setCheckinCount] =
    useState(0);



  const [messageCount, setMessageCount] =
    useState(0);



  const [loading, setLoading] =
    useState(true);




  useEffect(() => {


    async function loadStats() {


      if (!user) return;



      const data =
        await getTrainerStats(
          user.uid
        );



      setStats(data);



      setLoading(false);


    }



    loadStats();


  }, [user]);





  useEffect(() => {


    if (!user) return;



    const unsubscribe =
      listenUnreadCheckins(

        user.uid,

        (count)=>{

          setCheckinCount(count);

        }

      );



    return () =>
      unsubscribe();



  }, [user]);

  useEffect(() => {


    if (!user) return;



    const unsubscribe =
      listenUnreadTrainerMessages(

        user.uid,

        (count)=>{

          setMessageCount(count);

        }

      );



    return () =>
      unsubscribe();



  }, [user]);




  return (


    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">



        <div>


          <h1 className="text-3xl font-bold">

            🏋️ Trainer Dashboard

          </h1>



          <p className="text-gray-500 mt-2">

            Pregled aktivnosti i napretka klijenata

          </p>


        </div>





        {loading ? (


          <p>

            Učitavanje statistike...

          </p>



        ) : (



          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">





            <Card

              className="
                cursor-pointer
                hover:shadow-md
                transition
              "

            >


              <div

                onClick={() =>
                  router.push(
                    "/dashboard/trainer/klijenti"
                  )
                }

              >


                <h2 className="text-xl font-bold">

                  👥 Klijenti

                </h2>



                <p className="text-4xl font-bold mt-3">

                  {stats.clientsCount}

                </p>



                <p className="text-gray-500 mt-2">

                  Aktivni klijenti

                </p>



              </div>


            </Card>






            <Card

              className="
                cursor-pointer
                hover:shadow-md
                transition
              "

            >


              <div

                onClick={() =>
                  router.push(
                    "/dashboard/trainer/mjerenja"
                  )
                }

              >


                <h2 className="text-xl font-bold">

                  ⚖️ Mjerenja

                </h2>



                <p className="text-4xl font-bold mt-3">

                  {stats.measurementsCount}

                </p>



                <p className="text-gray-500 mt-2">

                  Ukupno mjerenja

                </p>



              </div>


            </Card>





            <Card

              className="
                cursor-pointer
                hover:shadow-md
                transition
              "

            >


              <div

                onClick={() =>
                  router.push(
                    "/dashboard/chat"
                  )
                }

              >


                <h2 className="text-xl font-bold">

                  💬 Poruke

                </h2>



                <p className="text-4xl font-bold mt-3">

                  {messageCount}

                </p>



                <p className="text-gray-500 mt-2">

                  Nove poruke

                </p>



              </div>


            </Card>

            <Card

              className="
                cursor-pointer
                hover:shadow-md
                transition
              "

            >


              <div

                onClick={() =>
                  router.push(
                    "/dashboard/trainer/checkin"
                  )
                }

              >


                <h2 className="text-xl font-bold">

                  🔔 Check-in

                </h2>



                <p className="text-4xl font-bold mt-3">

                  {checkinCount}

                </p>



                <p className="text-gray-500 mt-2">

                  Novi check-inovi za pregled

                </p>



              </div>


            </Card>






            <Card>


              <h2 className="text-xl font-bold">

                🏆 Status

              </h2>



              <p className="mt-3 text-gray-600">

                Aktivan trener

              </p>



            </Card>






            <Card>


              <h2 className="text-xl font-bold">

                🚀 Možeš Još

              </h2>



              <p className="mt-3 text-gray-600">

                Radi na napretku klijenata

              </p>



            </Card>





          </div>


        )}



      </div>


    </RoleGuard>


  );


}