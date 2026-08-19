import { NextRequest, NextResponse } from "next/server";
import { workshopSubmissionSchema } from "@/lib/validations";
import { INITIAL_WORKSHOPS } from "@/lib/data/seed-data";

export async function GET() {
  return NextResponse.json({ success: true, data: INITIAL_WORKSHOPS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = workshopSubmissionSchema.parse(body);

    const newWorkshop = {
      id: `ws-${Date.now()}`,
      ...validated,
      rating: 5.0,
      reviewsCount: 0,
      isVerified: false,
      moderation: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Taller recibido para moderación y certificación",
      data: newWorkshop,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error de validación" },
      { status: 400 }
    );
  }
}
