import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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





    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";





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
        error.message ||
        "Portal failed"
      },

      {
        status:500
      }

    );


  }

}