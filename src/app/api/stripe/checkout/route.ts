import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");

const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  metadata: {
    userId: "test1234" // 🔥 kasnije ćemo uzeti iz cookie-a
  },
  line_items: [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Premium Access"
        },
        unit_amount: 1000
      },
      quantity: 1
    }
  ],
  success_url: `${origin}/dashboard?success=true`,
  cancel_url: `${origin}/dashboard?canceled=true`
});

    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    return NextResponse.json(
      { error: "Stripe checkout error" },
      { status: 500 }
    );
  }
}