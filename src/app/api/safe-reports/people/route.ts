import {
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";


export const runtime = "nodejs";

export const dynamic = "force-dynamic";


function getToken(
  request: Request
) {

  const authorization =
    request.headers.get(
      "authorization"
    );


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


function getPersonName(
  data: FirebaseFirestore.DocumentData
) {

  if (
    typeof data.name === "string" &&
    data.name.trim()
  ) {

    return data.name.trim();

  }


  const fullName =
    [
      data.firstName,
      data.lastName,
    ]
      .filter(
        (value) =>
          typeof value === "string" &&
          value.trim()
      )
      .join(" ")
      .trim();


  if (fullName) {

    return fullName;

  }


  return "Trener";

}


export async function GET(
  request: Request
) {

  try {

    const token =
      getToken(request);


    if (!token) {

      return NextResponse.json(
        {
          error:
            "Nedostaje prijava korisnika.",
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


    const clientSnapshot =
      await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();


    if (!clientSnapshot.exists) {

      return NextResponse.json(
        {
          error:
            "Korisnički profil nije pronađen.",
        },
        {
          status: 404,
        }
      );

    }


    const clientData =
      clientSnapshot.data();


    if (
      clientData?.role !== "client"
    ) {

      return NextResponse.json(
        {
          error:
            "Samo klijent može učitati ovaj popis.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof clientData.gymId === "string"

        ? clientData.gymId.trim()

        : "";


    if (!gymId) {

      return NextResponse.json(
        {
          error:
            "Klijent nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );

    }


    const trainersSnapshot =
      await adminDb
        .collection("users")
        .where(
          "gymId",
          "==",
          gymId
        )
        .where(
          "role",
          "==",
          "trainer"
        )
        .limit(200)
        .get();


    const trainers =
      trainersSnapshot.docs

        .map(
          (document) => {

            const data =
              document.data();


            return {

              uid:
                document.id,

              name:
                getPersonName(data),

            };

          }
        )

        .sort(
          (first, second) =>
            first.name.localeCompare(
              second.name,
              "hr"
            )
        );


    return NextResponse.json(
      {
        trainers,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );


  } catch (error) {

    console.error(
      "Greška kod učitavanja osoba za sigurnu prijavu:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Popis trenera trenutačno nije moguće učitati.",
      },
      {
        status: 500,
      }
    );

  }

}