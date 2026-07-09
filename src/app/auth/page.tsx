"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    console.log("LOGIN KLIK");

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      console.log(
        "LOGIN USPJEŠAN:",
        userCredential.user
      );

      router.push("/dashboard");

    } catch (error) {
      console.error(
        "LOGIN GREŠKA:",
        error
      );

      alert(
        "Greška kod prijave: " + error
      );
    }
  };


  const register = async () => {
    console.log("REGISTER KLIK");

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      await setDoc(
        doc(
          db,
          "users",
          userCredential.user.uid
        ),
        {
          uid: userCredential.user.uid,
          email: email,
          name: "",
          role: "trainer",
          premium: false,
          createdAt: serverTimestamp(),
        }
      );


      console.log(
        "REGISTRACIJA USPJEŠNA:",
        userCredential.user
      );


      router.push("/dashboard");

    } catch (error) {
      console.error(
        "REGISTER GREŠKA:",
        error
      );

      alert(
        "Greška kod registracije: " + error
      );
    }
  };


  return (
    <div style={{ padding: 20 }}>

      <h1>
        Možeš Još - Auth
      </h1>


      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={{
          display: "block",
          marginBottom: 10,
          padding: 8,
        }}
      />


      <input
        placeholder="Lozinka"
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          display: "block",
          marginBottom: 10,
          padding: 8,
        }}
      />


      <button
        onClick={login}
        style={{
          marginRight: 10,
        }}
      >
        Login
      </button>


      <button
        onClick={register}
      >
        Register
      </button>


    </div>
  );
}