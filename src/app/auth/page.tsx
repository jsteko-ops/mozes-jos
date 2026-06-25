"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  async function login() {
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      alert("LOGIN USPJEŠAN 🎉");

      // HARD REDIRECT (100% radi)
      window.location.href = "/";
    } catch (err: any) {
      console.log(err.code);
      setError(err.code);
    }
  }

  return (
    <main style={{ padding: "30px", maxWidth: "400px" }}>
      <h1>Login 💪</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "10px",
          padding: "8px",
        }}
      />

      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "10px",
          padding: "8px",
        }}
      />

      <button
        type="button"
        onClick={login}
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Login
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </main>
  );
}