import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        vehicles: user.vehicles || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al verificar sesión" },
      { status: 500 }
    );
  }
}
