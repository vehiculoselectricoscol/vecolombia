import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stationSubmissionSchema, chargingReviewSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

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
              select: { id: true, name: true, image: true, email: true },
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
    const user = await getAuthenticatedUser(req);

    // Check if it's a review check-in or a new station submission
    if (body.stationId && body.rating) {
      const validatedReview = chargingReviewSchema.parse(body);

      // Ensure we have a valid user id (either authenticated or fallback)
      let authorId = user?.id;
      if (!authorId) {
        const firstUser = await prisma.user.findFirst();
        authorId = firstUser?.id || "user-anon";
      }

      const newReview = await prisma.chargingReview.create({
        data: {
          stationId: validatedReview.stationId,
          userId: authorId,
          rating: validatedReview.rating,
          comment: validatedReview.comment,
          connectorUsed: validatedReview.connectorUsed,
          powerDeliveredKw: validatedReview.powerDeliveredKw,
          costTotalCop: validatedReview.costTotalCop,
          photoUrl: validatedReview.photoUrl || body.photoUrl,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // Update station average rating and reviews count
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
        message: "¡Bitácora & reseña registrada con éxito en la comunidad!",
        data: newReview,
      });
    }

    // New station registration
    const validated = stationSubmissionSchema.parse(body);

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
      message: "¡Electrolinera registrada y publicada exitosamente!",
      data: newStation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error en el registro" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, address, city, department, priceInfo, amenities, connectors, name, operator } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de estación requerido" }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (department) updateData.department = department;
    if (priceInfo) updateData.priceInfo = priceInfo;
    if (amenities) updateData.amenities = amenities;
    if (connectors) updateData.connectors = connectors;
    if (name) updateData.name = name;
    if (operator) updateData.operator = operator;

    const updated = await prisma.chargingStation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Información de la estación actualizada correctamente",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar estación" },
      { status: 500 }
    );
  }
}
