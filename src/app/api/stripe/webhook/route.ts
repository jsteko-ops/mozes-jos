import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";



function stripeId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  }
  return null;
}

function hasAccess(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

const received = () => NextResponse.json({ received: true });

export async function POST(request: Request) {
  if (
    (process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV !== "production") ||
    !process.env.STRIPE_SECRET_KEY
  ) {
    return NextResponse.json(
      { error: "Stripe naplata nije dostupna u beta verziji." },
      { status: 503 }
    );
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook configuration missing");
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = stripeId(session.subscription);
      const checkoutCustomerId = stripeId(session.customer);

      if (
        session.mode !== "subscription" ||
        !userId ||
        !subscriptionId ||
        !checkoutCustomerId ||
        !["paid", "no_payment_required"].includes(session.payment_status)
      ) return received();

      // Current state from Stripe, not the possibly delayed event snapshot.
      const current = await stripe.subscriptions.retrieve(subscriptionId);
      if (
        current.id !== subscriptionId ||
        current.metadata?.userId !== userId ||
        stripeId(current.customer) !== checkoutCustomerId ||
        !hasAccess(current.status)
      ) return received();

      const userRef = adminDb.collection("users").doc(userId);
      await adminDb.runTransaction(async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists) return;

        const user = userSnap.data() || {};
        const storedId = stripeId(user.stripeSubscriptionId);
        const storedCreated = user.stripeSubscriptionCreated;

        // Protect newer subscriptions against late Checkout events. Legacy
        // records lacking the creation timestamp require a manual review
        // when switching to a different subscription ID.
        if (storedId && storedId !== current.id) {
          if (
            typeof storedCreated !== "number" ||
            !Number.isFinite(storedCreated) ||
            current.created <= storedCreated
          ) return;
        }

        const updates: Record<string, unknown> = {
          isPremium: true,
          subscriptionStatus: current.status,
          stripeCustomerId: checkoutCustomerId,
          stripeSubscriptionId: current.id,
          stripeSubscriptionCreated: current.created,
        };

        // Do not overwrite the original activation time on retries.
        if (!user.premiumActivatedAt) updates.premiumActivatedAt = new Date();
        transaction.update(userRef, updates);
      });
      return received();
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const changed = event.data.object as Stripe.Subscription;
      const eventCustomerId = stripeId(changed.customer);
      if (!eventCustomerId || !changed.id) return received();

      const current = await stripe.subscriptions.retrieve(changed.id);
      if (
        current.id !== changed.id ||
        stripeId(current.customer) !== eventCustomerId
      ) return received();

      const candidates = await adminDb.collection("users")
        .where("stripeCustomerId", "==", eventCustomerId)
        .get();
      const matches = candidates.docs.filter(
        (candidate) => stripeId(candidate.data().stripeSubscriptionId) === current.id
      );
      if (matches.length !== 1) return received();

      const userRef = matches[0].ref;
      await adminDb.runTransaction(async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists) return;
        const user = userSnap.data() || {};

        if (
          stripeId(user.stripeSubscriptionId) !== current.id ||
          stripeId(user.stripeCustomerId) !== eventCustomerId ||
          (current.metadata?.userId && current.metadata.userId !== userRef.id)
        ) return;

        transaction.update(userRef, {
          subscriptionStatus: current.status,
          isPremium: hasAccess(current.status),
        });
      });
      return received();
    }

    return received();
  } catch (error) {
    // Return 500 so Stripe can retry a transient processing failure.
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
