import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stationSubmissionSchema, chargingReviewSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const connector = searchParams.get("connector");
    const city = searchParams.get("city");
    const operator = searchParams.get("operator");

    const whereClause: any = {
      moderation: "APPROVED",
    };

    if (city && city !== "ALL") {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    if (operator && operator !== "ALL") {
      whereClause.operator = operator;
    }

    const stations = await prisma.chargingStation.findMany({
      where: whereClause,
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { rating: "desc" },
    });

    // Connector filter on JSON if requested
    let result = stations;
    if (connector && connector !== "ALL") {
      result = stations.filter((s: any) =>
        Array.isArray(s.connectors)
          ? s.connectors.some((c: any) => c.type === connector)
          : true
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al consultar electrolineras" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a review check-in or a new station submission
    if (body.stationId && body.rating) {
      const validatedReview = chargingReviewSchema.parse(body);
      const user = await prisma.user.findFirst();

      const newReview = await prisma.chargingReview.create({
        data: {
          stationId: validatedReview.stationId,
          userId: user?.id || "user-anon",
          rating: validatedReview.rating,
          comment: validatedReview.comment,
          connectorUsed: validatedReview.connectorUsed,
          powerDeliveredKw: validatedReview.powerDeliveredKw,
          costTotalCop: validatedReview.costTotalCop,
          photoUrl: validatedReview.photoUrl,
        },
      });

      // Update station average rating
      const reviews = await prisma.chargingReview.findMany({
        where: { stationId: validatedReview.stationId },
      });
      const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

      await prisma.chargingStation.update({
        where: { id: validatedReview.stationId },
        data: {
          rating: Number(avg.toFixed(1)),
          reviewsCount: reviews.length,
        },
      });

      return NextResponse.json({
        success: true,
        message: "¡Check-in y reseña guardada exitosamente!",
        data: newReview,
      });
    }

    // New station registration
    const validated = stationSubmissionSchema.parse(body);
    const user = await prisma.user.findFirst();

    const newStation = await prisma.chargingStation.create({
      data: {
        name: validated.name,
        operator: validated.operator,
        address: validated.address,
        city: validated.city,
        department: validated.department,
        latitude: validated.latitude,
        longitude: validated.longitude,
        status: validated.status,
        access: validated.access,
        connectors: validated.connectors,
        photos: validated.photos,
        amenities: validated.amenities,
        priceInfo: validated.priceInfo,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        moderation: "APPROVED",
        submittedById: user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Electrolinera registrada y publicada en la base de datos nacional!",
      data: newStation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error en el registro" },
      { status: 400 }
    );
  }
}
