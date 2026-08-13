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


type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer";


type RecorderRole =
  | "gym_owner"
  | "gym_staff";


type PaymentBody = {
  membershipStart?: unknown;

  membershipDuration?: unknown;

  amount?: unknown;

  paymentMethod?: unknown;

  note?: unknown;
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


function isRecorderRole(
  value: unknown
): value is RecorderRole {
  return (
    value === "gym_owner" ||
    value === "gym_staff"
  );
}


function isPaymentMethod(
  value: unknown
): value is PaymentMethod {
  return (
    value === "cash" ||
    value === "card" ||
    value ===
      "bank_transfer"
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
    !Number.isFinite(
      parsed
    ) ||
    parsed <= 0
  ) {
    return null;
  }


  return (
    Math.round(
      parsed * 100
    ) / 100
  );
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


function toDate(
  value: unknown
): Date | null {
  if (!value) {
    return null;
  }


  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }


  if (
    typeof value ===
      "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate ===
      "function"
  ) {
    const date = (
      value as {
        toDate: () => Date;
      }
    ).toDate();


    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }


  return null;
}


function dateOnlyUtc(
  date: Date
) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
      0
    )
  );
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

export async function GET(
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
    } = await context.params;


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


    const recorderSnapshot =
      await adminDb
        .collection(
          "users"
        )
        .doc(
          decodedToken.uid
        )
        .get();


    if (
      !recorderSnapshot.exists
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


    const recorderData =
      recorderSnapshot.data();


    const recorderRole =
      recorderData?.role;


    if (
      !isRecorderRole(
        recorderRole
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nemaš dozvolu za pregled uplata.",
        },
        {
          status: 403,
        }
      );
    }


    const gymId =
      typeof recorderData?.gymId ===
        "string" &&
      recorderData.gymId.trim()
        ? recorderData.gymId.trim()
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
      recorderRole ===
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
      recorderRole ===
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


    const paymentsSnapshot =
      await memberReference
        .collection(
          "payments"
        )
        .orderBy(
          "paidAt",
          "desc"
        )
        .limit(100)
        .get();


    const recorderIds =
      Array.from(
        new Set(
          paymentsSnapshot.docs
            .map(
              (document) =>
                document.data()
                  ?.recordedBy
            )
            .filter(
              (
                value
              ): value is string =>
                typeof value ===
                  "string" &&
                value.length > 0
            )
        )
      );


    const recorderNames =
      new Map<
        string,
        string
      >();


    await Promise.all(
      recorderIds.map(
        async (
          recorderId
        ) => {
          const snapshot =
            await adminDb
              .collection(
                "users"
              )
              .doc(
                recorderId
              )
              .get();


          const data =
            snapshot.data();


          const name =
            typeof data?.name ===
              "string" &&
            data.name.trim()
              ? data.name.trim()
              : typeof data?.displayName ===
                    "string" &&
                  data.displayName.trim()
                ? data.displayName.trim()
                : typeof data?.email ===
                      "string" &&
                    data.email.trim()
                  ? data.email.trim()
                  : recorderId;


          recorderNames.set(
            recorderId,
            name
          );
        }
      )
    );


    const payments =
      paymentsSnapshot.docs.map(
        (document) => {
          const data =
            document.data();


          const recordedBy =
            typeof data.recordedBy ===
              "string"
              ? data.recordedBy
              : null;


          return {
            id:
              document.id,

            amount:
              typeof data.amount ===
                "number"
                ? data.amount
                : null,

            method:
              typeof data.method ===
                "string"
                ? data.method
                : null,

            status:
              typeof data.status ===
                "string"
                ? data.status
                : null,

            durationMonths:
              typeof data.durationMonths ===
                "number"
                ? data.durationMonths
                : null,

            periodFrom:
              toDate(
                data.periodFrom
              )?.toISOString() ??
              null,

            periodUntil:
              toDate(
                data.periodUntil
              )?.toISOString() ??
              null,

            paidAt:
              toDate(
                data.paidAt
              )?.toISOString() ??
              null,

            note:
              typeof data.note ===
                "string"
                ? data.note
                : "",

            recordedBy,

            recordedByRole:
              typeof data.recordedByRole ===
                "string"
                ? data.recordedByRole
                : null,

            recordedByName:
              recordedBy
                ? recorderNames.get(
                    recordedBy
                  ) ??
                  recordedBy
                : null,
          };
        }
      );


    return NextResponse.json(
      {
        member: {
          uid:
            memberSnapshot.id,

          name:
            typeof memberData?.name ===
              "string"
              ? memberData.name
              : null,

          displayName:
            typeof memberData?.displayName ===
              "string"
              ? memberData.displayName
              : null,

          email:
            typeof memberData?.email ===
              "string"
              ? memberData.email
              : null,

          phone:
            typeof memberData?.phone ===
              "string"
              ? memberData.phone
              : null,

          trainerId:
            typeof memberData?.trainerId ===
              "string"
              ? memberData.trainerId
              : null,

          membershipState:
            typeof memberData?.membershipState ===
              "string"
              ? memberData.membershipState
              : null,

          membershipStatus:
            typeof memberData?.membershipStatus ===
              "string"
              ? memberData.membershipStatus
              : null,

          membershipAmount:
            typeof memberData?.membershipAmount ===
              "number"
              ? memberData.membershipAmount
              : null,

          membershipDurationMonths:
            typeof memberData?.membershipDurationMonths ===
              "number"
              ? memberData.membershipDurationMonths
              : null,

          membershipValidFrom:
            toDate(
              memberData
                ?.membershipValidFrom
            )?.toISOString() ??
            null,

          membershipValidUntil:
            toDate(
              memberData
                ?.membershipValidUntil
            )?.toISOString() ??
            null,
        },

        payments,
      }
    );
  } catch (error) {
    console.error(
      "Greška kod učitavanja povijesti uplata:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Povijest uplata trenutno nije moguće učitati.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
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
    } = await context.params;


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
     * 1. Prijava korisnika.
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
     * 2. Profil osobe koja
     * evidentira uplatu.
     */

    const recorderSnapshot =
      await adminDb
        .collection(
          "users"
        )
        .doc(
          decodedToken.uid
        )
        .get();


    if (
      !recorderSnapshot.exists
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


    const recorderData =
      recorderSnapshot.data();


    const recorderRole =
      recorderData?.role;


    if (
      !isRecorderRole(
        recorderRole
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nemaš dozvolu za evidentiranje uplata.",
        },
        {
          status: 403,
        }
      );
    }


    const gymId =
      typeof recorderData?.gymId ===
        "string" &&
      recorderData.gymId.trim()
        ? recorderData.gymId.trim()
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
     * 3. Provjera teretane
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


    const gymData =
      gymSnapshot.data();


    if (
      recorderRole ===
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
      recorderRole ===
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
     * 4. Podaci uplate.
     */

    let body:
      PaymentBody;


    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Podaci uplate nisu valjani.",
        },
        {
          status: 400,
        }
      );
    }


    const requestedStart =
      parseDateOnly(
        body.membershipStart
      );


    const durationMonths =
      getMembershipDuration(
        body.membershipDuration
      );


    const amount =
      getAmount(
        body.amount
      );


    const paymentMethod =
      isPaymentMethod(
        body.paymentMethod
      )
        ? body.paymentMethod
        : null;


    const note =
      normalizeString(
        body.note
      );


    if (!requestedStart) {
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


    if (!durationMonths) {
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


    if (!amount) {
      return NextResponse.json(
        {
          error:
            "Upiši ispravan iznos uplate.",
        },
        {
          status: 400,
        }
      );
    }


    if (!paymentMethod) {
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


    /*
     * 5. Reference.
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


    const clientReference =
      adminDb
        .collection(
          "clients"
        )
        .doc(
          memberId
        );


    const paymentReference =
      memberReference
        .collection(
          "payments"
        )
        .doc();


    /*
     * 6. Transakcija.
     *
     * Ako član već ima aktivnu
     * članarinu, produžujemo je
     * od postojećeg datuma isteka.
     *
     * Ako je članarina istekla
     * ili je nema, kreće od datuma
     * koji recepcija odabere.
     */

    const result =
      await adminDb.runTransaction(
        async (
          transaction
        ) => {
          const memberSnapshot =
            await transaction.get(
              memberReference
            );


          if (
            !memberSnapshot.exists
          ) {
            throw new Error(
              "MEMBER_NOT_FOUND"
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
            throw new Error(
              "NOT_CLIENT"
            );
          }


          if (
            typeof memberData?.gymId ===
              "string" &&
            memberData.gymId &&
            memberData.gymId !==
              gymId
          ) {
            throw new Error(
              "WRONG_GYM"
            );
          }


          const clientSnapshot =
            await transaction.get(
              clientReference
            );


          const currentValidUntil =
            toDate(
              memberData
                ?.membershipValidUntil
            );


          const requestedStartDate =
            dateOnlyUtc(
              requestedStart
            );


          let periodStart =
            requestedStartDate;


          if (
            currentValidUntil
          ) {
            const currentExpiryDate =
              dateOnlyUtc(
                currentValidUntil
              );


            if (
              currentExpiryDate >=
              requestedStartDate
            ) {
              periodStart =
                currentExpiryDate;
            }
          }


          const newValidUntil =
            addMonths(
              periodStart,
              durationMonths
            );


          const existingValidFrom =
            toDate(
              memberData
                ?.membershipValidFrom
            );


          const membershipValidFrom =
            currentValidUntil &&
            dateOnlyUtc(
              currentValidUntil
            ) >=
              requestedStartDate &&
            existingValidFrom
              ? existingValidFrom
              : requestedStartDate;


          const membershipUpdate = {
            membershipState:
              "active",

            membershipStatus:
              "active",

            membershipValidFrom,

            membershipValidUntil:
              newValidUntil,

            membershipAmount:
              amount,

            membershipDurationMonths:
              durationMonths,

            updatedAt:
              FieldValue
                .serverTimestamp(),
          };


          transaction.set(
            memberReference,
            membershipUpdate,
            {
              merge: true,
            }
          );


          if (
            clientSnapshot.exists
          ) {
            transaction.set(
              clientReference,
              membershipUpdate,
              {
                merge: true,
              }
            );
          }


          transaction.set(
            paymentReference,
            {
              id:
                paymentReference.id,

              clientId:
                memberId,

              gymId,

              amount,

              method:
                paymentMethod,

              status:
                "completed",

              periodFrom:
                periodStart,

              periodUntil:
                newValidUntil,

              durationMonths,

              recordedBy:
                decodedToken.uid,

              recordedByRole:
                recorderRole,

              note,

              paidAt:
                FieldValue
                  .serverTimestamp(),

              createdAt:
                FieldValue
                  .serverTimestamp(),
            }
          );


          return {
            paymentId:
              paymentReference.id,

            periodStart,

            newValidUntil,
          };
        }
      );


    /*
     * 7. Odgovor.
     */

    return NextResponse.json(
      {
        ok: true,

        payment: {
          id:
            result.paymentId,

          amount,

          method:
            paymentMethod,

          durationMonths,

          periodFrom:
            result.periodStart
              .toISOString(),

          periodUntil:
            result.newValidUntil
              .toISOString(),
        },

        membership: {
          state:
            "active",

          amount,

          validUntil:
            result.newValidUntil
              .toISOString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (
    error: unknown
  ) {
    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "MEMBER_NOT_FOUND"
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


      if (
        error.message ===
        "NOT_CLIENT"
      ) {
        return NextResponse.json(
          {
            error:
              "Uplatu je moguće evidentirati samo članu teretane.",
          },
          {
            status: 400,
          }
        );
      }


      if (
        error.message ===
        "WRONG_GYM"
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
    }


    console.error(
      "Greška kod evidentiranja uplate:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Uplatu trenutno nije moguće evidentirati.",
      },
      {
        status: 500,
      }
    );
  }
}