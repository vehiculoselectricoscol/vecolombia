import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { routeSubmissionSchema, routeCommentSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth-helper";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      where: { moderation: "APPROVED" },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
        vehicleUsed: {
          select: {
            id: true,
            brand: true,
            model: true,
            batteryKwh: true,
            realRangeKm: true,
            imageUrl: true,
          },
        },
        comments: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: routes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener rutas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para publicar o comentar una ruta" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Route comment
    if (body.routeId && body.content) {
      const validatedComment = routeCommentSchema.parse(body);

      const newComment = await prisma.routeComment.create({
        data: {
          routeId: validatedComment.routeId,
          userId: user.id,
          content: validatedComment.content,
          rating: validatedComment.rating,
          actualKwhUsed: validatedComment.actualKwhUsed,
          travelDate: validatedComment.travelDate ? new Date(validatedComment.travelDate) : new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "¡Comentario de ruta agregado!",
        data: newComment,
      });
    }

    // New route creation with real telemetry
    const validated = routeSubmissionSchema.parse(body);

    const newRoute = await prisma.route.create({
      data: {
        title: validated.title,
        description: validated.description,
        originCity: validated.originCity,
        destinationCity: validated.destinationCity,
        originAddress: validated.originAddress,
        destinationAddress: validated.destinationAddress,
        originCoords: validated.originCoords,
        destinationCoords: validated.destinationCoords,
        distanceKm: validated.distanceKm,
        durationMinutes: validated.durationMinutes,
        elevationGainM: validated.elevationGainM || 0,
        startSoc: validated.startSoc,
        endSoc: validated.endSoc,
        drivingMode: validated.drivingMode || "NORMAL",
        climateActive: validated.climateActive ?? true,
        passengersCount: validated.passengersCount || 2,
        avgSpeedKmh: validated.avgSpeedKmh,
        actualKwhUsed: validated.actualKwhUsed,
        realEfficiency: validated.realEfficiency,
        chargingTelemetry: validated.chargingTelemetry || [],
        waypoints: validated.waypoints,
        elevationProfile: validated.elevationProfile || [],
        vehicleUsedId: validated.vehicleUsedId,
        avgConsumption: validated.avgConsumption || validated.realEfficiency || 15.0,
        difficulty: validated.difficulty,
        roadStatus: validated.roadStatus || "Buen estado",
        chargingStops: validated.chargingStops,
        photos: validated.photos.length > 0 ? validated.photos : ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"],
        moderation: "APPROVED",
        createdById: user.id,
      },
      include: {
        vehicleUsed: true,
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Registro de viaje comunitario guardado con éxito!",
      data: newRoute,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error al crear ruta" },
      { status: 400 }
    );
  }
}
