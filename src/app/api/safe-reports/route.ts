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


type AccusedRole =
  | "trainer"
  | "gym_owner"
  | "staff"
  | "other";


type ReportCategory =
  | "inappropriate_comments"
  | "sexual_harassment"
  | "unwanted_touching"
  | "threats"
  | "discrimination"
  | "violence"
  | "privacy"
  | "unsafe_behavior"
  | "other";


type SafeReportBody = {

  anonymous: boolean;

  accusedRole: AccusedRole;

  accusedName: string;

  category: ReportCategory;

  description: string;

  occurredAt?: string;

  location?: string;

};


function isAccusedRole(
  value: unknown
): value is AccusedRole {

  return (
    value === "trainer" ||
    value === "gym_owner" ||
    value === "staff" ||
    value === "other"
  );

}


function isReportCategory(
  value: unknown
): value is ReportCategory {

  return (
    value === "inappropriate_comments" ||
    value === "sexual_harassment" ||
    value === "unwanted_touching" ||
    value === "threats" ||
    value === "discrimination" ||
    value === "violence" ||
    value === "privacy" ||
    value === "unsafe_behavior" ||
    value === "other"
  );

}


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


function createReportNumber() {

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");


  const random =
    randomBytes(3)
      .toString("hex")
      .toUpperCase();


  return `MJ-${date}-${random}`;

}


function createAccessCode() {

  const value =
    randomBytes(6)
      .toString("hex")
      .toUpperCase();


  return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;

}


async function findRecipient(
  gymId: string,
  accusedRole: AccusedRole
) {

  if (accusedRole === "gym_owner") {

    const adminSnapshot =
      await adminDb
        .collection("users")
        .where(
          "role",
          "==",
          "admin"
        )
        .limit(1)
        .get();


    const adminDocument =
      adminSnapshot.docs[0];


   if (!adminDocument) {

  return {
    uid: null,
    role: "admin" as const,
  };

}


    return {
      uid:
        adminDocument.id,

      role:
        "admin",
    };

  }


  const ownerSnapshot =
    await adminDb
      .collection("users")
      .where(
        "gymId",
        "==",
        gymId
      )
      .where(
        "role",
        "==",
        "gym_owner"
      )
      .limit(1)
      .get();


  const ownerDocument =
    ownerSnapshot.docs[0];


  if (!ownerDocument) {

    return null;

  }


  return {
    uid:
      ownerDocument.id,

    role:
      "gym_owner",
  };

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


    if (userData?.role !== "client") {

      return NextResponse.json(
        {
          error:
            "Samo klijent može poslati ovu prijavu.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof userData.gymId === "string"
        ? userData.gymId
        : "";


    if (!gymId) {

      return NextResponse.json(
        {
          error:
            "Klijent nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );

    }


    const body =
      await request.json() as
        Partial<SafeReportBody>;


    const accusedName =
      typeof body.accusedName === "string"
        ? body.accusedName.trim()
        : "";


    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";


    const occurredAt =
      typeof body.occurredAt === "string"
        ? body.occurredAt.trim()
        : "";


    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";


    if (!isAccusedRole(body.accusedRole)) {

      return NextResponse.json(
        {
          error:
            "Odaberi na koga se prijava odnosi.",
        },
        {
          status: 400,
        }
      );

    }


    if (!isReportCategory(body.category)) {

      return NextResponse.json(
        {
          error:
            "Odaberi vrstu neprimjerenog ponašanja.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      accusedName.length < 2 ||
      accusedName.length > 120
    ) {

      return NextResponse.json(
        {
          error:
            "Upiši ime ili opis osobe.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      description.length < 20 ||
      description.length > 5000
    ) {

      return NextResponse.json(
        {
          error:
            "Opis mora imati između 20 i 5000 znakova.",
        },
        {
          status: 400,
        }
      );

    }


    if (location.length > 200) {

      return NextResponse.json(
        {
          error:
            "Mjesto događaja je predugo.",
        },
        {
          status: 400,
        }
      );

    }


    const recipient =
      await findRecipient(
        gymId,
        body.accusedRole
      );


    if (!recipient) {

      return NextResponse.json(
        {
          error:
            "Nije pronađena ovlaštena osoba koja treba primiti prijavu.",
        },
        {
          status: 503,
        }
      );

    }


    const anonymous =
      body.anonymous !== false;


    const reportNumber =
      createReportNumber();


    const accessCode =
      createAccessCode();


    const accessCodeHash =
      createHash("sha256")
        .update(accessCode)
        .digest("hex");


    const reporterName =
      typeof userData.name === "string"
        ? userData.name
        : [
            userData.firstName,
            userData.lastName,
          ]
            .filter(Boolean)
            .join(" ") || "Klijent";


    const reporterEmail =
      decodedToken.email ||
      userData.email ||
      null;


    const reportReference =
      adminDb
        .collection("safeReports")
        .doc();


    const privateReference =
      reportReference
        .collection("private")
        .doc("reporter");


    const batch =
      adminDb.batch();


    batch.set(

      reportReference,

      {
        reportNumber,

        gymId,

        recipientUid:
          recipient.uid,

        recipientRole:
          recipient.role,

        anonymous,

        reporter:
          anonymous
            ? null
            : {
                name:
                  reporterName,

                email:
                  reporterEmail,
              },

        accused: {
          role:
            body.accusedRole,

          name:
            accusedName,
        },

        category:
          body.category,

        description,

        occurredAt:
          occurredAt || null,

        location:
          location || null,

        status:
  recipient.uid
    ? "submitted"
    : "pending_admin",

assignmentStatus:
  recipient.uid
    ? "assigned"
    : "unassigned",

        accessCodeHash,

        createdAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      }

    );


    batch.set(

      privateReference,

      {
        reporterUid:
          decodedToken.uid,

        reporterEmail,

        trainerId:
          userData.trainerId || null,

        createdAt:
          FieldValue.serverTimestamp(),
      }

    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        reportId:
          reportReference.id,

        reportNumber,

        accessCode,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Greška kod slanja sigurne prijave:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Prijavu trenutačno nije moguće poslati.",
      },
      {
        status: 500,
      }
    );

  }

}