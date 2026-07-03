import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("user");

  return Response.json({ ok: true });
}