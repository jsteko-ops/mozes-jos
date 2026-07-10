import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";


export async function POST(req: Request) {

  try {

    const body = await req.json();

    const userId = body.userId;


    if(!userId){

      return NextResponse.json(
        {
          error:"Nedostaje userId"
        },
        {
          status:400
        }
      );

    }



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