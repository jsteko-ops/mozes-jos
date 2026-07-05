import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, plan } = body;

    console.log("CHECKOUT REQUEST:", { userId, plan });

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "Missing userId or plan" },
        { status: 400 }
      );
    }

    const priceMap: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO!,
      business: process.env.STRIPE_PRICE_BUSINESS!,
    };

    const price = priceMap[plan];

    if (!price) {
      return NextResponse.json(
        { error: "Invalid plan price" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?canceled=1`,
      metadata: {
        userId,
        plan,
      },
    });

    console.log("SESSION CREATED:", session.id);

    return NextResponse.json({
      url: session.url,
    });
  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}