import {
  createHash,
  timingSafeEqual,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";


export const runtime = "nodejs";

export const dynamic = "force-dynamic";


type StatusRequestBody = {

  reportNumber?: unknown;

  accessCode?: unknown;

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


function createAccessCodeHash(
  accessCode: string
) {

  return createHash("sha256")
    .update(accessCode)
    .digest("hex");

}


function hashesMatch(
  firstHash: string,
  secondHash: string
) {

  const validHashPattern =
    /^[a-f0-9]{64}$/i;


  if (
    !validHashPattern.test(firstHash) ||
    !validHashPattern.test(secondHash)
  ) {

    return false;

  }


  const firstBuffer =
    Buffer.from(
      firstHash,
      "hex"
    );


  const secondBuffer =
    Buffer.from(
      secondHash,
      "hex"
    );


  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {

    return false;

  }


  return timingSafeEqual(
    firstBuffer,
    secondBuffer
  );

}


function invalidCredentialsResponse() {

  return NextResponse.json(
    {
      error:
        "Broj prijave ili pristupni kod nije ispravan.",
    },
    {
      status: 400,

      headers: {
        "Cache-Control":
          "private, no-store, max-age=0",
      },
    }
  );

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
            "Samo klijent može provjeriti svoju prijavu.",
        },
        {
          status: 403,
        }
      );

    }


    let body:
      StatusRequestBody;


    try {

      body =
        await request.json() as
          StatusRequestBody;

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


    const accessCode =
      typeof body.accessCode === "string"

        ? body.accessCode
            .trim()
            .toUpperCase()

        : "";


    const reportNumberPattern =
      /^MJ-\d{8}-[A-F0-9]{6}$/;


    const accessCodePattern =
      /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;


    if (
      !reportNumberPattern.test(
        reportNumber
      ) ||
      !accessCodePattern.test(
        accessCode
      )
    ) {

      return invalidCredentialsResponse();

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

      return invalidCredentialsResponse();

    }


    const reportData =
      reportDocument.data();


    const storedAccessCodeHash =
      typeof reportData.accessCodeHash ===
      "string"

        ? reportData.accessCodeHash

        : "";


    const enteredAccessCodeHash =
      createAccessCodeHash(
        accessCode
      );


    if (
      !hashesMatch(
        storedAccessCodeHash,
        enteredAccessCodeHash
      )
    ) {

      return invalidCredentialsResponse();

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
            "Nemaš dopuštenje za pregled ove prijave.",
        },
        {
          status: 403,
        }
      );

    }


    return NextResponse.json(
      {
        report: {

          reportNumber:
            reportData.reportNumber ??
            reportNumber,

          anonymous:
            reportData.anonymous !== false,

          accused: {

            role:
              reportData.accused?.role ??
              "other",

            name:
              reportData.accused?.name ??
              "-",

          },

          category:
            reportData.category ??
            "other",

          status:
            reportData.status ??
            "submitted",

          assignmentStatus:
            reportData.assignmentStatus ??
            "assigned",

          response:
            typeof reportData.response ===
            "string"

              ? reportData.response

              : null,

          responseAt:
            toIsoString(
              reportData.responseAt
            ),

          statusChangedAt:
            toIsoString(
              reportData.statusChangedAt
            ),

          createdAt:
            toIsoString(
              reportData.createdAt
            ),

          updatedAt:
            toIsoString(
              reportData.updatedAt
            ),

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
      "Greška kod provjere sigurne prijave:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Status prijave trenutačno nije moguće provjeriti.",
      },
      {
        status: 500,
      }
    );

  }

}