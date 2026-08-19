import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin Routes Protection (/admin, /admin/...)
  if (pathname.startsWith("/admin")) {
    // Whitelist login and setup pages
    if (pathname === "/admin/login" || pathname === "/admin/setup") {
      return NextResponse.next();
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "8d0c72cfce82dfa59ed8a2835cd186da3654b16b20bba76bd121b8c8c6fc6b41",
    });

    const hasAdminSession = req.cookies.has("ve_admin_session");
    const hasCustomSession = req.cookies.has("ve_session");
    const isAdminRole = (token as any)?.role === "ADMIN" || (token as any)?.role === "MODERATOR";

    if (!token && !hasAdminSession && !hasCustomSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token && !isAdminRole && !hasAdminSession) {
      const redirectUrl = new URL("/dashboard", req.url);
      redirectUrl.searchParams.set("unauthorized", "true");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // 2. Dashboard & User Garage Protection (/dashboard, /dashboard/...)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "8d0c72cfce82dfa59ed8a2835cd186da3654b16b20bba76bd121b8c8c6fc6b41",
    });

    const hasCustomSession = req.cookies.has("ve_session") || req.cookies.has("ve_admin_session");

    if (!token && !hasCustomSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Sensitive Moderation API Protection (/api/moderation/...)
  if (pathname.startsWith("/api/moderation")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "8d0c72cfce82dfa59ed8a2835cd186da3654b16b20bba76bd121b8c8c6fc6b41",
    });

    const hasAdminSession = req.cookies.has("ve_admin_session");
    const isAdminRole = (token as any)?.role === "ADMIN" || (token as any)?.role === "MODERATOR";

    if (!isAdminRole && !hasAdminSession) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/moderation/:path*",
  ],
};
