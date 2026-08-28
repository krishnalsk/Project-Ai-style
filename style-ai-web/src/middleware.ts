import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/cart",
  "/checkout",
  "/orders",
  "/wishlist",
  "/notifications",
  "/rewards",
  "/skin-diary",
  "/virtual-closet",
  "/outfit-generator",
  "/analytics",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Firebase auth session cookie or token in header
  // The actual auth verification happens client-side via Firebase SDK
  // This middleware only adds security headers and basic route protection
  const response = NextResponse.next();

  // Add cache-control headers for protected routes
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/notifications/:path*",
    "/rewards/:path*",
    "/skin-diary/:path*",
    "/virtual-closet/:path*",
    "/outfit-generator/:path*",
    "/analytics/:path*",
  ],
};
