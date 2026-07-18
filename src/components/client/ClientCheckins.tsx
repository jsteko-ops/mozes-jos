"use client";

interface Checkin {

  id: string;

  weight?: number;

  energy?: number;

  sleep?: number;

  hunger?: number;

  water?: string;

  comment?: string;

  trainerComment?: string;

  createdAt?: any;

  reviewed?: boolean;

}



interface Props {

  checkins: Checkin[];

}



function formatDate(timestamp:any){

  if(!timestamp) return "-";


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleString("hr-HR");

}





export default function ClientCheckins({

  checkins,

}:Props){


  if(checkins.length===0){

    return (

      <div className="border rounded-xl bg-white p-5">

        Nema poslanih check-inova.

      </div>

    );

  }



  return (

    <div className="space-y-5">


      <h2 className="text-xl font-bold">

        ✅ Moji Check-inovi

      </h2>




      {checkins.map((checkin)=>(


        <div

          key={checkin.id}

          className="border rounded-xl bg-white p-5 space-y-3"

        >



          <p className="font-bold">

            📅 {formatDate(checkin.createdAt)}

          </p>



          <p>

            ⚖️ Težina:

            {" "}

            <b>

            {checkin.weight} kg

            </b>

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




          {checkin.comment && (

            <div className="bg-gray-50 rounded p-3">

              <b>

              Moj komentar:

              </b>

              <br />

              {checkin.comment}

            </div>

          )}






          {checkin.trainerComment && (

            <div className="border rounded p-3">

              <b>

              💬 Komentar trenera:

              </b>

              <br />

              {checkin.trainerComment}

            </div>

          )}



          {!checkin.trainerComment && (

            <p className="text-orange-600">

              ⏳ Trener još nije odgovorio

            </p>

          )}



        </div>



      ))}



    </div>

  );

}