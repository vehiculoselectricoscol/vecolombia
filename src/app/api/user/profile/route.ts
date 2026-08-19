import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userProfileSchema, userVehicleSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Debes iniciar sesión para ver tu perfil y garaje" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validated = userProfileSchema.parse(body);

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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Debes iniciar sesión para agregar un vehículo a tu garaje" }, { status: 401 });
    }

    const body = await req.json();
    const validated = userVehicleSchema.parse(body);

    // If this is set as primary, unmark other vehicles of this user as primary
    if (validated.isPrimary) {
      await prisma.userVehicle.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
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
      message: "Vehículo agregado exitosamente a tu garaje",
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userVehicleId = searchParams.get("userVehicleId");

    if (!userVehicleId) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    // Ensure the vehicle actually belongs to this user
    await prisma.userVehicle.deleteMany({
      where: {
        id: userVehicleId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Vehículo eliminado de tu garaje" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error eliminando vehículo" },
      { status: 500 }
    );
  }
}
