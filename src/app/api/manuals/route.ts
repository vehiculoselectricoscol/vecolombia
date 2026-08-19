import { NextRequest, NextResponse } from "next/server";
import { manualSubmissionSchema } from "@/lib/validations";
import { INITIAL_MANUALS } from "@/lib/data/seed-data";

export async function GET() {
  return NextResponse.json({ success: true, data: INITIAL_MANUALS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = manualSubmissionSchema.parse(body);

    const newManual = {
      id: `man-${Date.now()}`,
      ...validated,
      downloadCount: 0,
      moderation: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Manual recibido y encolado para moderación",
      data: newManual,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error de validación" },
      { status: 400 }
    );
  }
}
