/**
 * Next.js Middleware
 *
 * Handles route protection and authentication
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

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if user has session cookie
  const sessionCookie = request.cookies.get("payro_session");

  // Only consider authenticated if cookie exists AND looks valid (starts with "{")
  // This prevents bad JWT cookies from being treated as valid sessions
  let isAuthenticated = false;
  if (sessionCookie && sessionCookie.value) {
    try {
      // Quick check: valid session cookies should be JSON objects
      isAuthenticated = sessionCookie.value.startsWith("{");
    } catch {
      isAuthenticated = false;
    }
  }

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

  // Don't redirect from login/register pages - always allow access
  // This fixes the issue where bad cookies cause unwanted redirects

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
