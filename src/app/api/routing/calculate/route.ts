import { NextRequest, NextResponse } from "next/server";
import { calculateEVRoute } from "@/lib/routing/routeService";
import { z } from "zod";

const calculateRequestSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    name: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    name: z.string().optional(),
  }),
  vehicleSpecs: z
    .object({
      batteryCapacityKwh: z.number().positive(),
      efficiencyKwh100: z.number().positive(),
      maxDcKw: z.number().positive(),
    })
    .optional(),
  initialSocPercent: z.number().min(10).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = calculateRequestSchema.parse(body);

    const result = await calculateEVRoute(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.errors || error.message || "Error en el cálculo de la ruta",
      },
      { status: 400 }
    );
  }
}
