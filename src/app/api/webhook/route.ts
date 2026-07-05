import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  console.log("========== WEBHOOK HIT ==========");

  const body = await req.text();

  const signature = (await headers()).get("stripe-signature");

  console.log("Stripe signature:", signature ? "FOUND" : "MISSING");
  console.log("Body length:", body.length);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook verified");
    console.log("Event:", event.type);
  } catch (err: any) {
    console.error("Webhook verification failed:");
    console.error(err.message);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 400,
      }
    );
  }

  if (event.type === "checkout.session.completed") {
    console.log("Checkout completed");

    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;

    console.log("User ID:", userId);

    if (!userId) {
      console.log("No userId found in metadata");

      return NextResponse.json(
        {
          error: "No userId",
        },
        {
          status: 400,
        }
      );
    }

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          email: session.customer_details?.email ?? "",
          isPremium: true,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : null,
        },
        {
          merge: true,
        }
      );

      console.log("USER UPGRADED:", userId);
    } catch (err) {
      console.error("Firestore write failed:");
      console.error(err);

      return NextResponse.json(
        {
          error: "Firestore failed",
        },
        {
          status: 500,
        }
      );
    }
  }

  console.log("Webhook finished");

  return NextResponse.json({
    received: true,
  });
}