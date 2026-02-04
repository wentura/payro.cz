/**
 * Next.js 16 Proxy
 *
 * Handles route protection and authentication
 * Migrated from middleware.js to proxy convention
 */

import { NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/reset-password"];

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/clients",
  "/invoices",
  "/settings",
  "/admin",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Check if user has session cookie
  const sessionCookie = request.cookies.get("payro_session");

  // Consider authenticated if session cookie exists
  const isAuthenticated = !!sessionCookie?.value;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public auth pages
  if (isAuthenticated && PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};

