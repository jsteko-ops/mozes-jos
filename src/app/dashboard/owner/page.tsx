"use client";

import { useEffect, useState } from "react";
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



  const addTrainer = async () => {
    if (!gymId) return;

    try {
      setLoading(true);

      await addGymMember({
        gymId,
        email: trainerEmail,
        role: "trainer",
        addedBy: "owner",
      });

      await loadMembers(gymId);

      setTrainerEmail("");

      alert("Trener dodan.");

    } catch (error: any) {
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };



  const addClient = async () => {
    if (!gymId) return;

    try {
      setLoading(true);

      await addGymMember({
        gymId,
        email: clientEmail,
        role: "client",
        addedBy: "owner",
      });

      await loadMembers(gymId);

      setClientEmail("");

      alert("Klijent dodan.");

    } catch (error: any) {
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };



  const trainers = members.filter(
    (m) => m.gymRole === "trainer"
  );


  const clients = members.filter(
    (m) => m.gymRole === "client"
  );



  return (
    <ProtectedRoute allowedRoles={["gym_owner"]}>

      <div style={{ padding:20 }}>

        <h1>
          🏢 Gym Owner Panel
        </h1>


        <p>
          Gym ID:
          <b>
            {" "}{gymId}
          </b>
        </p>



        <hr />



        <h3>
          Dodaj trenera
        </h3>

        <input
          placeholder="Email trenera"
          value={trainerEmail}
          onChange={(e)=>
            setTrainerEmail(e.target.value)
          }
        />

        <button
          onClick={addTrainer}
          disabled={loading}
        >
          Dodaj trenera
        </button>




        <h3>
          Dodaj klijenta
        </h3>

        <input
          placeholder="Email klijenta"
          value={clientEmail}
          onChange={(e)=>
            setClientEmail(e.target.value)
          }
        />

        <button
          onClick={addClient}
          disabled={loading}
        >
          Dodaj klijenta
        </button>




        <hr />



        <h2>
          👨‍🏫 Treneri
        </h2>


        {trainers.length === 0 && (
          <p>
            Nema dodanih trenera.
          </p>
        )}


        {trainers.map((trainer)=>(

          <div key={trainer.uid}>
            {trainer.name} -
            {trainer.email}
          </div>

        ))}





        <h2>
          👤 Klijenti
        </h2>


        {clients.length === 0 && (
          <p>
            Nema dodanih klijenata.
          </p>
        )}


        {clients.map((client)=>(

          <div key={client.uid}>
            {client.name} -
            {client.email}
          </div>

        ))}


      </div>

    </ProtectedRoute>
  );
}