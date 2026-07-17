"use client";

import { useState } from "react";


type Props = {

  profile: React.ReactNode;

  measurements: React.ReactNode;

  plans: React.ReactNode;

  checkin?: React.ReactNode;

  nutrition?: React.ReactNode;

  chat?: React.ReactNode;

};



export default function ClientTabs({

  profile,

  measurements,

  plans,

  checkin,

  nutrition,

  chat,

}: Props) {


  const [active, setActive] =
    useState("profile");



  const tabs = [

    {
      id: "profile",
      name: "👤 Profil",
      content: profile,
    },

    {
      id: "measurements",
      name: "📏 Mjerenja",
      content: measurements,
    },

    {
      id: "plans",
      name: "🏋️ Planovi",
      content: plans,
    },


    ...(checkin
      ? [
          {
            id: "checkin",
            name: "✅ Check-in",
            content: checkin,
          },
        ]
      : []),



    ...(nutrition
      ? [
          {
            id: "nutrition",
            name: "🥗 Prehrana",
            content: nutrition,
          },
        ]
      : []),



    ...(chat
      ? [
          {
            id: "chat",
            name: "💬 Chat",
            content: chat,
          },
        ]
      : []),

  ];





  const current =
    tabs.find(
      (tab) => tab.id === active
    );





  return (

    <div className="mt-6">


      <div className="flex flex-wrap gap-2 mb-6">


        {tabs.map((tab)=>(


          <button

            key={tab.id}

            onClick={() =>
              setActive(tab.id)
            }

            className={

              active === tab.id

              ?

              "bg-black text-white px-4 py-2 rounded"

              :

              "border px-4 py-2 rounded"

            }

          >

            {tab.name}

          </button>


        ))}


      </div>





      <div>


        {

          current?.content

          ?

          current.content

          :

          <div className="border rounded-xl p-6 bg-white">

            <p>
              Modul uskoro dolazi 🚀
            </p>

          </div>

        }


      </div>


    </div>

  );

}