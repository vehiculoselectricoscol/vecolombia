import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { workshopSubmissionSchema, workshopReviewSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");
    const city = searchParams.get("city");

    const whereClause: any = {
      moderation: "APPROVED",
    };

    if (city && city !== "ALL") {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    if (brand && brand !== "ALL") {
      whereClause.supportedBrands = { hasSome: [brand, "Todas"] };
    }

    const workshops = await prisma.workshop.findMany({
      where: whereClause,
      include: {
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ success: true, data: workshops });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener talleres" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Review submission
    if (body.workshopId && body.rating) {
      const validatedReview = workshopReviewSchema.parse(body);
      const user = await prisma.user.findFirst();

      const newReview = await prisma.workshopReview.create({
        data: {
          workshopId: validatedReview.workshopId,
          userId: user?.id || "user-anon",
          rating: validatedReview.rating,
          serviceDone: validatedReview.serviceDone,
          comment: validatedReview.comment,
          costScore: validatedReview.costScore,
          verifiedVisit: true,
        },
      });

      const reviews = await prisma.workshopReview.findMany({
        where: { workshopId: validatedReview.workshopId },
      });
      const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

      await prisma.workshop.update({
        where: { id: validatedReview.workshopId },
        data: {
          rating: Number(avg.toFixed(1)),
          reviewsCount: reviews.length,
        },
      });

      return NextResponse.json({
        success: true,
        message: "¡Opinión sobre el taller guardada con éxito!",
        data: newReview,
      });
    }

    // New workshop creation
    const validated = workshopSubmissionSchema.parse(body);
    const user = await prisma.user.findFirst();

    const newWorkshop = await prisma.workshop.create({
      data: {
        name: validated.name,
        address: validated.address,
        city: validated.city,
        department: validated.department,
        latitude: validated.latitude,
        longitude: validated.longitude,
        phone: validated.phone,
        whatsapp: validated.whatsapp,
        email: validated.email,
        website: validated.website,
        specialties: validated.specialties,
        certifications: validated.certifications,
        supportedBrands: validated.supportedBrands,
        photos: validated.photos,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        moderation: "APPROVED",
        submittedById: user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Taller especializado agregado exitosamente al directorio nacional!",
      data: newWorkshop,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error registrando taller" },
      { status: 400 }
    );
  }
}
