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


function toIsoString(
  value: unknown
) {

  if (
    !value ||
    typeof value !== "object"
  ) {

    return null;

  }


  const timestamp =
    value as {
      toDate?: () => Date;
    };


  if (
    typeof timestamp.toDate !== "function"
  ) {

    return null;

  }


  return timestamp
    .toDate()
    .toISOString();

}


function toMilliseconds(
  value: unknown
) {

  if (
    !value ||
    typeof value !== "object"
  ) {

    return 0;

  }


  const timestamp =
    value as {
      toMillis?: () => number;
    };


  if (
    typeof timestamp.toMillis !== "function"
  ) {

    return 0;

  }


  return timestamp.toMillis();

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


    const userSnapshot =
      await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();


    if (!userSnapshot.exists) {

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


    const userData =
      userSnapshot.data();


    const role =
      userData?.role;


    if (
      role !== "gym_owner" &&
      role !== "trainer" &&
      role !== "admin"
    ) {

      return NextResponse.json(
        {
          error:
            "Nemaš dopuštenje za pregled prijava.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof userData?.gymId === "string"

        ? userData.gymId

        : null;


    let snapshot;


    if (role === "admin") {

      snapshot =
        await adminDb
          .collection("safeReports")
          .where(
            "recipientRole",
            "==",
            "admin"
          )
          .limit(200)
          .get();

    } else {

      snapshot =
        await adminDb
          .collection("safeReports")
          .where(
            "recipientUid",
            "==",
            decodedToken.uid
          )
          .limit(200)
          .get();

    }


    const rows =
      snapshot.docs.map(
        (document) => {

          const data =
            document.data();


          const anonymous =
            data.anonymous !== false;


          const reporter =
            !anonymous &&
            data.reporter &&
            typeof data.reporter === "object"

              ? {
                  name:
                    typeof data.reporter.name === "string"

                      ? data.reporter.name

                      : null,

                  email:
                    typeof data.reporter.email === "string"

                      ? data.reporter.email

                      : null,
                }

              : null;


          return {

            recipientUid:
              data.recipientUid ?? null,

            recipientRole:
              data.recipientRole ?? null,

            reportGymId:
              data.gymId ?? null,

            accusedUid:
              data.accused?.uid ?? null,

            accusedRole:
              data.accused?.role ?? null,

            sortTime:
              toMilliseconds(
                data.createdAt
              ),

            report: {

              id:
                document.id,

              reportNumber:
                data.reportNumber ?? "-",

              anonymous,

              reporter,

              accused: {

                uid:
                  data.accused?.uid ?? null,

                role:
                  data.accused?.role ?? "other",

                name:
                  data.accused?.name ?? "-",

              },

              category:
                data.category ?? "other",

              description:
                data.description ?? "",

              occurredAt:
                data.occurredAt ?? null,

              location:
                data.location ?? null,

              status:
                data.status ?? "submitted",

              assignmentStatus:
                data.assignmentStatus ?? "assigned",

              response:
                typeof data.response === "string"

                  ? data.response

                  : null,

              respondedByRole:
                typeof data.respondedByRole === "string"

                  ? data.respondedByRole

                  : null,

              responseAt:
                toIsoString(
                  data.responseAt
                ),

              statusChangedAt:
                toIsoString(
                  data.statusChangedAt
                ),

              createdAt:
                toIsoString(
                  data.createdAt
                ),

              updatedAt:
                toIsoString(
                  data.updatedAt
                ),

            },

          };

        }
      );


    const reports =
      rows

        .filter(
          (row) => {

            if (role === "admin") {

              return (
                row.recipientRole === "admin" &&
                (
                  row.recipientUid === null ||
                  row.recipientUid ===
                    decodedToken.uid
                )
              );

            }


            return (
              row.recipientUid ===
                decodedToken.uid &&
              row.reportGymId === gymId &&
              row.accusedUid !==
                decodedToken.uid &&
              row.accusedRole !==
                "gym_owner"
            );

          }
        )

        .sort(
          (first, second) =>
            second.sortTime -
            first.sortTime
        )

        .map(
          (row) =>
            row.report
        );


    return NextResponse.json(
      {
        reports,
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
      "Greška kod učitavanja sigurnih prijava:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Prijave trenutačno nije moguće učitati.",
      },
      {
        status: 500,
      }
    );

  }

}