import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "client" | "trainer" | "gym_owner";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Nedostaje prijava korisnika." },
      { status: 401 }
    );
  }

  let uid: string;

  try {
    const token = authorization.slice(7).trim();
    const decoded = await adminAuth.verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: "Prijava nije valjana." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    const parsed: unknown = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid body");
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Neispravni podaci." },
      { status: 400 }
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim() : "";

  const gymName =
    typeof body.gymName === "string" ? body.gymName.trim() : "";

  const role = body.role;

  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: "Unesi ispravno ime." },
      { status: 400 }
    );
  }

  if (
    role !== "client" &&
    role !== "trainer" &&
    role !== "gym_owner"
  ) {
    return NextResponse.json(
      { error: "Neispravna uloga." },
      { status: 400 }
    );
  }

  const validRole: Role = role;

  if (
    validRole === "gym_owner" &&
    (!gymName || gymName.length > 100)
  ) {
    return NextResponse.json(
      { error: "Unesi ispravan naziv teretane." },
      { status: 400 }
    );
  }

  try {
    const authUser = await adminAuth.getUser(uid);

    if (!authUser.email) {
      return NextResponse.json(
        { error: "Korisnik nema e-mail adresu." },
        { status: 400 }
      );
    }

    const gymId =
      validRole === "gym_owner" ? `gym_${uid}` : null;

    const userRef = adminDb.collection("users").doc(uid);

    const gymRef = gymId
      ? adminDb.collection("gyms").doc(gymId)
      : null;

    await adminDb.runTransaction(async (transaction) => {
      const existingUser = await transaction.get(userRef);

      if (existingUser.exists) {
        throw new Error("ACCOUNT_EXISTS");
      }

      if (gymRef) {
        const existingGym = await transaction.get(gymRef);

        if (existingGym.exists) {
          throw new Error("ACCOUNT_EXISTS");
        }
      }

      transaction.create(userRef, {
        uid,
        name,
        email: authUser.email,
        role: validRole,
        gymId,
        isPremium: false,
        subscriptionStatus: "inactive",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (gymRef) {
        transaction.create(gymRef, {
          name: gymName,
          ownerId: uid,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json(
      {
        ok: true,
        uid,
        role: validRole,
        gymId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ACCOUNT_EXISTS"
    ) {
      return NextResponse.json(
        { error: "Korisnicki profil vec postoji." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Registracija nije uspjela." },
      { status: 500 }
    );
  }
}