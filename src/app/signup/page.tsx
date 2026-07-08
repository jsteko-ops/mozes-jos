"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<
    "client" | "trainer" | "gymOwner"
  >("client");

  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name.trim()) {
      alert("Unesi ime.");
      return;
    }

    if (!email.trim()) {
      alert("Unesi e-mail.");
      return;
    }

    if (password.length < 6) {
      alert("Lozinka mora imati najmanje 6 znakova.");
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: name.trim(),
        email: result.user.email,
        role: role,
        premium: false,
        createdAt: serverTimestamp(),
      });

      router.replace("/dashboard");
    } catch (error: any) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          alert("Ovaj e-mail je već registriran.");
          break;

        case "auth/invalid-email":
          alert("Neispravna e-mail adresa.");
          break;

        case "auth/weak-password":
          alert("Lozinka je preslaba.");
          break;

        default:
          alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "60px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h1>Registracija</h1>

      <input
        placeholder="Ime i prezime"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>
        Vrsta korisnika:
      </label>

      <select
        value={role}
        onChange={(e) =>
          setRole(
            e.target.value as
              | "client"
              | "trainer"
              | "gymOwner"
          )
        }
      >
        <option value="client">
          Klijent
        </option>

        <option value="trainer">
          Trener
        </option>

        <option value="gymOwner">
          Vlasnik teretane
        </option>
      </select>

      <button onClick={signup} disabled={loading}>
        {loading
          ? "Registracija..."
          : "Registriraj se"}
      </button>
    </main>
  );
}