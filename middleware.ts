import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // ❌ ako nije login i nema usera → redirect
  if (isDashboard && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ ako je login i već logiran → dashboard
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// gdje middleware radi
export const config = {
  matcher: ["/dashboard/:path*", "/login"]
};