import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";


export const runtime = "nodejs";

export const dynamic = "force-dynamic";


type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


type CreateClientBody = {

  name?: unknown;

  email?: unknown;

  password?: unknown;

  goal?: unknown;

  gender?: unknown;

};


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


function isClientGender(
  value: unknown
): value is ClientGender {

  return (
    value === "male" ||
    value === "female" ||
    value === "prefer_not_to_say"
  );

}


export async function POST(
  request: Request
) {

  let createdAuthUid:
    string | null = null;


  try {

    const token =
      getToken(request);


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


    const trainerReference =
      adminDb
        .collection("users")
        .doc(decodedToken.uid);


    const trainerSnapshot =
      await trainerReference.get();


    if (!trainerSnapshot.exists) {

      return NextResponse.json(
        {
          error:
            "Profil trenera nije pronađen.",
        },
        {
          status: 404,
        }
      );

    }


    const trainerData =
      trainerSnapshot.data();


    if (
      trainerData?.role !== "trainer"
    ) {

      return NextResponse.json(
        {
          error:
            "Samo trener može stvarati nove klijente.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof trainerData.gymId === "string"

        ? trainerData.gymId.trim()

        : "";


    if (!gymId) {

      return NextResponse.json(
        {
          error:
            "Trener nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );

    }


    const gymSnapshot =
      await adminDb
        .collection("gyms")
        .doc(gymId)
        .get();


    if (!gymSnapshot.exists) {

      return NextResponse.json(
        {
          error:
            "Teretana nije pronađena.",
        },
        {
          status: 404,
        }
      );

    }


    let body:
      CreateClientBody;


    try {

      body =
        await request.json() as
          CreateClientBody;

    } catch {

      return NextResponse.json(
        {
          error:
            "Poslani podaci nisu ispravni.",
        },
        {
          status: 400,
        }
      );

    }


    const name =
      typeof body.name === "string"

        ? body.name.trim()

        : "";


    const email =
      typeof body.email === "string"

        ? body.email
            .trim()
            .toLowerCase()

        : "";


    const password =
      typeof body.password === "string"

        ? body.password

        : "";


    const goal =
      typeof body.goal === "string"

        ? body.goal.trim()

        : "";


    const gender =
      isClientGender(
        body.gender
      )

        ? body.gender

        : null;


    if (!name) {

      return NextResponse.json(
        {
          error:
            "Upiši ime klijenta.",
        },
        {
          status: 400,
        }
      );

    }


    if (!email) {

      return NextResponse.json(
        {
          error:
            "Upiši e-mail klijenta.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      password.length < 6
    ) {

      return NextResponse.json(
        {
          error:
            "Privremena lozinka mora imati najmanje 6 znakova.",
        },
        {
          status: 400,
        }
      );

    }


    if (!gender) {

      return NextResponse.json(
        {
          error:
            "Odaberi spol klijenta.",
        },
        {
          status: 400,
        }
      );

    }


    try {

      await adminAuth.getUserByEmail(
        email
      );


      return NextResponse.json(
        {
          error:
            "Korisnik s tim e-mailom već postoji.",
        },
        {
          status: 409,
        }
      );

    } catch (error: unknown) {

      const errorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error

          ? String(
              error.code
            )

          : "";


      if (
        errorCode !==
        "auth/user-not-found"
      ) {

        throw error;

      }

    }


    const authUser =
      await adminAuth.createUser(
        {
          email,

          password,

          displayName:
            name,

          disabled:
            false,

          emailVerified:
            false,
        }
      );


    createdAuthUid =
      authUser.uid;


    const userReference =
      adminDb
        .collection("users")
        .doc(authUser.uid);


    const clientReference =
      adminDb
        .collection("clients")
        .doc(authUser.uid);


    const memberReference =
      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(authUser.uid);


    const batch =
      adminDb.batch();


    batch.set(
      userReference,
      {
        uid:
          authUser.uid,

        name,

        email,

        role:
          "client",

        gender,

        gymId,

        trainerId:
          decodedToken.uid,

        isPremium:
          false,

        subscriptionStatus:
          "inactive",

        createdAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      }
    );


    batch.set(
      clientReference,
      {
        uid:
          authUser.uid,

        name,

        email,

        goal,

        gender,

        gymId,

        trainerId:
          decodedToken.uid,

        createdAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      }
    );


    batch.set(
      memberReference,
      {
        uid:
          authUser.uid,

        role:
          "client",

        name,

        email,

        gender,

        gymId,

        trainerId:
          decodedToken.uid,

        addedBy:
          decodedToken.uid,

        createdAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      }
    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        client: {

          uid:
            authUser.uid,

          name,

          email,

          goal,

          gender,

          gymId,

          trainerId:
            decodedToken.uid,
        },
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );


  } catch (error) {

    if (createdAuthUid) {

      try {

        await adminAuth.deleteUser(
          createdAuthUid
        );

      } catch (
        cleanupError
      ) {

        console.error(
          "Nije moguće obrisati nedovršenog Auth korisnika:",
          cleanupError
        );

      }

    }


    console.error(
      "Greška kod stvaranja klijenta:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Klijenta trenutačno nije moguće stvoriti.",
      },
      {
        status: 500,
      }
    );

  }

}