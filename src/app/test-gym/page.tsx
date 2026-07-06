"use client";

import { setupGym } from "@/lib/setupGym";

export default function TestGymPage() {
  const handleCreate = async () => {
    await setupGym({
      gymId: "gym_1",
      name: "Moja Dvorana",
      ownerId: "test-user-123",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Gym Test</h1>

      <button onClick={handleCreate}>
        Create Gym
      </button>
    </div>
  );
}