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


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


type CreateStaffBody = {
  name?: unknown;

  email?: unknown;

  phone?: unknown;
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
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }


  return authorization
    .slice(7)
    .trim();
}


function normalizeString(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function normalizeEmail(
  value: unknown
) {
  return normalizeString(
    value
  ).toLowerCase();
}


async function emailAlreadyExists(
  email: string
) {
  try {
    await adminAuth
      .getUserByEmail(
        email
      );

    return true;
  } catch (
    error: unknown
  ) {
    const errorCode =
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error
        ? String(
            error.code
          )
        : "";


    if (
      errorCode ===
      "auth/user-not-found"
    ) {
      return false;
    }


    throw error;
  }
}


export async function POST(
  request: Request
) {
  let createdAuthUid:
    string | null = null;


  try {
    /*
     * 1. Prijava vlasnika
     */

    const token =
      getToken(
        request
      );


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
        await adminAuth
          .verifyIdToken(
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


    /*
     * 2. Provjera da je korisnik
     * stvarno gym_owner.
     */

    const ownerReference =
      adminDb
        .collection("users")
        .doc(
          decodedToken.uid
        );


    const ownerSnapshot =
      await ownerReference
        .get();


    if (
      !ownerSnapshot.exists
    ) {
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
      ownerData?.role !==
      "gym_owner"
    ) {
      return NextResponse.json(
        {
          error:
            "Samo vlasnik teretane može stvarati račune djelatnika.",
        },
        {
          status: 403,
        }
      );
    }


    const gymId =
      typeof ownerData?.gymId ===
        "string"
        ? ownerData.gymId
            .trim()
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


    /*
     * 3. Provjera vlasništva
     * nad tom teretanom.
     *
     * gymId nikada ne uzimamo
     * iz request bodyja.
     */

    const gymReference =
      adminDb
        .collection("gyms")
        .doc(gymId);


    const gymSnapshot =
      await gymReference
        .get();


    if (
      !gymSnapshot.exists
    ) {
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


    const gymData =
      gymSnapshot.data();


    if (
      gymData?.ownerId !==
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


    /*
     * 4. Body
     */

    let body:
      CreateStaffBody;


    try {
      body =
        await request
          .json() as
          CreateStaffBody;
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
      normalizeString(
        body.name
      );


    const email =
      normalizeEmail(
        body.email
      );


    const phone =
      normalizeString(
        body.phone
      );


    if (!name) {
      return NextResponse.json(
        {
          error:
            "Upiši ime i prezime djelatnika.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !email ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          error:
            "Upiši ispravnu e-mail adresu djelatnika.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * 5. Ne preuzimamo postojeće
     * korisničke račune.
     *
     * Ako email već postoji,
     * vlasnik ne može samo promijeniti
     * njegovu ulogu u gym_staff.
     */

    const existingUser =
      await emailAlreadyExists(
        email
      );


    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Korisnik s tim e-mailom već postoji. Postojeći račun ne može se automatski pretvoriti u račun recepcije.",
        },
        {
          status: 409,
        }
      );
    }


    /*
     * 6. Firebase Auth račun.
     *
     * Namjerno NE postavljamo
     * lozinku.
     *
     * Nakon stvaranja računa
     * djelatniku ćemo poslati
     * Firebase email za postavljanje
     * vlastite lozinke.
     */

    const authUser =
      await adminAuth
        .createUser(
          {
            email,

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


    /*
     * 7. Firestore profil +
     * članstvo u teretani.
     */

    const staffUserReference =
      adminDb
        .collection("users")
        .doc(
          authUser.uid
        );


    const staffMemberReference =
      adminDb
        .collection(
          "gymMembers"
        )
        .doc(gymId)
        .collection(
          "members"
        )
        .doc(
          authUser.uid
        );


    const batch =
      adminDb.batch();


    batch.set(
      staffUserReference,
      {
        uid:
          authUser.uid,

        name,

        email,

        phone:
          phone || null,

        role:
          "gym_staff",

        gymId,

        trainerId:
          null,

        isPremium:
          false,

        subscriptionStatus:
          "inactive",

        createdBy:
          decodedToken.uid,

        createdByRole:
          "gym_owner",

        createdAt:
          FieldValue
            .serverTimestamp(),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      }
    );


    batch.set(
      staffMemberReference,
      {
        uid:
          authUser.uid,

        authUid:
          authUser.uid,

        role:
          "gym_staff",

        gymRole:
          "gym_staff",

        name,

        email,

        phone:
          phone || null,

        gymId,

        addedBy:
          decodedToken.uid,

        addedByRole:
          "gym_owner",

        createdAt:
          FieldValue
            .serverTimestamp(),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      }
    );


    await batch.commit();


    /*
     * 8. Uspjeh.
     *
     * Frontend će zatim poslati
     * password-reset email na
     * ovu adresu kako bi djelatnik
     * sam postavio lozinku.
     */

    return NextResponse.json(
      {
        ok:
          true,

        staff: {
          uid:
            authUser.uid,

          name,

          email,

          phone:
            phone || null,

          role:
            "gym_staff",

          gymId,
        },

        requiresPasswordSetup:
          true,
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
    /*
     * Ako je Auth račun nastao,
     * ali Firestore nije spremljen,
     * brišemo nedovršeni račun.
     */

    if (createdAuthUid) {
      try {
        await adminAuth
          .deleteUser(
            createdAuthUid
          );
      } catch (
        cleanupError
      ) {
        console.error(
          "Nije moguće obrisati nedovršeni račun djelatnika:",
          cleanupError
        );
      }
    }


    console.error(
      "Greška kod stvaranja djelatnika:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Račun djelatnika trenutačno nije moguće stvoriti.",
      },
      {
        status: 500,
      }
    );
  }
}