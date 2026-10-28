import { auth } from "@/lib/firebase";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

type Role =
  | "client"
  | "trainer"
  | "gym_owner";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
  gymName?: string;
}

export async function registerUser({
  name,
  email,
  password,
  role,
  gymName,
}: RegisterUserData) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedGymName = gymName?.trim() ?? "";

  if (!normalizedName) {
    throw new Error("Unesi ime i prezime.");
  }

  if (!normalizedEmail) {
    throw new Error("Unesi e-mail adresu.");
  }

  if (password.length < 6) {
    throw new Error("Lozinka mora imati najmanje 6 znakova.");
  }

  if (role === "gym_owner" && !normalizedGymName) {
    throw new Error("Unesi naziv teretane.");
  }

  // Stvaranje Firebase Auth racuna.
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  // Token novog korisnika.
  const token = await credential.user.getIdToken();

  // Profil i teretanu stvara server.
  const response = await fetch("/api/register", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    cache: "no-store",

    body: JSON.stringify({
      name: normalizedName,
      role,
      gymName:
        role === "gym_owner"
          ? normalizedGymName
          : "",
    }),
  });

  const result: { error?: string } | null =
    await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error ||
        "Racun za prijavu je stvoren, ali profil nije dovrsen. Obrati se podrsci."
    );
  }

  return credential.user;
}