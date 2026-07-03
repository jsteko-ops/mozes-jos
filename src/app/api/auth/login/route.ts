import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { userId } = await req.json();

  (await cookies()).set("user", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return Response.json({ ok: true });
}