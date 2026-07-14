"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import { addGymMember } from "@/lib/addGymMember";
import { getGymMembers } from "@/lib/getGymMembers";


export default function OwnerDashboard() {

  const [gymId, setGymId] = useState<string | null>(null);

  const [members, setMembers] = useState<any[]>([]);

  const [trainerEmail, setTrainerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [loading, setLoading] = useState(false);



  const loadMembers = async (id: string) => {

    const data = await getGymMembers(id);

    setMembers(data);

  };



  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) return;


        const snap = await getDoc(
          doc(db, "users", user.uid)
        );


        const data = snap.data();


        if (data?.gymId) {

          setGymId(data.gymId);

          loadMembers(data.gymId);

        }

      }
    );


    return () => unsub();


  }, []);





  const addMember = async (
    email: string,
    role: "trainer" | "client"
  ) => {


    if (!gymId) return;



    try {


      setLoading(true);



      await addGymMember({

        gymId,

        email,

        role,

        addedBy: "owner",

      });



      await loadMembers(gymId);



      alert(
        role === "trainer"
          ? "Trener dodan."
          : "Klijent dodan."
      );



    } catch(error:any) {


      alert(error.message);


    } finally {


      setLoading(false);


    }

  };





  const trainers = members.filter(
    (m)=>m.gymRole==="trainer"
  );


  const clients = members.filter(
    (m)=>m.gymRole==="client"
  );





  return (

    <ProtectedRoute allowedRoles={["gym_owner"]}>


      <div className="p-6 space-y-8">


        <h1 className="text-3xl font-bold">
          🏢 Moja teretana
        </h1>



        <p className="text-gray-600">
          Gym ID: {gymId}
        </p>





        <div className="grid grid-cols-3 gap-4">


          <div className="rounded-xl border bg-white p-5">

            <h3 className="text-gray-500">
              Treneri
            </h3>

            <p className="text-3xl font-bold">
              {trainers.length}
            </p>

          </div>




          <div className="rounded-xl border bg-white p-5">

            <h3 className="text-gray-500">
              Klijenti
            </h3>

            <p className="text-3xl font-bold">
              {clients.length}
            </p>

          </div>




          <div className="rounded-xl border bg-white p-5">

            <h3 className="text-gray-500">
              Ukupno članova
            </h3>

            <p className="text-3xl font-bold">
              {members.length}
            </p>

          </div>


        </div>






        <div className="rounded-xl border bg-white p-5">


          <h2 className="text-xl font-bold mb-3">
            Dodaj člana
          </h2>




          <div className="flex gap-2 mb-4">


            <input

              className="border rounded p-2"

              placeholder="Email trenera"

              value={trainerEmail}

              onChange={(e)=>
                setTrainerEmail(e.target.value)
              }

            />



            <button

              className="bg-blue-600 text-white px-4 rounded"

              disabled={loading}

              onClick={() => {

                addMember(
                  trainerEmail,
                  "trainer"
                );

                setTrainerEmail("");

              }}

            >

              Dodaj trenera

            </button>


          </div>





          <div className="flex gap-2">


            <input

              className="border rounded p-2"

              placeholder="Email klijenta"

              value={clientEmail}

              onChange={(e)=>
                setClientEmail(e.target.value)
              }

            />



            <button

              className="bg-green-600 text-white px-4 rounded"

              disabled={loading}

              onClick={() => {

                addMember(
                  clientEmail,
                  "client"
                );

                setClientEmail("");

              }}

            >

              Dodaj klijenta

            </button>



          </div>



        </div>







        <div className="grid md:grid-cols-2 gap-6">






          <div className="rounded-xl border bg-white p-5">


            <h2 className="text-xl font-bold mb-3">
              👨‍🏫 Treneri
            </h2>



            {trainers.map((trainer)=>(


              <div

                key={trainer.uid}

                className="border-b py-2"

              >

                <b>
                  {trainer.name}
                </b>

                <br />

                <span>
                  {trainer.email}
                </span>


              </div>


            ))}


          </div>









          <div className="rounded-xl border bg-white p-5">


            <h2 className="text-xl font-bold mb-3">
              👤 Klijenti
            </h2>




            {clients.map((client)=>(


              <Link

                key={client.uid}

                href={`/dashboard/owner/clients/${client.uid}`}

                className="block border-b py-3 hover:bg-gray-50"

              >

                <b>
                  {client.name}
                </b>


                <br />


                <span>
                  {client.email}
                </span>


              </Link>


            ))}


          </div>



        </div>



      </div>


    </ProtectedRoute>

  );

}