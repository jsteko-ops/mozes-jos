"use client";

import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

export async function handleUpgrade(
  plan: "pro" | "business"
) {
  try {
    const auth = getAuth(app);

    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        plan,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    console.error("Stripe URL nije vraćen.");
  } catch (err) {
    console.error(err);
  }
}