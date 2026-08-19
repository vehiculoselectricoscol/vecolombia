import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        vehicles: {
          include: { vehicle: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado con este correo electrónico" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: "Esta cuenta requiere configurar una contraseña previa" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(validated.password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `¡Bienvenido de nuevo, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
        vehiclesCount: user.vehicles.length,
      },
    });

    // Set auth cookies
    response.cookies.set("ve_session", user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    if (user.role === "ADMIN" || user.role === "MODERATOR") {
      response.cookies.set("ve_admin_session", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error en inicio de sesión" },
      { status: 400 }
    );
  }
}
