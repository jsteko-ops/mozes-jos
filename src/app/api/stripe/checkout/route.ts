import { NextResponse } from "next/server";
import Stripe from "stripe";


const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2023-10-16",
  }
);



export async function POST(req: Request) {

  try {


    const {
      userId,
      email,
      plan
    } = await req.json();



    if(!userId || !email){

      return NextResponse.json(
        {
          error:"Missing userId or email"
        },
        {
          status:400
        }
      );

    }



    const price =
      plan === "business"
      ? process.env.STRIPE_PRICE_BUSINESS
      : process.env.STRIPE_PRICE_PRO;



    const session =
      await stripe.checkout.sessions.create({

        mode:"subscription",


        payment_method_types:[
          "card"
        ],


        customer_email:
          email,



        line_items:[

          {
            price:price!,
            quantity:1
          }

        ],



        metadata:{

          userId,

          plan

        },



        success_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/trainer/naplata?success=1`,



        cancel_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/trainer/naplata?canceled=1`,


      });



    return NextResponse.json({

      url:session.url

    });



  } catch(error:any){


    console.error(
      "CHECKOUT ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:"Checkout failed"
      },

      {
        status:500
      }

    );


  }

}