"use client";

import { loadStripe } from "@stripe/stripe-js";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase"; // mora postojati firebase init

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export async function handleUpgrade(plan: "pro" | "business") {
  try {
    console.log("1. handleUpgrade:", plan);

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

    console.log("2. Status:", res.status);

    const data = await res.json();
    console.log("3. Response:", data);

    if (!res.ok) {
      console.error("Checkout failed:", data);
      return;
    }

    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe not loaded");
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    console.log("4. Redirect result:", result);
  } catch (err) {
    console.error("handleUpgrade error:", err);
  }
}