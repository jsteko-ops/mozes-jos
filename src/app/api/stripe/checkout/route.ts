import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2023-10-16",
  }
);


export async function POST(req: Request) {

  try {

    const origin =
      req.headers.get("origin") ||
      "http://localhost:3000";


    const body = await req.json();


    const userId = body.userId;
    const email = body.email;


    if (!userId) {

      return NextResponse.json(
        {
          error: "Nedostaje userId",
        },
        {
          status: 400,
        }
      );

    }



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