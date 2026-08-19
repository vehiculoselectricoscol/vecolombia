import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userProfileSchema, userVehicleSchema } from "@/lib/validations";

export async function GET() {
  try {
    // Busca el usuario principal o el primer admin/usuario disponible
    const user = await prisma.user.findFirst({
      include: {
        vehicles: {
          include: {
            vehicle: true,
          },
        },
        routes: true,
        marketplaceListings: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = userProfileSchema.parse(body);

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validated.name,
        phone: validated.phone,
        image: validated.image || user.image,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error actualizando perfil" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = userVehicleSchema.parse(body);

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const newVehicle = await prisma.userVehicle.create({
      data: {
        userId: user.id,
        vehicleId: validated.vehicleId,
        modelYear: validated.modelYear,
        nickname: validated.nickname,
        licensePlate: validated.licensePlate,
        batteryHealth: validated.batteryHealth,
        isPrimary: validated.isPrimary,
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Vehículo agregado a tu garaje",
      data: newVehicle,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error agregando vehículo" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userVehicleId = searchParams.get("userVehicleId");

    if (!userVehicleId) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    await prisma.userVehicle.delete({
      where: { id: userVehicleId },
    });

    return NextResponse.json({ success: true, message: "Vehículo eliminado del garaje" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error eliminando vehículo" },
      { status: 500 }
    );
  }
}
