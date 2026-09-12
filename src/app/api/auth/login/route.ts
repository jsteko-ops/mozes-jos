import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const idToken =
      typeof body?.idToken === "string"
        ? body.idToken
        : "";

    if (!idToken) {
      return NextResponse.json(
        {
          error: "Nedostaje Firebase ID token.",
        },
        {
          status: 400,
        }
      );
    }

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const response =
      NextResponse.json({
        ok: true,
        userId: decodedToken.uid,
      });

    response.cookies.set(
      "userId",
      decodedToken.uid,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Session login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Neispravna ili istekla prijava.",
      },
      {
        status: 401,
      }
    );
  }
}