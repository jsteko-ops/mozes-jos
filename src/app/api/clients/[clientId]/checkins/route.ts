import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ clientId: string }>;
};

function deny(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validId(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 128 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/")
  );
}

function iso(value: unknown): string | null {
  if (!value) return null;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate() as Date;
  } else if (typeof value === "string") {
    date = new Date(value);
  } else {
    return null;
  }

  return Number.isFinite(date.getTime())
    ? date.toISOString()
    : null;
}

export async function GET(
  request: Request,
  context: Context
) {
  const authorization =
    request.headers.get("authorization") ?? "";

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return deny("Prijava je potrebna.", 401);
  }

  let trainerUid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    trainerUid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  const { clientId } = await context.params;

  if (!validId(clientId)) {
    return deny("Neispravan ID klijenta.", 400);
  }

  try {
    const profileSnapshot = await adminDb
      .collection("users")
      .doc(trainerUid)
      .get();

    const profile = profileSnapshot.data();
    const gymId = str(profile?.gymId);

    if (
      !profileSnapshot.exists ||
      profile?.role !== "trainer" ||
      !validId(gymId)
    ) {
      return deny("Pristup nije dopusten.", 403);
    }

    const [
      gymSnapshot,
      trainerMemberSnapshot,
      clientSnapshot,
      clientMemberSnapshot,
    ] = await Promise.all([
      adminDb.collection("gyms").doc(gymId).get(),

      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(trainerUid)
        .get(),

      adminDb.collection("clients").doc(clientId).get(),

      adminDb
        .collection("gymMembers")
        .doc(gymId)
        .collection("members")
        .doc(clientId)
        .get(),
    ]);

    const gym = gymSnapshot.data();
    const trainerMember = trainerMemberSnapshot.data();
    const client = clientSnapshot.data();
    const clientMember = clientMemberSnapshot.data();

    const trainerRole =
      trainerMember?.gymRole ?? trainerMember?.role;

    const clientRole =
      clientMember?.gymRole ?? clientMember?.role;

    if (
      !gymSnapshot.exists ||
      !str(gym?.ownerId) ||
      !trainerMemberSnapshot.exists ||
      trainerRole !== "trainer" ||
      trainerMember?.gymId !== gymId ||
      !clientSnapshot.exists ||
      !clientMemberSnapshot.exists ||
      clientRole !== "client" ||
      client?.gymId !== gymId ||
      clientMember?.gymId !== gymId ||
      client?.trainerId !== trainerUid ||
      clientMember?.trainerId !== trainerUid
    ) {
      return deny("Check-inovi nisu dostupni.", 403);
    }

    const snapshot = await adminDb
      .collection("clients")
      .doc(clientId)
      .collection("checkins")
      .get();

    const checkins = snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        weight: data.weight ?? null,
        energy: data.energy ?? null,
        sleep: data.sleep ?? null,
        hunger: data.hunger ?? null,
        water: str(data.water),
        comment: str(data.comment),
        photos: Array.isArray(data.photos)
          ? data.photos.filter(
              (photo: unknown) => typeof photo === "string"
            )
          : [],
        reviewed: data.reviewed === true,
        trainerComment: str(data.trainerComment),
        clientReply: str(data.clientReply),
        createdAt: iso(data.createdAt),
        updatedAt: iso(data.updatedAt),
        reviewedAt: iso(data.reviewedAt),
        trainerCommentAt: iso(data.trainerCommentAt),
      };
    });

    checkins.sort(
      (a, b) =>
        Date.parse(b.createdAt ?? "") -
        Date.parse(a.createdAt ?? "") || 0
    );

    return NextResponse.json(
      { clientId, checkins },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Greska pri dohvatu check-inova:", error);

    return deny(
      "Check-inove trenutno nije moguce ucitati.",
      500
    );
  }
}

class CreateCheckinError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "CreateCheckinError";
  }
}

function validScore(value: unknown): string | null {
  if (
    typeof value === "string" &&
    /^[1-5]$/.test(value)
  ) {
    return value;
  }

  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  ) {
    return String(value);
  }

  return null;
}

