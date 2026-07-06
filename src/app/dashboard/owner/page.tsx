"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { addGymMember } from "@/lib/addGymMember";

export default function OwnerDashboard() {
  const [gymId, setGymId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  const [trainerEmail, setTrainerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // 🔥 LOAD OWNER GYM
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      const data = snap.data();
      if (data?.gymId) {
        setGymId(data.gymId);
      }
    });

    return () => unsub();
  }, []);

  // 🔥 MOCK LOAD MEMBERS (kasnije real query)
  const loadMembers = async () => {
    console.log("Load members for gym:", gymId);
  };

  // 🔥 ADD TRAINER
  const addTrainer = async () => {
    if (!gymId) return;

    await addGymMember({
      gymId,
      userId: trainerEmail, // (MVP koristi email kao ID placeholder)
      role: "trainer",
      addedBy: "owner",
    });

    alert("Trainer added");
  };

  // 🔥 ADD CLIENT
  const addClient = async () => {
    if (!gymId) return;

    await addGymMember({
      gymId,
      userId: clientEmail,
      role: "client",
      addedBy: "owner",
    });

    alert("Client added");
  };

  return (
    <ProtectedRoute allowedRoles={["gym_owner"]}>
      <div style={{ padding: 20 }}>
        <h1>🏢 Gym Owner Panel</h1>

        {/* GYM INFO */}
        <div style={{ marginBottom: 20 }}>
          <h3>Gym ID:</h3>
          <p>{gymId || "No gym assigned"}</p>
        </div>

        {/* ADD TRAINER */}
        <div style={{ marginBottom: 20 }}>
          <h3>Add Trainer</h3>

          <input
            placeholder="Trainer UID or Email"
            value={trainerEmail}
            onChange={(e) => setTrainerEmail(e.target.value)}
          />

          <button onClick={addTrainer}>
            Add Trainer
          </button>
        </div>

        {/* ADD CLIENT */}
        <div style={{ marginBottom: 20 }}>
          <h3>Add Client</h3>

          <input
            placeholder="Client UID or Email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />

          <button onClick={addClient}>
            Add Client
          </button>
        </div>

        {/* MEMBERS */}
        <div>
          <h3>Gym Members</h3>
          <p>(MVP: kasnije ćemo real Firestore query)</p>

          <button onClick={loadMembers}>
            Refresh
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}