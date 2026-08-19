import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const moderationActionSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(["STATION", "WORKSHOP", "ROUTE", "MANUAL", "REVIEW"]),
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = moderationActionSchema.parse(body);

    // In full deployment, updates Neon Postgres via Prisma
    return NextResponse.json({
      success: true,
      message: `Elemento ${validated.entityId} marcado como ${validated.action}`,
      data: validated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error procesando moderación" },
      { status: 400 }
    );
  }
}
