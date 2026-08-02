import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/registro"];

const adminOnlyRoutes = [
  "/dashboard/productos/nuevo",
  "/dashboard/admin",
];

const superAdminOnlyRoutes = [
  "/dashboard/finanzas",
];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));
  const isPublicRoute = publicRoutes.some((r) => path.startsWith(r));
  const isAdminOnly = adminOnlyRoutes.some((r) => path.startsWith(r));
  const isSuperAdminOnly = superAdminOnlyRoutes.some((r) => path.startsWith(r));

  const token = req.cookies.get("session")?.value;
  const session = token ? verifyToken(token) : null;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isAdminOnly && session?.role === "vendedor") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isSuperAdminOnly && session?.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
