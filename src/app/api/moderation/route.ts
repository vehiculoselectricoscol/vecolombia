import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const moderationActionSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(["STATION", "WORKSHOP", "ROUTE", "MANUAL", "MARKETPLACE", "REVIEW"]),
  action: z.enum(["APPROVE", "REJECT", "TOGGLE_VERIFY"]),
  reason: z.string().optional(),
});

export async function GET() {
  try {
    const [stations, workshops, routes, manuals, listings] = await Promise.all([
      prisma.chargingStation.findMany({ where: { moderation: "PENDING" } }),
      prisma.workshop.findMany({ where: { moderation: "PENDING" } }),
      prisma.route.findMany({ where: { moderation: "PENDING" } }),
      prisma.manual.findMany({ where: { moderation: "PENDING" } }),
      prisma.marketplaceListing.findMany({ where: { moderation: "PENDING" } }),
    ]);

    const queue = [
      ...listings.map((l) => ({
        id: l.id,
        type: "MARKETPLACE" as const,
        title: `Venta: ${l.title}`,
        subtitle: `${l.city} • ${l.category} • $${l.priceCop.toLocaleString("es-CO")}`,
        submittedBy: l.contactPhone,
        date: new Date(l.createdAt).toLocaleDateString("es-CO"),
        status: l.moderation,
        details: l.description,
      })),
      ...stations.map((s) => ({
        id: s.id,
        type: "STATION" as const,
        title: s.name,
        subtitle: `${s.operator} • ${s.city}, ${s.department}`,
        submittedBy: s.address,
        date: new Date(s.createdAt).toLocaleDateString("es-CO"),
        status: s.moderation,
        details: s.priceInfo || "Carga pública",
      })),
      ...workshops.map((w) => ({
        id: w.id,
        type: "WORKSHOP" as const,
        title: w.name,
        subtitle: `${w.city} • Tel: ${w.phone}`,
        submittedBy: w.address,
        date: new Date(w.createdAt).toLocaleDateString("es-CO"),
        status: w.moderation,
        details: w.specialties.join(", "),
      })),
      ...routes.map((r) => ({
        id: r.id,
        type: "ROUTE" as const,
        title: r.title,
        subtitle: `${r.originCity} ➔ ${r.destinationCity} (${r.distanceKm} km)`,
        submittedBy: "Comunidad",
        date: new Date(r.createdAt).toLocaleDateString("es-CO"),
        status: r.moderation,
        details: r.description,
      })),
      ...manuals.map((m) => ({
        id: m.id,
        type: "MANUAL" as const,
        title: m.title,
        subtitle: `${m.category} • ${m.brand || "General"}`,
        submittedBy: "Comunidad",
        date: new Date(m.createdAt).toLocaleDateString("es-CO"),
        status: m.moderation,
        details: m.description,
      })),
    ];

    return NextResponse.json({ success: true, data: queue });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener cola de moderación" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = moderationActionSchema.parse(body);

    const newStatus = validated.action === "APPROVE" ? "APPROVED" : "REJECTED";

    switch (validated.entityType) {
      case "MARKETPLACE":
        await prisma.marketplaceListing.update({
          where: { id: validated.entityId },
          data: { moderation: newStatus },
        });
        break;
      case "STATION":
        await prisma.chargingStation.update({
          where: { id: validated.entityId },
          data: { moderation: newStatus },
        });
        break;
      case "WORKSHOP":
        if (validated.action === "TOGGLE_VERIFY") {
          const ws = await prisma.workshop.findUnique({ where: { id: validated.entityId } });
          if (ws) {
            await prisma.workshop.update({
              where: { id: validated.entityId },
              data: { isVerified: !ws.isVerified },
            });
          }
        } else {
          await prisma.workshop.update({
            where: { id: validated.entityId },
            data: { moderation: newStatus },
          });
        }
        break;
      case "ROUTE":
        await prisma.route.update({
          where: { id: validated.entityId },
          data: { moderation: newStatus },
        });
        break;
      case "MANUAL":
        await prisma.manual.update({
          where: { id: validated.entityId },
          data: { moderation: newStatus },
        });
        break;
      default:
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Elemento ${validated.entityType} ${validated.action === "APPROVE" ? "aprobado" : "rechazado"} con éxito`,
      data: validated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || "Error procesando moderación" },
      { status: 400 }
    );
  }
}
