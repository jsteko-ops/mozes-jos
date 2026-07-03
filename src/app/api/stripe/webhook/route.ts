import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { setUserPremium } from "@/lib/repositories/subscription.repo";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();

    const sig = headersList.get("stripe-signature") as string;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    // 🔥 verifikacija webhooka
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // 💳 kad je payment uspješan
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const userId = session.metadata?.userId;

      if (userId) {
        await setUserPremium(userId, session.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}