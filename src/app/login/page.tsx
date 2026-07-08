"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Ako je korisnik već prijavljen, preusmjeri na dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const login = async () => {
    try {
      console.log("Email:", email);
      console.log("Password length:", password.length);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          alert("Neispravna e-mail adresa.");
          break;

        case "auth/user-not-found":
          alert("Korisnik ne postoji.");
          break;

        case "auth/wrong-password":
          alert("Pogrešna lozinka.");
          break;

        case "auth/invalid-credential":
          alert("Neispravan e-mail ili lozinka.");
          break;

        default:
          alert(error.message);
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h1>Prijava</h1>

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

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}