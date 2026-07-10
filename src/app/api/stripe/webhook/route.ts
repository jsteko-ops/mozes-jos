import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);


export async function POST(req: Request) {

  const signature =
    req.headers.get("stripe-signature");


  if (!signature) {

    return NextResponse.json(
      {
        error: "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );

  }


  const body = await req.text();


  let event: Stripe.Event;


  try {

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );


  } catch (err: any) {


    console.error(
      "Webhook signature error:",
      err.message
    );


    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 400,
      }
    );

  }



  try {


    switch (event.type) {



      case "checkout.session.completed": {


        const session =
          event.data.object as Stripe.Checkout.Session;


        const userId =
          session.metadata?.userId;



        if (!userId) {

          console.log(
            "Nema userId u checkout session"
          );

          break;

        }



        await adminDb
          .collection("users")
          .doc(userId)
          .update({

            isPremium: true,

            subscriptionStatus: "active",

            stripeCustomerId:
              session.customer ?? null,

            stripeSubscriptionId:
              session.subscription ?? null,

            premiumActivatedAt:
              new Date(),

          });



        console.log(
          "Premium aktiviran:",
          userId
        );


        break;

      }





      case "customer.subscription.updated": {


        const subscription =
          event.data.object as Stripe.Subscription;



        const customerId =
          subscription.customer as string;



        const users =
          await adminDb
            .collection("users")
            .where(
              "stripeCustomerId",
              "==",
              customerId
            )
            .get();



        if (users.empty) {

          console.log(
            "Korisnik nije pronađen za customer:",
            customerId
          );

          break;

        }




        const userDoc =
          users.docs[0];



        await userDoc.ref.update({

          subscriptionStatus:
            subscription.status,

          isPremium:
            subscription.status === "active",

        });



        console.log(
          "Subscription updated:",
          userDoc.id,
          subscription.status
        );



        break;

      }






      case "customer.subscription.deleted": {


        const subscription =
          event.data.object as Stripe.Subscription;



        const customerId =
          subscription.customer as string;



        const users =
          await adminDb
            .collection("users")
            .where(
              "stripeCustomerId",
              "==",
              customerId
            )
            .get();




        if (users.empty) {

          console.log(
            "Korisnik nije pronađen za customer:",
            customerId
          );

          break;

        }



        await users.docs[0].ref.update({

          isPremium: false,

          subscriptionStatus:
            "canceled",

        });



        console.log(
          "Premium ugašen:",
          users.docs[0].id
        );



        break;

      }






      default:

        console.log(
          "Stripe event:",
          event.type
        );

    }




    return NextResponse.json({

      received: true,

    });



  } catch (err: any) {


    console.error(
      "Webhook processing error:",
      err
    );


    return NextResponse.json(

      {
        error:
          "Webhook processing failed",
      },

      {
        status: 500,
      }

    );

  }

}