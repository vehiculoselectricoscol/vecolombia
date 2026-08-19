import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { marketplaceListingSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const condition = searchParams.get("condition");
    const search = searchParams.get("search");

    const whereClause: any = {
      moderation: "APPROVED",
    };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (city && city !== "ALL") {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    if (condition && condition !== "ALL") {
      whereClause.condition = condition;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vehicleBrand: { contains: search, mode: "insensitive" } },
        { vehicleModel: { contains: search, mode: "insensitive" } },
      ];
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener anuncios del marketplace" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = marketplaceListingSchema.parse(body);

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const newListing = await prisma.marketplaceListing.create({
      data: {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        condition: validated.condition,
        priceCop: validated.priceCop,
        isNegotiable: validated.isNegotiable,
        city: validated.city,
        department: validated.department,
        photos: validated.photos,
        contactPhone: validated.contactPhone,
        contactEmail: validated.contactEmail,
        vehicleBrand: validated.vehicleBrand,
        vehicleModel: validated.vehicleModel,
        vehicleYear: validated.vehicleYear,
        mileageKm: validated.mileageKm,
        batteryHealthSoh: validated.batteryHealthSoh,
        batteryKwh: validated.batteryKwh,
        licensePlateMask: validated.licensePlateMask,
        connectorType: validated.connectorType,
        chargingPowerKw: validated.chargingPowerKw,
        compatibleBrands: validated.compatibleBrands,
        isSold: false,
        featured: false,
        viewsCount: 0,
        moderation: "APPROVED", // Listo para visualización inmediata en desarrollo
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Anuncio publicado exitosamente en el Marketplace EV!",
      data: newListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error al publicar anuncio" },
      { status: 400 }
    );
  }
}
