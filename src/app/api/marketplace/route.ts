import { NextRequest, NextResponse } from "next/server";
import { marketplaceListingSchema } from "@/lib/validations";
import { INITIAL_MARKETPLACE } from "@/lib/data/seed-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");

  let listings = INITIAL_MARKETPLACE;

  if (category && category !== "ALL") {
    listings = listings.filter((item) => item.category === category);
  }

  if (city && city !== "ALL") {
    listings = listings.filter((item) => item.city.toLowerCase().includes(city.toLowerCase()));
  }

  return NextResponse.json({ success: true, data: listings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = marketplaceListingSchema.parse(body);

    const newListing = {
      id: `item-${Date.now()}`,
      ...validated,
      isSold: false,
      featured: false,
      viewsCount: 0,
      moderation: "PENDING", // Moderado por el administrador antes de ser público
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Anuncio recibido y enviado a la cola de moderación del administrador",
      data: newListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || "Error de validación de anuncio" },
      { status: 400 }
    );
  }
}
