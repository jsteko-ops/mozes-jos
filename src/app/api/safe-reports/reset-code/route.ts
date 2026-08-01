import {
  createHash,
  randomBytes,
} from "node:crypto";

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


type ResetCodeBody = {

  reportNumber?: unknown;

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


function createAccessCode() {

  const value =
    randomBytes(6)
      .toString("hex")
      .toUpperCase();


  return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;

}


function createAccessCodeHash(
  accessCode: string
) {

  return createHash("sha256")
    .update(accessCode)
    .digest("hex");

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


    if (
      userData?.role !== "client"
    ) {

      return NextResponse.json(
        {
          error:
            "Samo klijent može zatražiti novi pristupni kod.",
        },
        {
          status: 403,
        }
      );

    }


    let body:
      ResetCodeBody;


    try {

      body =
        await request.json() as
          ResetCodeBody;

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


    const reportNumber =
      typeof body.reportNumber === "string"

        ? body.reportNumber
            .trim()
            .toUpperCase()

        : "";


    const reportNumberPattern =
      /^MJ-\d{8}-[A-F0-9]{6}$/;


    if (
      !reportNumberPattern.test(
        reportNumber
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Broj prijave nije ispravan.",
        },
        {
          status: 400,
        }
      );

    }


    const reportSnapshot =
      await adminDb
        .collection("safeReports")
        .where(
          "reportNumber",
          "==",
          reportNumber
        )
        .limit(1)
        .get();


    const reportDocument =
      reportSnapshot.docs[0];


    if (!reportDocument) {

      return NextResponse.json(
        {
          error:
            "Prijava nije pronađena.",
        },
        {
          status: 404,
        }
      );

    }


    const privateReporterSnapshot =
      await reportDocument.ref
        .collection("private")
        .doc("reporter")
        .get();


    if (
      !privateReporterSnapshot.exists
    ) {

      return NextResponse.json(
        {
          error:
            "Podaci prijavitelja nisu pronađeni.",
        },
        {
          status: 404,
        }
      );

    }


    const privateReporterData =
      privateReporterSnapshot.data();


    if (
      privateReporterData?.reporterUid !==
      decodedToken.uid
    ) {

      return NextResponse.json(
        {
          error:
            "Nemaš dopuštenje za ovu prijavu.",
        },
        {
          status: 403,
        }
      );

    }


    const reportData =
      reportDocument.data();


    const lastResetTime =
      toMilliseconds(
        reportData.accessCodeResetAt
      );


    const now =
      Date.now();


    const resetCooldown =
      60 * 1000;


    if (
      lastResetTime > 0 &&
      now - lastResetTime < resetCooldown
    ) {

      const secondsRemaining =
        Math.ceil(
          (
            resetCooldown -
            (
              now -
              lastResetTime
            )
          ) / 1000
        );


      return NextResponse.json(
        {
          error:
            `Pričekaj još ${secondsRemaining} sekundi prije novog zahtjeva.`,
        },
        {
          status: 429,

          headers: {
            "Retry-After":
              String(secondsRemaining),
          },
        }
      );

    }


    const accessCode =
      createAccessCode();


    const accessCodeHash =
      createAccessCodeHash(
        accessCode
      );


    const activityReference =
      reportDocument.ref
        .collection("activity")
        .doc();


    const batch =
      adminDb.batch();


    batch.update(

      reportDocument.ref,

      {
        accessCodeHash,

        accessCodeResetAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      }

    );


    batch.set(

      activityReference,

      {
        type:
          "access_code_reset",

        actorUid:
          decodedToken.uid,

        actorRole:
          "client",

        createdAt:
          FieldValue.serverTimestamp(),
      }

    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        reportNumber,

        accessCode,
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
      "Greška kod stvaranja novog pristupnog koda:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Novi pristupni kod trenutačno nije moguće izraditi.",
      },
      {
        status: 500,
      }
    );

  }

}