"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // 👤 CREATE FIRESTORE USER
  const createUserDoc = async (user: any, role = "trainer") => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        role,
        createdAt: Date.now(),
      });
    }
  };

  // 🔐 LOGIN
  const login = async () => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await createUserDoc(user);

    await redirectByRole(user.uid);
  };

  // 🆕 REGISTER
  const register = async () => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await createUserDoc(user, "trainer");

    await redirectByRole(user.uid);
  };

  // 🚀 ROLE REDIRECT
  const redirectByRole = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));

    const role = snap.data()?.role;

    if (role === "client") {
      router.push("/client");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 300 }}>
      <h1>{isRegister ? "Register" : "Login"}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={isRegister ? register : login}>
        {isRegister ? "Register" : "Login"}
      </button>

      <p
        style={{ marginTop: 10, cursor: "pointer", color: "blue" }}
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister
          ? "Already have account? Login"
          : "No account? Register"}
      </p>
    </div>
  );
}