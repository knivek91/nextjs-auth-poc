import { NextResponse } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";

export default function proxy(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie && request.nextUrl.pathname.startsWith("/training")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessionCookie && request.nextUrl.pathname === "/") {
    const mode = request.nextUrl.searchParams.get("mode");
    if (!mode || mode === "login") {
      return NextResponse.redirect(new URL("/training", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/training/:path*"],
};
