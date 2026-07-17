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


  return date.toLocaleString("hr-HR");

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






  const sortedCheckins =
    [...checkins].sort(
      (a,b)=>
        b.createdAt?.seconds -
        a.createdAt?.seconds
    );







  return (

    <div className="border rounded-xl bg-white p-5 space-y-5">



      <div className="flex justify-between items-center">


        <h2 className="text-xl font-bold">

          📋 Povijest Check-inova

        </h2>


        <span className="text-sm text-gray-500">

          Ukupno: {checkins.length}

        </span>


      </div>







      {checkins.length === 0 && (

        <p>

          Nema spremljenih check-inova.

        </p>

      )}







      <div className="space-y-4">



        {sortedCheckins.map((checkin)=>(



          <div

            key={checkin.id}

            className="border rounded-xl p-5 space-y-3"

          >




            <div className="flex justify-between items-start">


              <div>

                <b>
                  📅 {formatDate(checkin.createdAt)}
                </b>

              </div>



              {

                checkin.reviewed

                ?

                <span className="text-green-600 font-bold">

                  ✅ Pregledano

                </span>


                :

                <span className="text-orange-600 font-bold">

                  ⏳ Čeka pregled

                </span>

              }


            </div>







            <div className="grid md:grid-cols-2 gap-3">


              <p>
                ⚖️ Težina:
                {" "}
                <b>
                  {String(checkin.weight).replace(".", ",")}
                  {" "}kg
                </b>
              </p>



              <p>
                ⚡ Energija:
                {" "}
                <b>
                  {checkin.energy}/5
                </b>
              </p>



              <p>
                😴 San:
                {" "}
                <b>
                  {checkin.sleep}/5
                </b>
              </p>



              <p>
                🍽 Glad:
                {" "}
                <b>
                  {checkin.hunger}/5
                </b>
              </p>



              <p>
                💧 Voda:
                {" "}
                <b>
                  {checkin.water}
                </b>
              </p>


            </div>







            {checkin.comment && (

              <div className="bg-gray-50 rounded p-3">

                💬 {checkin.comment}

              </div>

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