"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ClientForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");

  const [loading, setLoading] = useState(false);

  const addClient = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const ref = collection(db, "users", user.uid, "clients");

      await addDoc(ref, {
        name,
        email,
        goal,
        trainerId: user.uid,
        createdAt: serverTimestamp(),
      });

      setName("");
      setEmail("");
      setGoal("");

      onCreated();
    } catch (error) {
      console.error("Greška kod dodavanja klijenta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 border rounded-xl space-y-4">

      <Input
        label="Ime"
        placeholder="Ime klijenta"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Email"
        placeholder="Email klijenta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Cilj"
        placeholder="npr. mršavljenje, masa, kondicija"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <Button
        onClick={addClient}
        loading={loading}
        fullWidth
      >
        Dodaj klijenta
      </Button>

    </div>
  );
}