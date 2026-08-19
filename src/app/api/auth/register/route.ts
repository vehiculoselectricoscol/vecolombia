import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().trim().min(7, "Teléfono requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  image: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe un usuario registrado con este correo" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        password: hashedPassword,
        image: validated.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        role: "USER",
      },
    });

    const response = NextResponse.json({
      success: true,
      message: `¡Registro exitoso! Bienvenido a VE Colombia, ${newUser.name}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        image: newUser.image,
      },
    });

    response.cookies.set("ve_session", newUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error al registrar usuario" },
      { status: 400 }
    );
  }
}
