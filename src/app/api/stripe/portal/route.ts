import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";


const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion:"2023-10-16",
  }
);



export async function POST(req:Request){

  try{


    const { userId } =
    await req.json();



    if(!userId){

      return NextResponse.json(
        {
          error:"Missing userId"
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
          error:"User not found"
        },
        {
          status:404
        }
      );

    }



    const userData =
    userSnap.data();



    if(!userData?.stripeCustomerId){

      return NextResponse.json(
        {
          error:"No Stripe customer"
        },
        {
          status:400
        }
      );

    }



    const session =
    await stripe.billingPortal.sessions.create({

      customer:
      userData.stripeCustomerId,


      return_url:
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/trainer/naplata`

    });



    return NextResponse.json({

      url:session.url

    });



  }
  catch(error:any){


    console.error(
      "PORTAL ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );


  }

}