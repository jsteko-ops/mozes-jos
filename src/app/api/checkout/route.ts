import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    const userId = session.metadata?.userId;

    if (!userId) {
      return NextResponse.json({ error: "no userId" }, { status: 400 });
    }

    await db.collection("users").doc(userId).set(
      {
        isPremium: true,
        stripeCustomerId: session.customer || null,
      },
      { merge: true }
    );

    console.log("USER UPGRADED:", userId);
  }

  return NextResponse.json({ received: true });
}