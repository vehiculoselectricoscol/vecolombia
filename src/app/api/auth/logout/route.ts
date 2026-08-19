import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente",
  });

  const cookiesToClear = [
    "ve_session",
    "ve_admin_session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.pkce.code_verifier",
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
    // Also set without httpOnly to clear non-httpOnly variants
    response.cookies.set(name, "", {
      httpOnly: false,
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}
