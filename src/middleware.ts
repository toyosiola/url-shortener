import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import server_env from "@/utils/env.server";

const AUTH_PAGES = ["/", "/signin", "/signup"];
const DASHBOARD_PAGE = "/dashboard";
const SESSION_COOKIE = "session";
const JWT_SECRET = server_env.JWT_SECRET;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface SessionUser {
  user_id: string;
  iat: number;
  exp: number;
}

async function verifySession(
  sessionToken: string,
): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(sessionToken, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

function refreshSessionCookie(response: NextResponse, sessionToken: string) {
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const proceedResponse = NextResponse.next();

  // Verify session
  const user = sessionToken ? await verifySession(sessionToken) : null;

  // Dashboard page logic
  if (pathname === DASHBOARD_PAGE) {
    if (!user) {
      // No valid session, redirect to signin
      const response = NextResponse.redirect(new URL("/signin", request.url));
      // delete invalid session token if it exists
      if (sessionToken) response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Valid session, refresh cookie and allow access
    refreshSessionCookie(proceedResponse, sessionToken!);
    return proceedResponse;
  }

  // Auth pages logic (/, /signin, /signup)
  if (AUTH_PAGES.includes(pathname)) {
    if (user) {
      // Valid session, redirect to dashboard
      const response = NextResponse.redirect(
        new URL(DASHBOARD_PAGE, request.url),
      );
      refreshSessionCookie(response, sessionToken!);
      return response;
    }

    // No valid session, allow access to auth pages
    return proceedResponse;
  }

  // Not expected to reach this point. All routes covered by the middleware already handled
  // For any other routes, just refresh session if valid
  if (user) {
    refreshSessionCookie(proceedResponse, sessionToken!);
  }

  return proceedResponse;
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/dashboard"],
};