export async function POST(
  request: Request,
  context: Context
) {
  const authorization =
    request.headers.get("authorization") ?? "";

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return deny("Prijava je potrebna.", 401);
  }

  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(
      token,
      true
    );
    uid = decoded.uid;
  } catch {
    return deny("Prijava nije valjana.", 401);
  }

  const { clientId } = await context.params;

  if (!validId(clientId)) {
    return deny("Neispravan ID klijenta.", 400);
  }

  let body: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (raw.length > 4096) {
      return deny("Zahtjev je prevelik.", 413);
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return deny("Neispravan zahtjev.", 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return deny("Neispravan JSON.", 400);
  }

  const weight = body.weight;
  const energy = validScore(body.energy);
  const sleep = validScore(body.sleep);
  const hunger = validScore(body.hunger);

  if (
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight < 20 ||
    weight > 400
  ) {
    return deny(
      "Tezina mora biti izmedu 20 i 400 kg.",
      400
    );
  }

  if (!energy || !sleep || !hunger) {
    return deny(
      "Energija, san i glad moraju biti od 1 do 5.",
      400
    );
  }

  if (
    typeof body.water !== "string" ||
    body.water.length > 60 ||
    typeof body.comment !== "string" ||
    body.comment.length > 2000
  ) {
    return deny(
      "Neispravan unos vode ili komentara.",
      400
    );
  }

  const water = body.water.trim();
  const comment = body.comment.trim();

  try {
    const result = await adminDb.runTransaction(
      async (transaction) => {
        const userRef = adminDb
          .collection("users")
          .doc(uid);

        const clientRef = adminDb
          .collection("clients")
          .doc(clientId);

        const [userSnapshot, clientSnapshot] =
          await Promise.all([
            transaction.get(userRef),
            transaction.get(clientRef),
          ]);

        if (!userSnapshot.exists) {
          throw new CreateCheckinError(
            403,
            "Pristup nije dopusten."
          );
        }

        if (!clientSnapshot.exists) {
          throw new CreateCheckinError(
            404,
            "Klijent nije pronaden."
          );
        }

        const userData = userSnapshot.data();
        const clientData = clientSnapshot.data();

        const role = str(userData?.role);
        const userGymId = str(userData?.gymId);
        const gymId = str(clientData?.gymId);
        const trainerId = str(clientData?.trainerId);

        if (
          !validId(gymId) ||
          (trainerId && !validId(trainerId))
        ) {
          throw new CreateCheckinError(
            403,
            "Neispravna povezanost s teretanom."
          );
        }

        const gymRef = adminDb
          .collection("gyms")
          .doc(gymId);

        const clientMemberRef = adminDb
          .collection("gymMembers")
          .doc(gymId)
          .collection("members")
          .doc(clientId);

        const actorMemberRef = adminDb
          .collection("gymMembers")
          .doc(gymId)
          .collection("members")
          .doc(uid);

        const assignedTrainerRef = trainerId
          ? adminDb
              .collection("gymMembers")
              .doc(gymId)
              .collection("members")
              .doc(trainerId)
          : null;

        const [
          gymSnapshot,
          clientMemberSnapshot,
          actorMemberSnapshot,
          assignedTrainerSnapshot,
        ] = await Promise.all([
          transaction.get(gymRef),
          transaction.get(clientMemberRef),
          transaction.get(actorMemberRef),
          assignedTrainerRef
            ? transaction.get(assignedTrainerRef)
            : Promise.resolve(null),
        ]);

        const gymData = gymSnapshot.data();
        const clientMember = clientMemberSnapshot.data();
        const actorMember = actorMemberSnapshot.data();
        const assignedTrainer =
          assignedTrainerSnapshot?.data();

        if (
          !gymSnapshot.exists ||
          !str(gymData?.ownerId) ||
          !clientMemberSnapshot.exists ||
          (clientMember?.gymRole ??
            clientMember?.role) !== "client" ||
          clientMember?.gymId !== gymId ||
          str(clientMember?.trainerId) !== trainerId
        ) {
          throw new CreateCheckinError(
            403,
            "Klijent nije dostupan."
          );
        }

        const isSelf =
          role === "client" &&
          uid === clientId &&
          (!userGymId || userGymId === gymId);

        const isTrainer =
          role === "trainer" &&
          userGymId === gymId &&
          trainerId === uid &&
          actorMemberSnapshot.exists &&
          (actorMember?.gymRole ??
            actorMember?.role) === "trainer" &&
          actorMember?.gymId === gymId;

        const isOwner =
          role === "gym_owner" &&
          userGymId === gymId &&
          gymData?.ownerId === uid;

        if (!isSelf && !isTrainer && !isOwner) {
          throw new CreateCheckinError(
            403,
            "Nemate dopustenje za unos."
          );
        }

        if (
          trainerId &&
          (
            !assignedTrainerSnapshot?.exists ||
            (assignedTrainer?.gymRole ??
              assignedTrainer?.role) !== "trainer" ||
            assignedTrainer?.gymId !== gymId
          )
        ) {
          throw new CreateCheckinError(
            409,
            "Dodjela trenera nije dosljedna."
          );
        }

        const checkinRef = clientRef
          .collection("checkins")
          .doc();

        transaction.set(checkinRef, {
          weight,
          energy,
          sleep,
          hunger,
          water,
          comment,
          reviewed: false,
          createdAt: FieldValue.serverTimestamp(),
        });

        if (trainerId) {
          const notificationRef = adminDb
            .collection("notifications")
            .doc();

          const clientName =
            str(clientData?.name).slice(0, 100) ||
            "Klijent";

          transaction.set(notificationRef, {
            userId: trainerId,
            title: "Novi check-in",
            message:
              `${clientName} je poslao novi check-in.`,
            type: "checkin",
            link:
              `/dashboard/trainer/klijenti/${encodeURIComponent(clientId)}?tab=checkin&checkinId=${checkinRef.id}`,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        return {
          checkinId: checkinRef.id,
          notified: Boolean(trainerId),
        };
      }
    );

    return NextResponse.json(
      {
        success: true,
        clientId,
        checkinId: result.checkinId,
        notified: result.notified,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof CreateCheckinError) {
      return deny(error.message, error.status);
    }

    console.error(
      "Greska pri stvaranju check-ina:",
      error
    );

    return deny(
      "Check-in trenutno nije moguce spremiti.",
      500
    );
  }
}
