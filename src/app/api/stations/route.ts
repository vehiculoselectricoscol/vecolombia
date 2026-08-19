import { NextRequest, NextResponse } from "next/server";
import { stationSubmissionSchema } from "@/lib/validations";
import { INITIAL_STATIONS } from "@/lib/data/seed-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const connector = searchParams.get("connector");
  const city = searchParams.get("city");

  let stations = INITIAL_STATIONS;

  if (connector) {
    stations = stations.filter((s) => s.connectors.some((c) => c.type === connector));
  }

  if (city) {
    stations = stations.filter((s) => s.city.toLowerCase().includes(city.toLowerCase()));
  }

  return NextResponse.json({ success: true, data: stations });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = stationSubmissionSchema.parse(body);

    const newStation = {
      id: `est-${Date.now()}`,
      ...validated,
      rating: 5.0,
      reviewsCount: 0,
      isVerified: false,
      moderation: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Estación enviada a la cola de moderación",
      data: newStation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error de validación" },
      { status: 400 }
    );
  }
}
