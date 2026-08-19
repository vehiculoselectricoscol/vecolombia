import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { catalogVehicleSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    const whereClause: any = {};
    if (brand && brand !== "ALL") {
      whereClause.brand = { equals: brand, mode: "insensitive" };
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            usersWithVehicle: true,
          },
        },
      },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    });

    // Extract unique brands list
    const brands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();

    return NextResponse.json({
      success: true,
      data: vehicles,
      brands,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener catálogo de vehículos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = catalogVehicleSchema.parse(body);

    const newVehicle = await prisma.vehicle.create({
      data: {
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        yearStart: validated.yearStart || validated.year,
        yearEnd: validated.yearEnd,
        batteryKwh: validated.batteryKwh,
        realRangeKm: validated.realRangeKm,
        wltpRangeKm: validated.wltpRangeKm || Math.round(validated.realRangeKm * 1.15),
        connectorTypes: validated.connectorTypes,
        maxAcKw: validated.maxAcKw,
        maxDcKw: validated.maxDcKw,
        efficiencyKwh100: validated.efficiencyKwh100 || 15.0,
        imageUrl:
          validated.imageUrl ||
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        description: validated.description || `${validated.brand} ${validated.model} 100% Eléctrico`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `¡Vehículo ${newVehicle.brand} ${newVehicle.model} agregado al catálogo nacional!`,
      data: newVehicle,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error agregando vehículo al catálogo" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de vehículo requerido" }, { status: 400 });
    }

    const validated = catalogVehicleSchema.parse(rest);

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        yearStart: validated.yearStart,
        yearEnd: validated.yearEnd,
        batteryKwh: validated.batteryKwh,
        realRangeKm: validated.realRangeKm,
        wltpRangeKm: validated.wltpRangeKm,
        connectorTypes: validated.connectorTypes,
        maxAcKw: validated.maxAcKw,
        maxDcKw: validated.maxDcKw,
        efficiencyKwh100: validated.efficiencyKwh100,
        imageUrl: validated.imageUrl,
        description: validated.description,
      },
    });

    return NextResponse.json({
      success: true,
      message: `¡Especificaciones de ${updated.brand} ${updated.model} actualizadas!`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error actualizando vehículo" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de vehículo requerido" }, { status: 400 });
    }

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Línea de vehículo eliminada del catálogo nacional",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error eliminando vehículo" },
      { status: 500 }
    );
  }
}
