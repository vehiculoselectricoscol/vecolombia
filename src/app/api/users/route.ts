import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            vehicles: true,
            routes: true,
            marketplaceListings: true,
            stationsAdded: true,
            workshopsAdded: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = updateRoleSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: validated.userId },
      data: { role: validated.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rol de ${updated.name} actualizado a ${updated.role}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error actualizando rol" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId requerido" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: "Usuario eliminado exitosamente" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error eliminando usuario" },
      { status: 500 }
    );
  }
}
