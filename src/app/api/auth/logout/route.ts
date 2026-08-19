import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente",
  });

  // Clear session cookies
  response.cookies.set("ve_session", "", {
    httpOnly: false,
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("ve_admin_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
