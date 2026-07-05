import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebaseAdmin";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        endpointSecret
      );
    } catch (err: any) {
      console.error("Webhook signature error:", err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, {
        status: 400,
      });
    }

    // 💳 1. SUBSCRIPTION CREATED / UPDATED
    if (
      event.type === "checkout.session.completed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId) {
        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          plan,
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        });
      }
    }

    // 🔁 2. SUBSCRIPTION UPDATED (renew/cancel/past_due)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;
      const status = subscription.status;

      const usersRef = adminDb.collection("users");
      const snapshot = await usersRef
        .where("stripeCustomerId", "==", customerId)
        .get();

      snapshot.forEach(async (doc) => {
        await doc.ref.update({
          subscriptionStatus: status,
          updatedAt: new Date(),
        });
      });
    }

    // ❌ 3. SUBSCRIPTION DELETED (cancel)
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;

      const usersRef = adminDb.collection("users");
      const snapshot = await usersRef
        .where("stripeCustomerId", "==", customerId)
        .get();

      snapshot.forEach(async (doc) => {
        await doc.ref.update({
          subscriptionStatus: "canceled",
          plan: "free",
          updatedAt: new Date(),
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}