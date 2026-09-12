import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2023-10-16",
  }
);

function getToken(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorization
    .slice(7)
    .trim();
}

export async function POST(req: Request) {

  try {

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";


    const token =
  getToken(req);

if (!token) {
  return NextResponse.json(
    {
      error:
        "Moraš biti prijavljen.",
    },
    {
      status: 401,
    }
  );
}

let decodedToken;

try {
  decodedToken =
    await adminAuth.verifyIdToken(
      token,
      true
    );
} catch {
  return NextResponse.json(
    {
      error:
        "Prijava korisnika nije valjana.",
    },
    {
      status: 401,
    }
  );
}

const userId =
  decodedToken.uid;

const email =
  decodedToken.email || undefined;



    const priceId =
      process.env.STRIPE_PRICE_PRO;



    if (!priceId) {

      return NextResponse.json(
        {
          error:
          "STRIPE_PRICE_PRO nije postavljen",
        },
        {
          status:500,
        }
      );

    }



    const session =
      await stripe.checkout.sessions.create({

        mode:"subscription",


        payment_method_types:[
          "card",
        ],


        line_items:[

          {
            price: priceId,
            quantity:1,
          }

        ],



        customer_email:
          email || undefined,



        metadata:{

          userId:userId,

        },



        subscription_data:{

          metadata:{
            userId:userId,
          },

        },



        success_url:
        `${origin}/dashboard/trainer/naplata?success=1`,



        cancel_url:
        `${origin}/dashboard/trainer/naplata?canceled=1`,


      });



    return NextResponse.json({

      url:session.url,

    });



  } catch(error:any){


    console.error(
      "CHECKOUT ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
        error.message ||
        "Checkout failed",
      },

      {
        status:500,
      }

    );


  }

}