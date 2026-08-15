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


type UpdateTrainerBody = {
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


function isValidEmail(
  value: string
) {
  return (
    value.length > 0 &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    )
  );
}


function getFirebaseErrorCode(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null &&
    "code" in error &&
    typeof (
      error as {
        code?: unknown;
      }
    ).code === "string"
  ) {
    return (
      error as {
        code: string;
      }
    ).code;
  }

  return "";
}


export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      trainerId: string;
    }>;
  }
) {
  try {
    const {
      trainerId,
    } =
      await context.params;


    /*
     * 1. ID trenera.
     */

    if (
      !trainerId ||
      trainerId.includes("/") ||
      trainerId.length > 200
    ) {
      return NextResponse.json(
        {
          error:
            "Trener nije valjan.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * 2. Prijava.
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
     * 3. Vlasnik teretane.
     */

    const ownerSnapshot =
      await adminDb
        .collection(
          "users"
        )
        .doc(
          decodedToken.uid
        )
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
            "Samo vlasnik teretane može uređivati trenere.",
        },
        {
          status: 403,
        }
      );
    }


    const gymId =
      typeof ownerData?.gymId ===
        "string" &&
      ownerData.gymId.trim()
        ? ownerData.gymId.trim()
        : null;


    if (!gymId) {
      return NextResponse.json(
        {
          error:
            "Račun nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * 4. Provjera teretane.
     */

    const gymSnapshot =
      await adminDb
        .collection(
          "gyms"
        )
        .doc(
          gymId
        )
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
            "Nemaš dozvolu za ovu teretanu.",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * 5. Trener.
     */

    const trainerUserReference =
      adminDb
        .collection(
          "users"
        )
        .doc(
          trainerId
        );


    const trainerMemberReference =
      adminDb
        .collection(
          "gymMembers"
        )
        .doc(
          gymId
        )
        .collection(
          "members"
        )
        .doc(
          trainerId
        );


    const [
      trainerUserSnapshot,
      trainerMemberSnapshot,
    ] =
      await Promise.all([
        trainerUserReference.get(),
        trainerMemberReference.get(),
      ]);


    if (
      !trainerUserSnapshot.exists ||
      !trainerMemberSnapshot.exists
    ) {
      return NextResponse.json(
        {
          error:
            "Trener nije pronađen.",
        },
        {
          status: 404,
        }
      );
    }


    const trainerUserData =
      trainerUserSnapshot.data();

    const trainerMemberData =
      trainerMemberSnapshot.data();


    const trainerGymRole =
      trainerMemberData?.gymRole ??
      trainerMemberData?.role;


    if (
      trainerUserData?.role !==
        "trainer" ||
      trainerGymRole !==
        "trainer"
    ) {
      return NextResponse.json(
        {
          error:
            "Odabrani korisnik nije trener.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      typeof trainerUserData?.gymId ===
        "string" &&
      trainerUserData.gymId &&
      trainerUserData.gymId !==
        gymId
    ) {
      return NextResponse.json(
        {
          error:
            "Trener ne pripada ovoj teretani.",
        },
        {
          status: 403,
        }
      );
    }


    if (
      typeof trainerMemberData?.gymId ===
        "string" &&
      trainerMemberData.gymId &&
      trainerMemberData.gymId !==
        gymId
    ) {
      return NextResponse.json(
        {
          error:
            "Trener ne pripada ovoj teretani.",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * 6. Podaci forme.
     */

    let body:
      UpdateTrainerBody;


    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Podaci trenera nisu valjani.",
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
      normalizeString(
        body.email
      ).toLowerCase();

    const phone =
      normalizeString(
        body.phone
      );


    /*
     * 7. Validacija.
     */

    if (
      !name ||
      name.length > 120
    ) {
      return NextResponse.json(
        {
          error:
            "Upiši ime i prezime trenera.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !isValidEmail(
        email
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Upiši ispravnu e-mail adresu.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      phone.length > 50
    ) {
      return NextResponse.json(
        {
          error:
            "Broj telefona je predug.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * 8. Provjera e-maila
     * u Firebase Authu.
     */

    try {
      const existingUser =
        await adminAuth
          .getUserByEmail(
            email
          );


      if (
        existingUser.uid !==
        trainerId
      ) {
        return NextResponse.json(
          {
            error:
              "Drugi korisnik već koristi tu e-mail adresu.",
          },
          {
            status: 409,
          }
        );
      }
    } catch (
      emailLookupError
    ) {
      const code =
        getFirebaseErrorCode(
          emailLookupError
        );


      if (
        code !==
        "auth/user-not-found"
      ) {
        throw emailLookupError;
      }
    }


    /*
     * 9. Firebase Auth.
     */

    try {
      await adminAuth
        .updateUser(
          trainerId,
          {
            email,
            displayName:
              name,
          }
        );
    } catch (
      authUpdateError
    ) {
      const code =
        getFirebaseErrorCode(
          authUpdateError
        );


      if (
        code ===
        "auth/email-already-exists"
      ) {
        return NextResponse.json(
          {
            error:
              "Drugi korisnik već koristi tu e-mail adresu.",
          },
          {
            status: 409,
          }
        );
      }


      if (
        code ===
        "auth/user-not-found"
      ) {
        return NextResponse.json(
          {
            error:
              "Firebase račun trenera nije pronađen.",
          },
          {
            status: 404,
          }
        );
      }


      throw authUpdateError;
    }


    /*
     * 10. Firestore.
     */

    const updatedAt =
      FieldValue
        .serverTimestamp();


    const commonData = {
      name,
      email,
      phone:
        phone || null,
      gymId,
      updatedAt,
    };


    const batch =
      adminDb.batch();


    batch.set(
      trainerUserReference,
      {
        ...commonData,
        uid:
          trainerId,
        role:
          "trainer",
      },
      {
        merge: true,
      }
    );


    batch.set(
      trainerMemberReference,
      {
        ...commonData,
        uid:
          trainerId,
        role:
          "trainer",
      },
      {
        merge: true,
      }
    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        trainer: {
          uid:
            trainerId,

          name,

          email,

          phone:
            phone || null,

          gymId,

          role:
            "trainer",
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
      "Greška kod uređivanja trenera:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Podatke trenera trenutno nije moguće spremiti.",
      },
      {
        status: 500,
      }
    );
  }
}