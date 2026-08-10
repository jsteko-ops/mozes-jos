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

export const dynamic =
  "force-dynamic";


type AllowedCreatorRole =
  | "trainer"
  | "gym_owner"
  | "gym_staff";


type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer";


type CreateClientBody = {
  name?: unknown;

  email?: unknown;

  password?: unknown;

  phone?: unknown;

  goal?: unknown;

  note?: unknown;

  gender?: unknown;

  trainerId?: unknown;

  hasInitialPayment?: unknown;

  membershipStart?: unknown;

  membershipDuration?: unknown;

  amount?: unknown;

  paymentMethod?: unknown;
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


function isAllowedCreatorRole(
  value: unknown
): value is AllowedCreatorRole {
  return (
    value === "trainer" ||
    value === "gym_owner" ||
    value === "gym_staff"
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


function isPaymentMethod(
  value: unknown
): value is PaymentMethod {
  return (
    value === "cash" ||
    value === "card" ||
    value === "bank_transfer"
  );
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


function getMembershipDuration(
  value: unknown
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value ===
          "string"
        ? Number(value)
        : Number.NaN;


  if (
    parsed === 1 ||
    parsed === 3 ||
    parsed === 6 ||
    parsed === 12
  ) {
    return parsed;
  }


  return null;
}


function getAmount(
  value: unknown
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value ===
          "string"
        ? Number(value)
        : Number.NaN;


  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return null;
  }


  return Math.round(
    parsed * 100
  ) / 100;
}


function parseDateOnly(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );


  if (!match) {
    return null;
  }


  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);


  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
      )
    );


  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    return null;
  }


  return date;
}


function addMonths(
  date: Date,
  months: number
) {
  const year =
    date.getUTCFullYear();

  const month =
    date.getUTCMonth();

  const day =
    date.getUTCDate();


  const targetMonthStart =
    new Date(
      Date.UTC(
        year,
        month + months,
        1,
        12,
        0,
        0,
        0
      )
    );


  const targetYear =
    targetMonthStart
      .getUTCFullYear();

  const targetMonth =
    targetMonthStart
      .getUTCMonth();


  const lastDayOfMonth =
    new Date(
      Date.UTC(
        targetYear,
        targetMonth + 1,
        0,
        12,
        0,
        0,
        0
      )
    ).getUTCDate();


  const safeDay =
    Math.min(
      day,
      lastDayOfMonth
    );


  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      safeDay,
      23,
      59,
      59,
      999
    )
  );
}


async function emailAlreadyUsedByClient(
  email: string,
  gymId: string | null,
  trainerId: string | null
) {
  if (!email) {
    return false;
  }


  const snapshot =
    await adminDb
      .collection("clients")
      .where(
        "email",
        "==",
        email
      )
      .limit(25)
      .get();


  if (snapshot.empty) {
    return false;
  }


  return snapshot.docs.some(
    (document) => {
      const data =
        document.data();


      const existingGymId =
        typeof data.gymId ===
          "string"
          ? data.gymId
          : null;


      const existingTrainerId =
        typeof data.trainerId ===
          "string"
          ? data.trainerId
          : null;


      if (gymId) {
        return (
          existingGymId ===
          gymId
        );
      }


      if (trainerId) {
        return (
          !existingGymId &&
          existingTrainerId ===
            trainerId
        );
      }


      return false;
    }
  );
}


