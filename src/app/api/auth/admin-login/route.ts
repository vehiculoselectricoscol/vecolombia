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
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json(
        { success: false, error: "Este usuario no tiene permisos de administración" },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: "Esta cuenta fue registrada vía Google OAuth o no tiene clave asignada. Usa /admin/setup para asignar clave." },
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
      message: `Bienvenido de nuevo, ${user.name}`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });

    // Set secure admin session cookie
    response.cookies.set("ve_admin_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error en inicio de sesión" },
      { status: 400 }
    );
  }
}
