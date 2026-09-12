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


type RequestBody = {
  clientId?: unknown;
  title?: unknown;
  message?: unknown;
  link?: unknown;
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


    const trainerSnapshot =
      await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();

    if (!trainerSnapshot.exists) {
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


    const trainerData =
      trainerSnapshot.data();

    if (
      trainerData?.role !== "trainer"
    ) {
      return NextResponse.json(
        {
          error:
            "Samo trener može slati ovu obavijest.",
        },
        {
          status: 403,
        }
      );
    }


    const body =
      (await request.json()) as RequestBody;


    const clientId =
      typeof body.clientId === "string"
        ? body.clientId.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const link =
      typeof body.link === "string"
        ? body.link.trim()
        : "";


    if (
      !clientId ||
      !title ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Nedostaju podaci za obavijest.",
        },
        {
          status: 400,
        }
      );
    }


    const clientReference =
      adminDb
        .collection("clients")
        .doc(clientId);

    const clientSnapshot =
      await clientReference.get();


    if (!clientSnapshot.exists) {
      return NextResponse.json(
        {
          error:
            "Klijent nije pronađen.",
        },
        {
          status: 404,
        }
      );
    }


    const clientData =
      clientSnapshot.data();


    const trainerId =
      typeof clientData?.trainerId ===
      "string"
        ? clientData.trainerId.trim()
        : "";


    if (
      !trainerId ||
      trainerId !== decodedToken.uid
    ) {
      return NextResponse.json(
        {
          error:
            "Klijent nije dodijeljen prijavljenom treneru.",
        },
        {
          status: 403,
        }
      );
    }


    let targetUserId = "";


    const directUserSnapshot =
      await adminDb
        .collection("users")
        .doc(clientId)
        .get();


    if (directUserSnapshot.exists) {
      targetUserId =
        clientId;
    }


    if (
      !targetUserId &&
      typeof clientData?.authUid ===
        "string" &&
      clientData.authUid.trim()
    ) {
      targetUserId =
        clientData.authUid.trim();
    }


    if (
      !targetUserId &&
      typeof clientData?.uid ===
        "string" &&
      clientData.uid.trim()
    ) {
      targetUserId =
        clientData.uid.trim();
    }


    if (
      !targetUserId &&
      typeof clientData?.email ===
        "string" &&
      clientData.email.trim()
    ) {
      try {
        const authUser =
          await adminAuth.getUserByEmail(
            clientData.email.trim()
          );

        targetUserId =
          authUser.uid;
      } catch {
        // Nema Auth korisnika za taj email.
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        {
          error:
            "Nije pronađen korisnički račun klijenta.",
        },
        {
          status: 404,
        }
      );
    }


    await adminDb
      .collection("notifications")
      .add({
        userId:
          targetUserId,

        title,

        message,

        type:
          "nutrition",

        link:
          link || null,

        read:
          false,

        createdAt:
          FieldValue.serverTimestamp(),
      });


    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Greška kod server obavijesti prehrane:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Obavijest nije moguće poslati.",
      },
      {
        status: 500,
      }
    );
  }
}