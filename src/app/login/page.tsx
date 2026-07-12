"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import { redirectByRole } from "@/lib/auth/redirectByRole";

export default function LoginPage() {
  const {
    user,
    userProfile,
    loading,
  } = useAuth();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);


  useEffect(() => {

    if (
      !loading &&
      user &&
      userProfile
    ) {
      redirectByRole(
        userProfile,
        router
      );
    }

  }, [
    user,
    userProfile,
    loading,
    router,
  ]);



  const login = async () => {

    try {

      setLoginLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


    } catch (error: any) {

      console.error(
        "Login error:",
        error
      );


      switch (error.code) {

        case "auth/invalid-email":
          alert(
            "Neispravna e-mail adresa."
          );
          break;


        case "auth/user-not-found":
          alert(
            "Korisnik ne postoji."
          );
          break;


        case "auth/wrong-password":
          alert(
            "Pogrešna lozinka."
          );
          break;


        case "auth/invalid-credential":
          alert(
            "Neispravan e-mail ili lozinka."
          );
          break;


        default:
          alert(
            error.message
          );
      }


    } finally {

      setLoginLoading(false);

    }

  };



  if (loading) {

    return (
      <p>
        Učitavanje...
      </p>
    );

  }



  return (

    <form
      onSubmit={(e) => {
        e.preventDefault();
        login();
      }}

      style={{
        maxWidth: 400,
        margin: "80px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >


      <h1>
        Prijava
      </h1>



      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />



      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />



      <button
        type="submit"
        disabled={loginLoading}
      >

        {loginLoading
          ? "Prijava..."
          : "Login"}

      </button>


    </form>

  );
}