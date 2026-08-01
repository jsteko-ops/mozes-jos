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


type ReportStatus =
  | "submitted"
  | "pending_admin"
  | "in_review"
  | "resolved"
  | "closed";


type AllowedNewStatus =
  | "in_review"
  | "resolved"
  | "closed";


type UpdateReportBody = {

  status?: unknown;

  response?: unknown;

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


function isAllowedNewStatus(
  value: unknown
): value is AllowedNewStatus {

  return (
    value === "in_review" ||
    value === "resolved" ||
    value === "closed"
  );

}


function isCurrentStatus(
  value: unknown
): value is ReportStatus {

  return (
    value === "submitted" ||
    value === "pending_admin" ||
    value === "in_review" ||
    value === "resolved" ||
    value === "closed"
  );

}


function canChangeStatus(
  currentStatus: ReportStatus,
  newStatus: AllowedNewStatus
) {

  if (currentStatus === newStatus) {

    return true;

  }


  switch (currentStatus) {

    case "submitted":

      return (
        newStatus === "in_review" ||
        newStatus === "resolved" ||
        newStatus === "closed"
      );


    case "pending_admin":

      return (
        newStatus === "in_review" ||
        newStatus === "resolved" ||
        newStatus === "closed"
      );


    case "in_review":

      return (
        newStatus === "resolved" ||
        newStatus === "closed"
      );


    case "resolved":

      return (
        newStatus === "in_review" ||
        newStatus === "closed"
      );


    case "closed":

      return newStatus === "in_review";


    default:

      return false;

  }

}


export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      reportId: string;
    }>;
  }
) {

  try {

    const {
      reportId,
    } = await context.params;


    if (
      !reportId ||
      reportId.includes("/") ||
      reportId.length > 200
    ) {

      return NextResponse.json(
        {
          error:
            "Neispravan ID prijave.",
        },
        {
          status: 400,
        }
      );

    }


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


    const userReference =
      adminDb
        .collection("users")
        .doc(decodedToken.uid);


    const userSnapshot =
      await userReference.get();


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


    const userRole =
      userData?.role;


    if (
      userRole !== "gym_owner" &&
      userRole !== "admin"
    ) {

      return NextResponse.json(
        {
          error:
            "Nemaš dopuštenje za obradu prijave.",
        },
        {
          status: 403,
        }
      );

    }


    const reportReference =
      adminDb
        .collection("safeReports")
        .doc(reportId);


    const reportSnapshot =
      await reportReference.get();


    if (!reportSnapshot.exists) {

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


    const reportData =
      reportSnapshot.data();


    const ownerHasAccess =
      userRole === "gym_owner" &&
      reportData?.recipientUid === decodedToken.uid &&
      reportData?.gymId === userData?.gymId &&
      reportData?.accused?.role !== "gym_owner";


    const adminHasAccess =
      userRole === "admin" &&
      reportData?.recipientRole === "admin" &&
      (
        reportData?.recipientUid === null ||
        reportData?.recipientUid === undefined ||
        reportData?.recipientUid === decodedToken.uid
      );


    if (
      !ownerHasAccess &&
      !adminHasAccess
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


    const body =
      await request.json() as
        UpdateReportBody;


    const hasStatus =
      body.status !== undefined;


    const hasResponse =
      body.response !== undefined;


    if (
      !hasStatus &&
      !hasResponse
    ) {

      return NextResponse.json(
        {
          error:
            "Nema podataka za spremanje.",
        },
        {
          status: 400,
        }
      );

    }


    let newStatus:
      AllowedNewStatus | null =
        null;


    if (hasStatus) {

      if (
        !isAllowedNewStatus(
          body.status
        )
      ) {

        return NextResponse.json(
          {
            error:
              "Odabrani status nije dopušten.",
          },
          {
            status: 400,
          }
        );

      }


      newStatus =
        body.status;

    }


    let responseText:
      string | null =
        null;


    if (hasResponse) {

      if (
        typeof body.response !== "string"
      ) {

        return NextResponse.json(
          {
            error:
              "Odgovor nije ispravan.",
          },
          {
            status: 400,
          }
        );

      }


      responseText =
        body.response.trim();


      if (
        responseText.length < 2 ||
        responseText.length > 3000
      ) {

        return NextResponse.json(
          {
            error:
              "Odgovor mora imati između 2 i 3000 znakova.",
          },
          {
            status: 400,
          }
        );

      }

    }


    const currentStatus =
      isCurrentStatus(
        reportData?.status
      )

        ? reportData.status

        : "submitted";


    if (
      newStatus &&
      !canChangeStatus(
        currentStatus,
        newStatus
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Ova promjena statusa nije dopuštena.",
        },
        {
          status: 400,
        }
      );

    }


    const updateData:
      Record<string, unknown> = {

        updatedAt:
          FieldValue.serverTimestamp(),

      };


    if (newStatus) {

      updateData.status =
        newStatus;


      updateData.statusChangedAt =
        FieldValue.serverTimestamp();


      updateData.statusChangedByUid =
        decodedToken.uid;


      updateData.statusChangedByRole =
        userRole;

    }


    if (responseText) {

      updateData.response =
        responseText;


      updateData.responseAt =
        FieldValue.serverTimestamp();


      updateData.respondedByUid =
        decodedToken.uid;


      updateData.respondedByRole =
        userRole;

    }


    if (
      userRole === "admin" &&
      (
        reportData?.recipientUid === null ||
        reportData?.recipientUid === undefined
      )
    ) {

      updateData.recipientUid =
        decodedToken.uid;


      updateData.assignmentStatus =
        "assigned";


      updateData.assignedAt =
        FieldValue.serverTimestamp();

    }


    const activityReference =
      reportReference
        .collection("activity")
        .doc();


    const batch =
      adminDb.batch();


    batch.update(
      reportReference,
      updateData
    );


    batch.set(

      activityReference,

      {
        type:
          responseText && newStatus

            ? "response_and_status"

            : responseText

              ? "response"

              : "status_change",

        previousStatus:
          currentStatus,

        newStatus:
          newStatus || currentStatus,

        hasResponse:
          Boolean(responseText),

        actorUid:
          decodedToken.uid,

        actorRole:
          userRole,

        createdAt:
          FieldValue.serverTimestamp(),
      }

    );


    await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        status:
          newStatus || currentStatus,

        response:
          responseText,
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
      "Greška kod obrade sigurne prijave:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Promjene trenutačno nije moguće spremiti.",
      },
      {
        status: 500,
      }
    );

  }

}