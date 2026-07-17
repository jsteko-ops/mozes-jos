"use client";

import {
  markCheckinReviewed,
} from "@/lib/services/klijentiService";


interface Checkin {

  id: string;

  weight: number;

  energy: number;

  sleep: number;

  hunger: number;

  water: string;

  comment: string;

  createdAt?: any;

  reviewed?: boolean;

}



interface CheckinHistoryProps {

  checkins: Checkin[];

  clientId: string;

  onReviewed: () => void;

}




function formatDate(timestamp: any) {

  if (!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleDateString("hr-HR");

}





export default function CheckinHistory({

  checkins,

  clientId,

  onReviewed,

}: CheckinHistoryProps) {



  async function handleReviewed(

    checkinId: string

  ) {


    await markCheckinReviewed(

      clientId,

      checkinId

    );


    onReviewed();


  }







  return (

    <div className="border rounded-xl bg-white p-5">


      <h2 className="text-xl font-bold mb-4">

        📋 Povijest Check-inova

      </h2>




      {checkins.length === 0 && (

        <p>

          Nema spremljenih check-inova.

        </p>

      )}







      <div className="space-y-4">



        {checkins.map((checkin)=>(



          <div

            key={checkin.id}

            className="border rounded-xl p-4 space-y-3"

          >



            <div className="flex justify-between">


              <b>

                📅 {formatDate(checkin.createdAt)}

              </b>



              {checkin.reviewed && (

                <span className="text-green-600 font-bold">

                  ✅ Pregledano

                </span>

              )}


            </div>





            <p>

              ⚖️ Težina:

              {" "}

              {String(checkin.weight).replace(".", ",")}

              {" "}kg

            </p>




            <p>

              😊 Energija:

              {" "}

              {checkin.energy}/5

            </p>




            <p>

              😴 San:

              {" "}

              {checkin.sleep}/5

            </p>




            <p>

              🍽 Glad:

              {" "}

              {checkin.hunger}/5

            </p>




            <p>

              💧 Voda:

              {" "}

              {checkin.water}

            </p>





            {checkin.comment && (

              <p>

                💬 {checkin.comment}

              </p>

            )}







            {!checkin.reviewed && (


              <button

                className="bg-black text-white px-4 py-2 rounded"

                onClick={()=>

                  handleReviewed(checkin.id)

                }

              >

                ✅ Označi pregledano

              </button>


            )}





          </div>



        ))}



      </div>



    </div>

  );


}