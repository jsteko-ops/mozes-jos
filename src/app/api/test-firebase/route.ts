import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    await adminDb.collection("test").doc("ping").set({
      ok: true,
      time: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Firebase failed",
      },
      {
        status: 500,
      }
    );
  }
}