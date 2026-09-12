import { NextResponse } from "next/server";

export async function POST() {
  const response =
    NextResponse.json({
      ok: true,
    });

  response.cookies.delete(
    "userId"
  );

  // Stari cookie ostavljamo očišćen
  // zbog postojećih lokalnih sesija.
  response.cookies.delete(
    "user"
  );

  return response;
}