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


type SettingsBody = {

  primaryUid?: unknown;

  backupUid?: unknown;

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


async function getOwnerContext(
  request: Request
) {

  const token =
    getToken(request);


  if (!token) {

    return {
      error:
        "Nedostaje prijava korisnika.",

      status:
        401,
    };

  }


  let decodedToken;


  try {

    decodedToken =
      await adminAuth.verifyIdToken(
        token,
        true
      );

  } catch {

    return {
      error:
        "Prijava korisnika nije valjana.",

      status:
        401,
    };

  }


  const userSnapshot =
    await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();


  if (!userSnapshot.exists) {

    return {
      error:
        "Korisnički profil nije pronađen.",

      status:
        404,
    };

  }


  const userData =
    userSnapshot.data();


  if (
    userData?.role !== "gym_owner"
  ) {

    return {
      error:
        "Samo vlasnik teretane može mijenjati ove postavke.",

      status:
        403,
    };

  }


  const gymId =
    typeof userData.gymId === "string"

      ? userData.gymId

      : "";


  if (!gymId) {

    return {
      error:
        "Vlasnik nije povezan s teretanom.",

      status:
        400,
    };

  }


  return {

    uid:
      decodedToken.uid,

    gymId,

    error:
      null,

    status:
      200,

  };

}


async function getEligiblePeople(
  gymId: string
) {

  const usersSnapshot =
    await adminDb
      .collection("users")
      .where(
        "gymId",
        "==",
        gymId
      )
      .limit(200)
      .get();


  return usersSnapshot.docs

    .map(
      (document) => {

        const data =
          document.data();


        return {

          uid:
            document.id,

          name:
            typeof data.name === "string" &&
            data.name.trim()

              ? data.name.trim()

              : [
                  data.firstName,
                  data.lastName,
                ]
                  .filter(
                    (value) =>
                      typeof value === "string" &&
                      value.trim()
                  )
                  .join(" ") ||
                data.email ||
                "Korisnik",

          email:
            typeof data.email === "string"

              ? data.email

              : null,

          role:
            data.role,

          gymId:
            data.gymId,

        };

      }
    )

    .filter(
      (person) =>
        person.gymId === gymId &&
        (
          person.role === "gym_owner" ||
          person.role === "trainer"
        )
    )

    .sort(
      (first, second) => {

        if (
          first.role === "gym_owner" &&
          second.role !== "gym_owner"
        ) {

          return -1;

        }


        if (
          second.role === "gym_owner" &&
          first.role !== "gym_owner"
        ) {

          return 1;

        }


        return first.name.localeCompare(
          second.name,
          "hr"
        );

      }
    );

}


export async function GET(
  request: Request
) {

  try {

    const ownerContext =
      await getOwnerContext(
        request
      );


    if (ownerContext.error) {

      return NextResponse.json(
        {
          error:
            ownerContext.error,
        },
        {
          status:
            ownerContext.status,
        }
      );

    }


    const gymReference =
      adminDb
        .collection("gyms")
        .doc(ownerContext.gymId!);


    const [
      gymSnapshot,
      people,
    ] = await Promise.all([

      gymReference.get(),

      getEligiblePeople(
        ownerContext.gymId!
      ),

    ]);


    const gymData =
      gymSnapshot.data();


    return NextResponse.json(
      {
        settings: {

          primaryUid:
            typeof gymData?.safeReportPrimaryUid ===
            "string"

              ? gymData.safeReportPrimaryUid

              : null,

          backupUid:
            typeof gymData?.safeReportBackupUid ===
            "string"

              ? gymData.safeReportBackupUid

              : null,

        },

        people:
          people.map(
            (person) => ({

              uid:
                person.uid,

              name:
                person.name,

              email:
                person.email,

              role:
                person.role,

            })
          ),
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
      "Greška kod učitavanja postavki sigurnih prijava:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Postavke trenutačno nije moguće učitati.",
      },
      {
        status: 500,
      }
    );

  }

}


export async function PATCH(
  request: Request
) {

  try {

    const ownerContext =
      await getOwnerContext(
        request
      );


    if (ownerContext.error) {

      return NextResponse.json(
        {
          error:
            ownerContext.error,
        },
        {
          status:
            ownerContext.status,
        }
      );

    }


    let body:
      SettingsBody;


    try {

      body =
        await request.json() as
          SettingsBody;

    } catch {

      return NextResponse.json(
        {
          error:
            "Podaci nisu ispravni.",
        },
        {
          status: 400,
        }
      );

    }


    const primaryUid =
      typeof body.primaryUid === "string"

        ? body.primaryUid.trim()

        : "";


    const backupUid =
      typeof body.backupUid === "string"

        ? body.backupUid.trim()

        : "";


    if (!primaryUid) {

      return NextResponse.json(
        {
          error:
            "Odaberi glavnu odgovornu osobu.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      backupUid &&
      backupUid === primaryUid
    ) {

      return NextResponse.json(
        {
          error:
            "Glavna i zamjenska osoba ne mogu biti iste.",
        },
        {
          status: 400,
        }
      );

    }


    const eligiblePeople =
      await getEligiblePeople(
        ownerContext.gymId!
      );


    const eligiblePeopleByUid =
      new Map(
        eligiblePeople.map(
          (person) => [
            person.uid,
            person,
          ]
        )
      );


    if (
      !eligiblePeopleByUid.has(
        primaryUid
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Odabrana glavna osoba nije član ove teretane.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      backupUid &&
      !eligiblePeopleByUid.has(
        backupUid
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Odabrana zamjenska osoba nije član ove teretane.",
        },
        {
          status: 400,
        }
      );

    }


    const gymReference =
      adminDb
        .collection("gyms")
        .doc(ownerContext.gymId!);


    await gymReference.set(
      {
        safeReportPrimaryUid:
          primaryUid,

        safeReportBackupUid:
          backupUid || null,

        safeReportSettingsUpdatedAt:
          FieldValue.serverTimestamp(),

        safeReportSettingsUpdatedByUid:
          ownerContext.uid,
      },
      {
        merge: true,
      }
    );


    return NextResponse.json(
      {
        ok: true,

        settings: {
          primaryUid,

          backupUid:
            backupUid || null,
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
      "Greška kod spremanja postavki sigurnih prijava:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Postavke trenutačno nije moguće spremiti.",
      },
      {
        status: 500,
      }
    );

  }

}