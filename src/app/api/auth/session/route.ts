import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("ve_session")?.value;

    let user = null;

    if (sessionCookie) {
      user = await prisma.user.findUnique({
        where: { id: sessionCookie },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          vehicles: {
            include: { vehicle: true },
          },
        },
      });
    }

    // If no specific cookie yet, return the default admin or primary user as active session
    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          vehicles: {
            include: { vehicle: true },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al verificar sesión" },
      { status: 500 }
    );
  }
}
