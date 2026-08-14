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


type EditorRole =
  | "gym_owner"
  | "gym_staff";


type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


type UpdateMemberBody = {
  name?: unknown;

  email?: unknown;

  phone?: unknown;

  gender?: unknown;

  note?: unknown;

  trainerId?: unknown;
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


function isEditorRole(
  value: unknown
): value is EditorRole {
  return (
    value ===
      "gym_owner" ||
    value ===
      "gym_staff"
  );
}


function isClientGender(
  value: unknown
): value is ClientGender {
  return (
    value === "male" ||
    value === "female" ||
    value ===
      "prefer_not_to_say"
  );
}


function isValidEmail(
  value: string
) {
  if (!value) {
    return true;
  }


  return (
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
    ).code ===
      "string"
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
      memberId: string;
    }>;
  }
) {
  try {
    const {
      memberId,
    } =
      await context.params;


    /*
     * 1. ID člana.
     */

    if (
      !memberId ||
      memberId.includes("/") ||
      memberId.length > 200
    ) {
      return NextResponse.json(
        {
          error:
            "Član nije valjan.",
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
     * 3. Profil osobe koja
     * uređuje člana.
     */

    const editorSnapshot =
      await adminDb
        .collection(
          "users"
        )
        .doc(
          decodedToken.uid
        )
        .get();


    if (
      !editorSnapshot.exists
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


    const editorData =
      editorSnapshot.data();


    const editorRole =
      editorData?.role;


    if (
      !isEditorRole(
        editorRole
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nemaš dozvolu za uređivanje članova.",
        },
        {
          status: 403,
        }
      );
    }


    const gymId =
      typeof editorData?.gymId ===
        "string" &&
      editorData.gymId.trim()
        ? editorData.gymId.trim()
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
     * 4. Provjera teretane
     * i ovlasti.
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
      editorRole ===
        "gym_owner" &&
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


    if (
      editorRole ===
      "gym_staff"
    ) {
      const staffSnapshot =
        await adminDb
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
            decodedToken.uid
          )
          .get();


      const staffData =
        staffSnapshot.data();


      const staffRole =
        staffData?.gymRole ??
        staffData?.role;


      if (
        !staffSnapshot.exists ||
        staffRole !==
          "gym_staff"
      ) {
        return NextResponse.json(
          {
            error:
              "Djelatnik nije povezan s ovom teretanom.",
          },
          {
            status: 403,
          }
        );
      }
    }


    /*
     * 5. Član.
     */

    const memberReference =
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
          memberId
        );


    const memberSnapshot =
      await memberReference
        .get();


    if (
      !memberSnapshot.exists
    ) {
      return NextResponse.json(
        {
          error:
            "Član nije pronađen.",
        },
        {
          status: 404,
        }
      );
    }


    const memberData =
      memberSnapshot.data();


    const memberRole =
      memberData?.gymRole ??
      memberData?.role;


    if (
      memberRole !==
      "client"
    ) {
      return NextResponse.json(
        {
          error:
            "Odabrani korisnik nije član teretane.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      typeof memberData?.gymId ===
        "string" &&
      memberData.gymId &&
      memberData.gymId !==
        gymId
    ) {
      return NextResponse.json(
        {
          error:
            "Član ne pripada ovoj teretani.",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * 6. Clients dokument.
     */

    const clientReference =
      adminDb
        .collection(
          "clients"
        )
        .doc(
          memberId
        );


    const clientSnapshot =
      await clientReference
        .get();


    const clientData =
      clientSnapshot.exists
        ? clientSnapshot.data()
        : null;


    /*
     * Član može, ali ne mora,
     * imati Firebase Auth račun.
     */

    const authUid =
      typeof memberData?.authUid ===
        "string" &&
      memberData.authUid.trim()
        ? memberData.authUid.trim()
        : typeof clientData?.authUid ===
              "string" &&
            clientData.authUid.trim()
          ? clientData.authUid.trim()
          : null;


    /*
     * 7. Podaci iz forme.
     */

    let body:
      UpdateMemberBody;


    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Podaci člana nisu valjani.",
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


    const note =
      normalizeString(
        body.note
      );


    const trainerIdValue =
      normalizeString(
        body.trainerId
      );


    const trainerId =
      trainerIdValue ||
      null;


    const gender =
      isClientGender(
        body.gender
      )
        ? body.gender
        : null;


    /*
     * 8. Validacija.
     */

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Upiši ime i prezime člana.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      name.length > 120
    ) {
      return NextResponse.json(
        {
          error:
            "Ime može imati najviše 120 znakova.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      authUid &&
      !email
    ) {
      return NextResponse.json(
        {
          error:
            "Član koji ima korisnički račun mora imati e-mail.",
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
            "Telefon može imati najviše 50 znakova.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      note.length > 500
    ) {
      return NextResponse.json(
        {
          error:
            "Napomena može imati najviše 500 znakova.",
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
            "Odaberi spol člana.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * 9. Provjera trenera.
     *
     * Ako je trener odabran,
     * mora biti trener iste
     * teretane.
     */

    if (trainerId) {
      const [
        trainerUserSnapshot,
        trainerMemberSnapshot,
      ] =
        await Promise.all([
          adminDb
            .collection(
              "users"
            )
            .doc(
              trainerId
            )
            .get(),

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
            )
            .get(),
        ]);


      if (
        !trainerUserSnapshot.exists ||
        !trainerMemberSnapshot.exists
      ) {
        return NextResponse.json(
          {
            error:
              "Odabrani trener nije pronađen.",
          },
          {
            status: 400,
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
              "Odabrani korisnik nije trener ove teretane.",
          },
          {
            status: 400,
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
              "Odabrani trener ne pripada ovoj teretani.",
          },
          {
            status: 403,
          }
        );
      }
    }


    /*
     * 10. Provjera e-maila
     * u clients kolekciji.
     */

    if (email) {
      const duplicateSnapshot =
        await adminDb
          .collection(
            "clients"
          )
          .where(
            "email",
            "==",
            email
          )
          .limit(
            20
          )
          .get();


      const duplicateClient =
        duplicateSnapshot.docs
          .find(
            (document) =>
              document.id !==
              memberId
          );


      if (duplicateClient) {
        return NextResponse.json(
          {
            error:
              "Drugi član već koristi tu e-mail adresu.",
          },
          {
            status: 409,
          }
        );
      }


      /*
       * Provjera Firebase Autha.
       */

      try {
        const existingAuthUser =
          await adminAuth
            .getUserByEmail(
              email
            );


        if (
          !authUid ||
          existingAuthUser.uid !==
            authUid
        ) {
          return NextResponse.json(
            {
              error:
                "Ta e-mail adresa već pripada drugom korisničkom računu.",
            },
            {
              status: 409,
            }
          );
        }
      } catch (
        authLookupError
      ) {
        const code =
          getFirebaseErrorCode(
            authLookupError
          );


        if (
          code !==
          "auth/user-not-found"
        ) {
          throw authLookupError;
        }
      }
    }


    /*
     * 11. Ako član ima Auth,
     * ažuriramo i Firebase Auth.
     */

    if (authUid) {
      try {
        await adminAuth
          .updateUser(
            authUid,
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
                "Ta e-mail adresa već pripada drugom korisničkom računu.",
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
                "Korisnički račun člana nije pronađen.",
            },
            {
              status: 404,
            }
          );
        }


        throw authUpdateError;
      }
    }


    /*
     * 12. Sinkronizacija
     * Firestore podataka.
     */

    const updatedAt =
      FieldValue
        .serverTimestamp();


    const commonData = {
      name,

      email:
        email || null,

      phone:
        phone || null,

      gender,

      trainerId,

      updatedAt,
    };


    const batch =
      adminDb.batch();


    /*
     * gymMembers
     */

    batch.set(
      memberReference,
      {
        ...commonData,

        note:
          note || "",
      },
      {
        merge: true,
      }
    );


    /*
     * clients
     */

    batch.set(
      clientReference,
      {
        ...commonData,

        uid:
          memberId,

        authUid,

        gymId,

        note:
          note || "",
      },
      {
        merge: true,
      }
    );


    /*
     * users
     *
     * Samo ako član ima
     * Firebase Auth račun.
     */

    if (authUid) {
      const userReference =
        adminDb
          .collection(
            "users"
          )
          .doc(
            authUid
          );


      batch.set(
        userReference,
        {
          ...commonData,

          uid:
            authUid,

          gymId,
        },
        {
          merge: true,
        }
      );
    }


    await batch.commit();


    /*
     * 13. Odgovor.
     */

    return NextResponse.json(
      {
        ok: true,

        member: {
          uid:
            memberId,

          authUid,

          name,

          email:
            email || null,

          phone:
            phone || null,

          gender,

          trainerId,

          note:
            note || "",
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
  } catch (
    error: unknown
  ) {
    console.error(
      "Greška kod uređivanja člana:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Podatke člana trenutno nije moguće spremiti.",
      },
      {
        status: 500,
      }
    );
  }
}