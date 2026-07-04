import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;

    console.log("PAYMENT SUCCESS:", userId);

    if (!userId) return NextResponse.json({ ok: true });

    await adminDb.collection("users").doc(userId).set(
      {
        isPremium: true,
        premiumSince: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return NextResponse.json({ received: true });
}