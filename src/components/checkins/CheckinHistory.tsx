"use client";

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


import { markCheckinReviewed } from "@/lib/services/klijentiService";


function formatDate(timestamp: any) {
  if (!timestamp) return "";

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
    <div className="border rounded-xl p-5">


      <h2 className="text-xl font-bold mb-4">
        📋 Povijest Check-inova
      </h2>



      {checkins.length === 0 && (
        <p>
          Nema spremljenih check-inova.
        </p>
      )}



      <div className="space-y-4">


        {checkins.map((checkin) => (


          <div
            key={checkin.id}
            className="border rounded-xl p-4 space-y-3"
          >


            <div className="flex justify-between items-center">


              <div className="font-bold text-lg">
                📅 {formatDate(checkin.createdAt)}
              </div>



              {checkin.reviewed && (
                <span className="text-green-600 font-bold">
                  ✅ Pregledano
                </span>
              )}


            </div>





            <div>
              ⚖️ Težina:
              {" "}
              {String(checkin.weight).replace(".", ",")} kg
            </div>



            <div>
              😊 Energija:
              {" "}
              {checkin.energy}/5
            </div>



            <div>
              😴 San:
              {" "}
              {checkin.sleep}/5
            </div>



            <div>
              🍽 Glad:
              {" "}
              {checkin.hunger}/5
            </div>



            <div>
              💧 Voda:
              {" "}
              {checkin.water}
            </div>



            {checkin.comment && (
              <div>
                💬
                {" "}
                {checkin.comment}
              </div>
            )}





            {!checkin.reviewed && (

              <button

                className="bg-black text-white px-4 py-2 rounded"

                onClick={() =>
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