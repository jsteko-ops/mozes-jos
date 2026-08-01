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


type MemberRole =
  | "trainer"
  | "client";


type MemberBody = {

  email?: unknown;

  role?: unknown;

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


export async function POST(
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


    const ownerReference =
      adminDb
        .collection("users")
        .doc(decodedToken.uid);


    const ownerSnapshot =
      await ownerReference.get();


    if (!ownerSnapshot.exists) {

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


    const ownerData =
      ownerSnapshot.data();


    if (
      ownerData?.role !== "gym_owner"
    ) {

      return NextResponse.json(
        {
          error:
            "Samo vlasnik teretane može dodavati članove.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof ownerData.gymId === "string"

        ? ownerData.gymId.trim()

        : "";


    if (!gymId) {

      return NextResponse.json(
        {
          error:
            "Vlasnik nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );

    }


    const gymReference =
      adminDb
        .collection("gyms")
        .doc(gymId);


    const gymSnapshot =
      await gymReference.get();


    if (
      !gymSnapshot.exists ||
      gymSnapshot.data()?.ownerId !==
        decodedToken.uid
    ) {

      return NextResponse.json(
        {
          error:
            "Nemaš pravo upravljati ovom teretanom.",
        },
        {
          status: 403,
        }
      );

    }


    let body:
      MemberBody;


    try {

      body =
        await request.json() as
          MemberBody;

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


    const email =
      typeof body.email === "string"

        ? body.email
            .trim()
            .toLowerCase()

        : "";


    const role =
      body.role === "trainer" ||
      body.role === "client"

        ? body.role

        : null;


    if (!email) {

      return NextResponse.json(
        {
          error:
            "Upiši e-mail korisnika.",
        },
        {
          status: 400,
        }
      );

    }


    if (!role) {

      return NextResponse.json(
        {
          error:
            "Uloga člana nije ispravna.",
        },
        {
          status: 400,
        }
      );

    }


    let authUser;


    try {

      authUser =
        await adminAuth.getUserByEmail(
          email
        );

    } catch {

      return NextResponse.json(
        {
          error:
            "Korisnik s tim e-mailom nije pronađen.",
        },
        {
          status: 404,
        }
      );

    }


    const memberUserReference =
      adminDb
        .collection("users")
        .doc(authUser.uid);


    const memberUserSnapshot =
      await memberUserReference.get();


    if (!memberUserSnapshot.exists) {

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


    const memberUserData =
      memberUserSnapshot.data();


    if (
      memberUserData?.role !== role
    ) {

      return NextResponse.json(
        {
          error:
            role === "trainer"

              ? "Odabrani korisnik nije trener."

              : "Odabrani korisnik nije klijent.",
        },
        {
          status: 400,
        }
      );

    }


    const currentGymId =
      typeof memberUserData.gymId ===
        "string"

        ? memberUserData.gymId.trim()

        : "";


    if (
      currentGymId &&
      currentGymId !== gymId
    ) {

      return NextResponse.json(
        {
          error:
            "Korisnik je već povezan s drugom teretanom.",
        },
        {
          status: 409,
        }
      );

    }


    const memberReference =
      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(authUser.uid);


    const memberSnapshot =
      await memberReference.get();


    const memberName =
      typeof memberUserData.name ===
        "string" &&
      memberUserData.name.trim()

        ? memberUserData.name.trim()

        : authUser.displayName ||
          authUser.email ||
          "Korisnik";


    const memberData: Record<
      string,
      unknown
    > = {

      uid:
        authUser.uid,

      role,

      name:
        memberName,

      email:
        authUser.email || email,

      gymId,

      addedBy:
        decodedToken.uid,

      updatedAt:
        FieldValue.serverTimestamp(),

    };


    if (!memberSnapshot.exists) {

      memberData.createdAt =
        FieldValue.serverTimestamp();

    }


    const batch =
      adminDb.batch();


    batch.set(
      memberReference,
      memberData,
      {
        merge: true,
      }
    );


    batch.set(
      memberUserReference,
      {
        gymId,

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        member: {

          uid:
            authUser.uid,

          name:
            memberName,

          email:
            authUser.email || email,

          role,

          gymId,

        },
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
      "Greška kod dodavanja člana teretane:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Člana trenutačno nije moguće dodati.",
      },
      {
        status: 500,
      }
    );

  }

}