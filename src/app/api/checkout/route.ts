import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Premium Access",
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],

      // 🔥 FIX: hardcoded URLs (OBAVEZNO)
      success_url: "http://localhost:3000/dashboard?success=true",
      cancel_url: "http://localhost:3000/dashboard?canceled=true",

      metadata: {
        userId: userId || "unknown",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("STRIPE ERROR:", err.message || err);
    return NextResponse.json(
      { error: "stripe_failed", details: err.message },
      { status: 500 }
    );
  }
}