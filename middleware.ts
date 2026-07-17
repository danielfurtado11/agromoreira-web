import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_HOME, LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth";

/**
 * Gate for the private admin area.
 *
 * This only checks that a session cookie is *present* — it does not verify the
 * JWT (the signing secret belongs to the API, not to this app). That is fine:
 * this redirect is about user experience, and the real gate is the API, which
 * rejects any request without a valid token. A forged or expired cookie gets
 * you the login screen again, never data.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && pathname !== LOGIN_PATH) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // Already signed in: no point in showing the login form again.
  if (hasSession && pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