async function authEmailExists(
  email: string
) {
  if (!email) {
    return false;
  }


  try {
    await adminAuth.getUserByEmail(
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
     * Učitavamo profil osobe
     * koja upisuje člana.
     */

    const creatorReference =
      adminDb
        .collection("users")
        .doc(
          decodedToken.uid
        );


    const creatorSnapshot =
      await creatorReference
        .get();


    if (
      !creatorSnapshot.exists
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


    const creatorData =
      creatorSnapshot.data();


    const creatorRole =
      creatorData?.role;


    if (
      !isAllowedCreatorRole(
        creatorRole
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nemaš dozvolu za upis novih članova.",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * Gym može biti null samo
     * kod samostalnog trenera.
     */

    const creatorGymId =
      typeof creatorData?.gymId ===
        "string" &&
      creatorData.gymId.trim()
        ? creatorData.gymId.trim()
        : null;


    if (
      (
        creatorRole ===
          "gym_owner" ||
        creatorRole ===
          "gym_staff"
      ) &&
      !creatorGymId
    ) {
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
     * Ako postoji gym,
     * provjeravamo postoji li.
     */

    if (creatorGymId) {
      const gymReference =
        adminDb
          .collection("gyms")
          .doc(
            creatorGymId
          );


      const gymSnapshot =
        await gymReference.get();


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


      /*
       * Vlasnik mora stvarno
       * biti vlasnik tog gyma.
       */

      if (
        creatorRole ===
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


      /*
       * Staff mora biti evidentiran
       * kao djelatnik tog gyma.
       */

      if (
        creatorRole ===
        "gym_staff"
      ) {
        const staffSnapshot =
          await adminDb
            .collection(
              "gymMembers"
            )
            .doc(
              creatorGymId
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
       * Trener koji radi u gymu
       * također mora biti član tog gyma.
       */

      if (
        creatorRole ===
        "trainer"
      ) {
        const trainerMemberSnapshot =
          await adminDb
            .collection(
              "gymMembers"
            )
            .doc(
              creatorGymId
            )
            .collection(
              "members"
            )
            .doc(
              decodedToken.uid
            )
            .get();


        if (
          trainerMemberSnapshot.exists
        ) {
          const memberData =
            trainerMemberSnapshot
              .data();


          const memberRole =
            memberData?.gymRole ??
            memberData?.role;


          if (
            memberRole !==
            "trainer"
          ) {
            return NextResponse.json(
              {
                error:
                  "Trener nije pravilno povezan s teretanom.",
              },
              {
                status: 403,
              }
            );
          }
        }
      }
    }


    /*
     * Body
     */

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
      normalizeString(
        body.name
      );


    const email =
      normalizeEmail(
        body.email
      );


    const password =
      typeof body.password ===
        "string"
        ? body.password
        : "";


    const phone =
      normalizeString(
        body.phone
      );


    const goal =
      normalizeString(
        body.goal
      );


    const note =
      normalizeString(
        body.note
      );


    const gender =
      isClientGender(
        body.gender
      )
        ? body.gender
        : null;


    const requestedTrainerId =
      normalizeString(
        body.trainerId
      );


    const hasInitialPayment =
      body.hasInitialPayment ===
      true;


    /*
     * Osnovna validacija.
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
      email &&
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          error:
            "E-mail adresa nije ispravna.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      password &&
      !email
    ) {
      return NextResponse.json(
        {
          error:
            "Za korisnički račun moraš upisati e-mail.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      password &&
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
            "Odaberi spol člana.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * Rješavanje trenera.
     *
     * Trener koji upisuje svog
     * klijenta automatski postaje
     * njegov trener.
     *
     * Owner i staff mogu ostaviti
     * trainerId null.
     */

    let resolvedTrainerId:
      string | null = null;


    if (
      creatorRole ===
      "trainer"
    ) {
      resolvedTrainerId =
        decodedToken.uid;
    } else if (
      requestedTrainerId
    ) {
      if (!creatorGymId) {
        return NextResponse.json(
          {
            error:
              "Trenera nije moguće dodijeliti bez teretane.",
          },
          {
            status: 400,
          }
        );
      }


      const selectedTrainerSnapshot =
        await adminDb
          .collection("users")
          .doc(
            requestedTrainerId
          )
          .get();


      if (
        !selectedTrainerSnapshot.exists
      ) {
        return NextResponse.json(
          {
            error:
              "Odabrani trener nije pronađen.",
          },
          {
            status: 404,
          }
        );
      }


      const selectedTrainerData =
        selectedTrainerSnapshot
          .data();


      const selectedTrainerGymId =
        typeof selectedTrainerData
          ?.gymId ===
          "string"
          ? selectedTrainerData
              .gymId
              .trim()
          : "";


      if (
        selectedTrainerData?.role !==
          "trainer" ||
        selectedTrainerGymId !==
          creatorGymId
      ) {
        return NextResponse.json(
          {
            error:
              "Odabrani trener ne pripada ovoj teretani.",
          },
          {
            status: 400,
          }
        );
      }


      const selectedTrainerMember =
        await adminDb
          .collection(
            "gymMembers"
          )
          .doc(
            creatorGymId
          )
          .collection(
            "members"
          )
          .doc(
            requestedTrainerId
          )
          .get();


      const selectedMemberData =
        selectedTrainerMember
          .data();


      const selectedMemberRole =
        selectedMemberData
          ?.gymRole ??
        selectedMemberData?.role;


      if (
        !selectedTrainerMember
          .exists ||
        selectedMemberRole !==
          "trainer"
      ) {
        return NextResponse.json(
          {
            error:
              "Odabrani trener nije aktivan član ove teretane.",
          },
          {
            status: 400,
          }
        );
      }


      resolvedTrainerId =
        requestedTrainerId;
    }


    /*
     * Početna članarina.
     */

    let membershipStart:
      Date | null = null;


    let membershipValidUntil:
      Date | null = null;


    let membershipDuration:
      number | null = null;


    let membershipAmount:
      number | null = null;


    let paymentMethod:
      PaymentMethod | null =
        null;


    if (
      hasInitialPayment
    ) {
      if (!creatorGymId) {
        return NextResponse.json(
          {
            error:
              "Članarinu teretane nije moguće evidentirati bez teretane.",
          },
          {
            status: 400,
          }
        );
      }


      membershipStart =
        parseDateOnly(
          body.membershipStart
        );


      membershipDuration =
        getMembershipDuration(
          body.membershipDuration
        );


      membershipAmount =
        getAmount(
          body.amount
        );


      paymentMethod =
        isPaymentMethod(
          body.paymentMethod
        )
          ? body.paymentMethod
          : null;


      if (
        !membershipStart
      ) {
        return NextResponse.json(
          {
            error:
              "Odaberi datum početka članarine.",
          },
          {
            status: 400,
          }
        );
      }


      if (
        !membershipDuration
      ) {
        return NextResponse.json(
          {
            error:
              "Odaberi trajanje članarine.",
          },
          {
            status: 400,
          }
        );
      }


      if (
        !membershipAmount
      ) {
        return NextResponse.json(
          {
            error:
              "Upiši ispravan iznos članarine.",
          },
          {
            status: 400,
          }
        );
      }


      if (
        !paymentMethod
      ) {
        return NextResponse.json(
          {
            error:
              "Odaberi način plaćanja.",
          },
          {
            status: 400,
          }
        );
      }


      membershipValidUntil =
        addMonths(
          membershipStart,
          membershipDuration
        );
    }


    /*
     * Provjera duplikata.
     */

    if (email) {
      const existingClient =
        await emailAlreadyUsedByClient(
          email,
          creatorGymId,
          resolvedTrainerId
        );


      if (existingClient) {
        return NextResponse.json(
          {
            error:
              "Član s tim e-mailom već je evidentiran.",
          },
          {
            status: 409,
          }
        );
      }


      const existingAuth =
        await authEmailExists(
          email
        );


      if (existingAuth) {
        return NextResponse.json(
          {
            error:
              "Korisnik s tim e-mailom već ima račun. Postojeći račun treba povezati s teretanom umjesto stvaranja duplikata.",
          },
          {
            status: 409,
          }
        );
      }
    }


    /*
     * Korisnički račun NIJE
     * obavezan.
     *
     * Ako su poslani email +
     * password, stvaramo Firebase
     * Auth račun.
     *
     * Ako password nije poslan,
     * član ostaje samo u evidenciji.
     */

    let authUid:
      string | null = null;


    if (
      email &&
      password
    ) {
      const authUser =
        await adminAuth
          .createUser(
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

      authUid =
        authUser.uid;
    }


    /*
     * Ako nema Auth računa,
     * generiramo stabilni Client ID.
     */

    const clientReference =
      authUid
        ? adminDb
            .collection(
              "clients"
            )
            .doc(
              authUid
            )
        : adminDb
            .collection(
              "clients"
            )
            .doc();


    const clientId =
      clientReference.id;


    const batch =
      adminDb.batch();


    /*
     * users/{uid}
     *
     * Kreira se samo ako član
     * ima Firebase Auth račun.
     */

    if (authUid) {
      const userReference =
        adminDb
          .collection("users")
          .doc(authUid);


      batch.set(
        userReference,
        {
          uid:
            authUid,

          name,

          email,

          phone:
            phone || null,

          role:
            "client",

          gender,

          gymId:
            creatorGymId,

          trainerId:
            resolvedTrainerId,

          isPremium:
            false,

          subscriptionStatus:
            "inactive",

          createdBy:
            decodedToken.uid,

          createdByRole:
            creatorRole,

          createdAt:
            FieldValue
              .serverTimestamp(),

          updatedAt:
            FieldValue
              .serverTimestamp(),
        }
      );
    }


    /*
     * clients/{clientId}
     *
     * Ovdje ostaje veza s
     * trenerskim dijelom aplikacije.
     */

    batch.set(
      clientReference,
      {
        uid:
          clientId,

        authUid:
          authUid,

        name,

        email:
          email || null,

        phone:
          phone || null,

        goal:
          goal || "",

        note:
          note || "",

        gender,

        gymId:
          creatorGymId,

        trainerId:
          resolvedTrainerId,

        membershipState:
          hasInitialPayment
            ? "active"
            : "inactive",

        membershipValidFrom:
          membershipStart,

        membershipValidUntil:
          membershipValidUntil,

        membershipAmount:
          membershipAmount,

        membershipDurationMonths:
          membershipDuration,

        createdBy:
          decodedToken.uid,

        createdByRole:
          creatorRole,

        createdAt:
          FieldValue
            .serverTimestamp(),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      }
    );


    /*
     * gymMembers se zapisuje samo
     * ako član pripada teretani.
     *
     * Ovdje držimo osnovne
     * recepcijske podatke.
     */

    let memberReference:
      FirebaseFirestore.DocumentReference | null =
        null;


    if (creatorGymId) {
      memberReference =
        adminDb
          .collection(
            "gymMembers"
          )
          .doc(
            creatorGymId
          )
          .collection(
            "members"
          )
          .doc(
            clientId
          );


      batch.set(
        memberReference,
        {
          uid:
            clientId,

          authUid:
            authUid,

          role:
            "client",

          gymRole:
            "client",

          name,

          email:
            email || null,

          phone:
            phone || null,

          gender,

          gymId:
            creatorGymId,

          trainerId:
            resolvedTrainerId,

          membershipState:
            hasInitialPayment
              ? "active"
              : "inactive",

          membershipValidFrom:
            membershipStart,

          membershipValidUntil:
            membershipValidUntil,

          membershipAmount:
            membershipAmount,

          membershipDurationMonths:
            membershipDuration,

          note:
            note || "",

          addedBy:
            decodedToken.uid,

          addedByRole:
            creatorRole,

          createdAt:
            FieldValue
              .serverTimestamp(),

          updatedAt:
            FieldValue
              .serverTimestamp(),
        }
      );
    }


    /*
     * Početna uplata.
     *
     * Čuvamo je ispod gymMembers,
     * odvojeno od privatnih
     * trenerskih podataka.
     */

    let paymentId:
      string | null = null;


    if (
      hasInitialPayment &&
      memberReference &&
      membershipStart &&
      membershipValidUntil &&
      membershipAmount &&
      membershipDuration &&
      paymentMethod
    ) {
      const paymentReference =
        memberReference
          .collection(
            "payments"
          )
          .doc();


      paymentId =
        paymentReference.id;


      batch.set(
        paymentReference,
        {
          id:
            paymentReference.id,

          clientId,

          gymId:
            creatorGymId,

          amount:
            membershipAmount,

          method:
            paymentMethod,

          status:
            "completed",

          periodFrom:
            membershipStart,

          periodUntil:
            membershipValidUntil,

          durationMonths:
            membershipDuration,

          recordedBy:
            decodedToken.uid,

          recordedByRole:
            creatorRole,

          note:
            note || "",

          paidAt:
            FieldValue
              .serverTimestamp(),

          createdAt:
            FieldValue
              .serverTimestamp(),
        }
      );
    }


    /*
     * Sve se sprema zajedno.
     */

    await batch.commit();


    return NextResponse.json(
      {
        ok:
          true,

        client: {
          uid:
            clientId,

          authUid,

          name,

          email:
            email || null,

          phone:
            phone || null,

          gender,

          gymId:
            creatorGymId,

          trainerId:
            resolvedTrainerId,

          membershipState:
            hasInitialPayment
              ? "active"
              : "inactive",

          membershipValidFrom:
            membershipStart
              ? membershipStart
                  .toISOString()
              : null,

          membershipValidUntil:
            membershipValidUntil
              ? membershipValidUntil
                  .toISOString()
              : null,

          membershipAmount,

          membershipDurationMonths:
            membershipDuration,
        },

        payment:
          paymentId
            ? {
                id:
                  paymentId,

                amount:
                  membershipAmount,

                method:
                  paymentMethod,
              }
            : null,

        accountCreated:
          Boolean(
            authUid
          ),
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
     * Ako je Auth korisnik
     * stvoren, ali Firestore
     * spremanje nije uspjelo,
     * čistimo nedovršeni račun.
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
          "Nije moguće obrisati nedovršenog Auth korisnika:",
          cleanupError
        );
      }
    }


    console.error(
      "Greška kod stvaranja člana:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Člana trenutačno nije moguće stvoriti.",
      },
      {
        status: 500,
      }
    );
  }
}

