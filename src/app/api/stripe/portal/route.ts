import { trustedStripeOrigin } from "@/lib/server/trustedStripeOrigin";
import { NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

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

  try {

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



    const userSnap =
      await adminDb
      .collection("users")
      .doc(userId)
      .get();



    if(!userSnap.exists){

      return NextResponse.json(
        {
          error:"Korisnik ne postoji"
        },
        {
          status:404
        }
      );

    }



    const userData =
      userSnap.data();



    const customerId =
      userData?.stripeCustomerId;



    if(!customerId){

      return NextResponse.json(
        {
          error:"Stripe customer nije pronađen"
        },
        {
          status:400
        }
      );

    }





    const origin = trustedStripeOrigin();





    const { stripe } = await import("@/lib/stripe");

    const session =
      await stripe.billingPortal.sessions.create({

        customer: customerId,


        return_url:
          `${origin}/dashboard/trainer/naplata`

      });






    return NextResponse.json({

      url:session.url

    });



  } catch(error:any){


    console.error(
      "PORTAL ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
        "Portal failed"
      },

      {
        status:500
      }

    );


  }

}