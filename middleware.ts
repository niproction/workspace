import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SessionData } from "./lib/session";
import { sessionOptions } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  const isLoggedIn = session.isLoggedIn && !!session.adminId;
  const isSetupRoute = pathname === "/admin/setup";
  const isLoginRoute = pathname === "/admin/login";

  // Setup route: only accessible when NO admin exists
  if (isSetupRoute) {
    // We can't check DB in middleware easily (edge runtime), so we allow
    // through and let the page/API do the guard. Middleware only handles
    // session-based redirects here.
    return NextResponse.next();
  }

  // Login route: if already logged in, redirect to dashboard
  if (isLoginRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes: require login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
