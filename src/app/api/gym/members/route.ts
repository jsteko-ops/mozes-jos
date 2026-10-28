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


type MemberRole =
  | "trainer"
  | "client";


type MemberBody = {

  email?: unknown;

  role?: unknown;

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


    const ownerReference =
      adminDb
        .collection("users")
        .doc(decodedToken.uid);


    const ownerSnapshot =
      await ownerReference.get();


    if (!ownerSnapshot.exists) {

      return NextResponse.json(
        {
          error:
            "KorisniĂ„Ĺ¤ki profil nije pronaĂ„â€en.",
        },
        {
          status: 404,
        }
      );

    }


    const ownerData =
      ownerSnapshot.data();


    if (
      ownerData?.role !== "gym_owner"
    ) {

      return NextResponse.json(
        {
          error:
            "Samo vlasnik teretane moÄąÄľe dodavati Ă„Ĺ¤lanove.",
        },
        {
          status: 403,
        }
      );

    }


    const gymId =
      typeof ownerData.gymId === "string"

        ? ownerData.gymId.trim()

        : "";


    if (!gymId) {

      return NextResponse.json(
        {
          error:
            "Vlasnik nije povezan s teretanom.",
        },
        {
          status: 400,
        }
      );

    }


    const gymReference =
      adminDb
        .collection("gyms")
        .doc(gymId);


    const gymSnapshot =
      await gymReference.get();


    if (
      !gymSnapshot.exists ||
      gymSnapshot.data()?.ownerId !==
        decodedToken.uid
    ) {

      return NextResponse.json(
        {
          error:
            "NemaÄąË‡ pravo upravljati ovom teretanom.",
        },
        {
          status: 403,
        }
      );

    }


    let body:
      MemberBody;


    try {

      body =
        await request.json() as
          MemberBody;

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


    const email =
      typeof body.email === "string"

        ? body.email
            .trim()
            .toLowerCase()

        : "";


    const role =
      body.role === "trainer" ||
      body.role === "client"

        ? body.role

        : null;


    if (!email) {

      return NextResponse.json(
        {
          error:
            "UpiÄąË‡i e-mail korisnika.",
        },
        {
          status: 400,
        }
      );

    }


    if (!role) {

      return NextResponse.json(
        {
          error:
            "Uloga Ă„Ĺ¤lana nije ispravna.",
        },
        {
          status: 400,
        }
      );

    }


    let authUser;


    try {

      authUser =
        await adminAuth.getUserByEmail(
          email
        );

    } catch {

      return NextResponse.json(
        {
          error:
            "Korisnik s tim e-mailom nije pronaĂ„â€en.",
        },
        {
          status: 404,
        }
      );

    }


    const memberUserReference =
      adminDb
        .collection("users")
        .doc(authUser.uid);


    const memberUserSnapshot =
      await memberUserReference.get();


    if (!memberUserSnapshot.exists) {

      return NextResponse.json(
        {
          error:
            "KorisniĂ„Ĺ¤ki profil nije pronaĂ„â€en.",
        },
        {
          status: 404,
        }
      );

    }


    const memberUserData =
      memberUserSnapshot.data();


    if (
      memberUserData?.role !== role
    ) {

      return NextResponse.json(
        {
          error:
            role === "trainer"

              ? "Odabrani korisnik nije trener."

              : "Odabrani korisnik nije klijent.",
        },
        {
          status: 400,
        }
      );

    }


    const currentGymId =
      typeof memberUserData.gymId ===
        "string"

        ? memberUserData.gymId.trim()

        : "";


    if (
      currentGymId &&
      currentGymId !== gymId
    ) {

      return NextResponse.json(
        {
          error:
            "Korisnik je veĂ„â€ˇ povezan s drugom teretanom.",
        },
        {
          status: 409,
        }
      );

    }


    const memberReference =
      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(authUser.uid);


    const memberSnapshot =
      await memberReference.get();


    const memberName =
      typeof memberUserData.name ===
        "string" &&
      memberUserData.name.trim()

        ? memberUserData.name.trim()

        : authUser.displayName ||
          authUser.email ||
          "Korisnik";


    const memberData: Record<
      string,
      unknown
    > = {

      uid:
        authUser.uid,

      role,

      name:
        memberName,

      email:
        authUser.email || email,

      gymId,

      addedBy:
        decodedToken.uid,

      updatedAt:
        FieldValue.serverTimestamp(),

    };


    if (!memberSnapshot.exists) {

      memberData.createdAt =
        FieldValue.serverTimestamp();

    }


    const batch =
      adminDb.batch();


    batch.set(
      memberReference,
      memberData,
      {
        merge: true,
      }
    );


    batch.set(
      memberUserReference,
      {
        gymId,

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );


    
if (role === "client") {
  const clientReference =
    adminDb
      .collection("clients")
      .doc(authUser.uid);

  batch.set(
    clientReference,
    {
      uid:
        authUser.uid,

      authUid:
        authUser.uid,

      name:
        memberName,

      email:
        authUser.email || email,

      phone:
        typeof memberUserData.phone === "string"
          ? memberUserData.phone
          : null,

      ...(typeof memberUserData.trainerId === "string" &&
      memberUserData.trainerId.trim()
        ? {
            trainerId:
              memberUserData.trainerId.trim(),
          }
        : {}),

      role:
        "client",

      gymId,

      updatedAt:
        FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}


await batch.commit();


    return NextResponse.json(
      {
        ok: true,

        member: {

          uid:
            authUser.uid,

          name:
            memberName,

          email:
            authUser.email || email,

          role,

          gymId,

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
      "GreÄąË‡ka kod dodavanja Ă„Ĺ¤lana teretane:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Ă„Ĺšlana trenutaĂ„Ĺ¤no nije moguĂ„â€ˇe dodati.",
      },
      {
        status: 500,
      }
    );

  }

}

// Sigurno dohvacanje clanova vlastite teretane
export async function GET(request: Request) {
  const deny = (status: number, message: string) =>
    NextResponse.json(
      { error: message },
      {
        status,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );

  try {
    const token = getToken(request);

    if (!token) {
      return deny(401, "Prijava je potrebna.");
    }

    let uid: string;

    try {
      const decoded = await adminAuth.verifyIdToken(
        token,
        true
      );
      uid = decoded.uid;
    } catch {
      return deny(401, "Nevaljana prijava.");
    }

    const profileSnap = await adminDb
      .collection("users")
      .doc(uid)
      .get();

    const profile = profileSnap.data();

    if (!profile) {
      return deny(403, "Korisnicki profil nije valjan.");
    }

    const role = profile.role;

    const gymId =
      typeof profile.gymId === "string"
        ? profile.gymId.trim()
        : "";

    if (
      !gymId ||
      (role !== "gym_owner" && role !== "gym_staff")
    ) {
      return deny(403, "Nemate dozvolu.");
    }

    const gymSnap = await adminDb
      .collection("gyms")
      .doc(gymId)
      .get();

    if (!gymSnap.exists) {
      return deny(403, "Teretana nije pronadena.");
    }

    if (role === "gym_owner") {
      if (gymSnap.data()?.ownerId !== uid) {
        return deny(403, "Niste vlasnik teretane.");
      }
    } else {
      const staffSnap = await adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(uid)
        .get();

      const staff = staffSnap.data();

      if (
        !staffSnap.exists ||
        staff?.role !== "gym_staff" ||
        staff?.gymId !== gymId
      ) {
        return deny(403, "Nemate dozvolu recepcije.");
      }
    }

    const memberDocs = await adminDb
      .collection("gymMembers")
      .doc(gymId)
      .collection("members")
      .get();

    function dateForMembersApi(value: unknown): string | null {
      if (value == null) return null;

      let date: Date;

      if (value instanceof Date) {
        date = value;
      } else if (
        typeof value === "string" ||
        typeof value === "number"
      ) {
        date = new Date(value);
      } else if (
        typeof value === "object" &&
        "toDate" in value &&
        typeof value.toDate === "function"
      ) {
        date = value.toDate();
      } else {
        return null;
      }

      return Number.isNaN(date.getTime())
        ? null
        : date.toISOString();
    }

    const resolved = await Promise.all(
      memberDocs.docs.map(async (memberDoc) => {
        const membership = memberDoc.data();
        const memberRole = membership.role;

        if (
          membership.gymId !== gymId ||
          ![
            "gym_owner",
            "gym_staff",
            "trainer",
            "client",
          ].includes(memberRole)
        ) {
          return null;
        }

        const isClient = memberRole === "client";

        const profileRef = adminDb
          .collection(isClient ? "clients" : "users")
          .doc(memberDoc.id);

        const memberProfileSnap = await profileRef.get();
        const memberProfile = memberProfileSnap.data();

        if (
          !memberProfile ||
          memberProfile.gymId !== gymId
        ) {
          return null;
        }

        if (
          !isClient &&
          memberProfile.role !== memberRole
        ) {
          return null;
        }

        if (
          memberRole === "gym_owner" &&
          gymSnap.data()?.ownerId !== memberDoc.id
        ) {
          return null;
        }

        const name =
          typeof memberProfile.name === "string"
            ? memberProfile.name
            : "";

        const email =
          typeof memberProfile.email === "string"
            ? memberProfile.email
            : "";

        return {
          uid: memberDoc.id,
          name,
          displayName:
            typeof memberProfile.displayName === "string" &&
            memberProfile.displayName.trim()
              ? memberProfile.displayName.trim()
              : name,
          email,
          ...(isClient
            ? {
                phone:
                  typeof memberProfile.phone === "string"
                    ? memberProfile.phone
                    : "",
                trainerId:
                  typeof memberProfile.trainerId === "string"
                    ? memberProfile.trainerId
                    : null,
              }
            : {}),
          ...(isClient
            ? {
                membershipStatus:
                  typeof memberProfile.membershipStatus === "string"
                    ? memberProfile.membershipStatus
                    : null,
                membershipState:
                  typeof memberProfile.membershipState === "string"
                    ? memberProfile.membershipState
                    : null,
                membershipValidFrom:
                  dateForMembersApi(
                    memberProfile.membershipValidFrom
                  ),
                membershipValidUntil:
                  dateForMembersApi(
                    memberProfile.membershipValidUntil
                  ),
                membershipAmount:
                  typeof memberProfile.membershipAmount === "number" &&
                  Number.isFinite(memberProfile.membershipAmount)
                    ? memberProfile.membershipAmount
                    : null,
                membershipPlan:
                  typeof memberProfile.membershipPlan === "string"
                    ? memberProfile.membershipPlan
                    : null,
              }
            : {}),
          gymRole: memberRole,
          gymId,
        };
      })
    );

    const members = resolved.filter(
      (member) => member !== null
    );

    return NextResponse.json(
      {
        ok: true,
        gymId,
        members,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Greska pri dohvacanju clanova:", error);

    return deny(
      500,
      "Clanove trenutaĂ„Ĺ¤no nije moguce dohvatiti."
    );
  }
}