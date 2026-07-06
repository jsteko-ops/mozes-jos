"use client";

import { addGymMember } from "@/lib/addGymMember";

export default function TestMembersPage() {
  const addTrainer = async () => {
    await addGymMember({
      gymId: "gym_1",
      userId: "trainer_123",
      role: "trainer",
      addedBy: "owner_123",
    });
  };

  const addClient = async () => {
    await addGymMember({
      gymId: "gym_1",
      userId: "client_123",
      role: "client",
      addedBy: "trainer_123",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gym Members Test</h1>

      <button onClick={addTrainer}>
        Add Trainer
      </button>

      <button onClick={addClient} style={{ marginLeft: 10 }}>
        Add Client
      </button>
    </div>
  );
}