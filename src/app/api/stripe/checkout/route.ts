import { NextResponse } from "next/server";

export async function POST() {
  console.log("API HIT");

  return NextResponse.json({
    url: "test-ok",
  });
}