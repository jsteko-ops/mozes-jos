"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import { addGymMember } from "@/lib/addGymMember";

export default function OwnerDashboard() {
  const [gymId, setGymId] = useState<string | null>(null);

  const [trainerEmail, setTrainerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [loading, setLoading] = useState(false);

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
        }
      }
    );

    return () => unsub();
  }, []);


  const addTrainer = async () => {
    if (!gymId) {
      alert("Nema gym ID.");
      return;
    }

    try {
      setLoading(true);

      await addGymMember({
        gymId,
        email: trainerEmail,
        role: "trainer",
        addedBy: "owner",
      });

      alert("Trener dodan u teretanu.");
      setTrainerEmail("");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  const addClient = async () => {
    if (!gymId) {
      alert("Nema gym ID.");
      return;
    }

    try {
      setLoading(true);

      await addGymMember({
        gymId,
        email: clientEmail,
        role: "client",
        addedBy: "owner",
      });

      alert("Klijent dodan u teretanu.");
      setClientEmail("");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProtectedRoute allowedRoles={["gym_owner"]}>
      <div style={{ padding: 20 }}>

        <h1>
          🏢 Gym Owner Panel
        </h1>


        <div style={{ marginBottom: 20 }}>
          <h3>Gym ID:</h3>
          <p>
            {gymId || "Nema dodijeljene teretane"}
          </p>
        </div>


        <div style={{ marginBottom: 30 }}>

          <h3>
            Dodaj trenera
          </h3>

          <input
            placeholder="Email trenera"
            value={trainerEmail}
            onChange={(e) =>
              setTrainerEmail(e.target.value)
            }
          />

          <button
            onClick={addTrainer}
            disabled={loading}
          >
            Dodaj trenera
          </button>

        </div>



        <div style={{ marginBottom: 30 }}>

          <h3>
            Dodaj klijenta
          </h3>

          <input
            placeholder="Email klijenta"
            value={clientEmail}
            onChange={(e) =>
              setClientEmail(e.target.value)
            }
          />

          <button
            onClick={addClient}
            disabled={loading}
          >
            Dodaj klijenta
          </button>

        </div>



        <div>

          <h3>
            Gym Members
          </h3>

          <p>
            Lista članova dolazi u sljedećem koraku.
          </p>

        </div>


      </div>
    </ProtectedRoute>
  );
}