import Stripe from "stripe";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔐 ENV
const secretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!secretKey || !priceId || !appUrl) {
  throw new Error("Missing Stripe env variables");
}

// 💳 Stripe
const stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,

      metadata: {
        userId: body.userId,
      },
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Stripe error",
      },
      {
        status: 500,
      }
    );
  }
}