import { NextRequest, NextResponse } from "next/server";
import { routeSubmissionSchema } from "@/lib/validations";
import { INITIAL_ROUTES } from "@/lib/data/seed-data";

export async function GET() {
  return NextResponse.json({ success: true, data: INITIAL_ROUTES });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = routeSubmissionSchema.parse(body);

    const newRoute = {
      id: `ruta-${Date.now()}`,
      ...validated,
      moderation: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Ruta enviada a moderación exitosamente",
      data: newRoute,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error de validación" },
      { status: 400 }
    );
  }
}
