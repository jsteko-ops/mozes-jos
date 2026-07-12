"use client";

import { addGymMember } from "@/lib/addGymMember";

export default function TestMembersPage() {


  const addTrainerTest = async () => {

    await addGymMember({
      gymId: "gym_test",
      email: "trainer@test.com",
      role: "trainer",
      addedBy: "test",
    });

    alert("Trainer test added");
  };


  const addClientTest = async () => {

    await addGymMember({
      gymId: "gym_test",
      email: "client@test.com",
      role: "client",
      addedBy: "test",
    });

    alert("Client test added");
  };


  return (
    <div style={{ padding: 20 }}>

      <h1>
        Test Gym Members
      </h1>


      <button
        onClick={addTrainerTest}
      >
        Add Trainer Test
      </button>


      <br />
      <br />


      <button
        onClick={addClientTest}
      >
        Add Client Test
      </button>


    </div>
  );
}