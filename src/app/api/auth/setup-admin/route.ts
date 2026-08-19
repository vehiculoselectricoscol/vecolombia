import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const setupAdminSchema = z.object({
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().trim().min(10, "Celular requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  adminSecretKey: z.string().min(4, "Clave de seguridad de configuración requerida"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = setupAdminSchema.parse(body);

    // Validación de seguridad para creación de administradores
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || "vecolombia_admin_master_2024";
    if (validated.adminSecretKey !== expectedSecret) {
      // Si la clave no coincide, verificar si ya existen admins o denegar
      const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (existingAdmins > 0 && validated.adminSecretKey !== expectedSecret) {
        return NextResponse.json(
          { success: false, error: "Clave de autorización administrativa incorrecta" },
          { status: 403 }
        );
      }
    }

    // Hashear contraseña de forma segura
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Crear o promover usuario a Administrador en PostgreSQL
    const adminUser = await prisma.user.upsert({
      where: { email: validated.email.toLowerCase() },
      update: {
        name: validated.name,
        phone: validated.phone,
        password: hashedPassword,
        role: "ADMIN",
        updatedAt: new Date(),
      },
      create: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: `¡Administrador ${adminUser.name} configurado exitosamente!`,
      data: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error configurando administrador" },
      { status: 400 }
    );
  }
}
