import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { manualSubmissionSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    const whereClause: any = {
      moderation: "APPROVED",
    };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (brand && brand !== "ALL") {
      whereClause.brand = { contains: brand, mode: "insensitive" };
    }

    const manuals = await prisma.manual.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { name: true },
        },
      },
      orderBy: { downloadCount: "desc" },
    });

    return NextResponse.json({ success: true, data: manuals });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener manuales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Increment download counter
    if (body.manualId && body.action === "DOWNLOAD") {
      const updated = await prisma.manual.update({
        where: { id: body.manualId },
        data: { downloadCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const validated = manualSubmissionSchema.parse(body);
    const user = await prisma.user.findFirst();

    const newManual = await prisma.manual.create({
      data: {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        fileUrl: validated.fileUrl,
        fileSizeBytes: validated.fileSizeBytes,
        fileFormat: validated.fileFormat,
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        downloadCount: 0,
        moderation: "APPROVED",
        uploadedById: user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Manual técnico subido con éxito!",
      data: newManual,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error subiendo manual" },
      { status: 400 }
    );
  }
}
