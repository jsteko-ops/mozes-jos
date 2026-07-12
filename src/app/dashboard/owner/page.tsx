"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import RoleGuard from "@/components/auth/RoleGuard";
import { addGymMember } from "@/lib/addGymMember";

export default function OwnerDashboard() {
  const [gymId, setGymId] = useState<string | null>(null);

  const [trainerEmail, setTrainerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");

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
      alert("Owner nema dodijeljen gymId");
      return;
    }

    await addGymMember({
      gymId,
      userId: trainerEmail,
      role: "trainer",
      addedBy: "owner",
    });

    alert("Trainer added");
  };


  const addClient = async () => {
    if (!gymId) {
      alert("Owner nema dodijeljen gymId");
      return;
    }

    await addGymMember({
      gymId,
      userId: clientEmail,
      role: "client",
      addedBy: "owner",
    });

    alert("Client added");
  };


  return (
    <RoleGuard allowedRoles={["gym_owner"]}>
      <div style={{ padding: 20 }}>

        <h1 className="text-2xl font-bold">
          🏢 Gym Owner Panel
        </h1>


        <div style={{ marginTop: 20 }}>
          <h3>
            Gym ID:
          </h3>

          <p>
            {gymId || "No gym assigned"}
          </p>
        </div>


        <div style={{ marginTop: 30 }}>
          <h3>
            Add Trainer
          </h3>

          <input
            placeholder="Trainer UID or Email"
            value={trainerEmail}
            onChange={(e) =>
              setTrainerEmail(e.target.value)
            }
          />

          <button
            onClick={addTrainer}
          >
            Add Trainer
          </button>
        </div>


        <div style={{ marginTop: 30 }}>
          <h3>
            Add Client
          </h3>

          <input
            placeholder="Client UID or Email"
            value={clientEmail}
            onChange={(e) =>
              setClientEmail(e.target.value)
            }
          />

          <button
            onClick={addClient}
          >
            Add Client
          </button>
        </div>


        <div style={{ marginTop: 30 }}>
          <h3>
            Gym Members
          </h3>

          <p>
            Lista članova dolazi u sljedećem koraku.
          </p>
        </div>

      </div>
    </RoleGuard>
  );
}