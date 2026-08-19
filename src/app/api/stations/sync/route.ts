import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for full sync

// Known reference cities in Colombia with coordinates for reverse mapping
const COLOMBIA_HUBS: { city: string; department: string; lat: number; lng: number }[] = [
  { city: "Bogotá", department: "Cundinamarca", lat: 4.711, lng: -74.0721 },
  { city: "Medellín", department: "Antioquia", lat: 6.2442, lng: -75.5812 },
  { city: "Cali", department: "Valle del Cauca", lat: 3.4516, lng: -76.532 },
  { city: "Barranquilla", department: "Atlántico", lat: 10.9685, lng: -74.7813 },
  { city: "Cartagena", department: "Bolívar", lat: 10.391, lng: -75.4794 },
  { city: "Bucaramanga", department: "Santander", lat: 7.1254, lng: -73.1198 },
  { city: "Pereira", department: "Risaralda", lat: 4.8133, lng: -75.6961 },
  { city: "Manizales", department: "Caldas", lat: 5.0689, lng: -75.5174 },
  { city: "Armenia", department: "Quindío", lat: 4.5339, lng: -75.6811 },
  { city: "Ibagué", department: "Tolima", lat: 4.4389, lng: -75.2322 },
  { city: "Villavicencio", department: "Meta", lat: 4.142, lng: -73.6266 },
  { city: "Tunja", department: "Boyacá", lat: 5.5353, lng: -73.3678 },
  { city: "Santa Marta", department: "Magdalena", lat: 11.2408, lng: -74.199 },
  { city: "Pasto", department: "Nariño", lat: 1.2136, lng: -77.2811 },
  { city: "Neiva", department: "Huila", lat: 2.9273, lng: -75.2819 },
  { city: "Popayán", department: "Cauca", lat: 2.4448, lng: -76.6147 },
  { city: "Cúcuta", department: "Norte de Santander", lat: 7.8939, lng: -72.5078 },
  { city: "Valledupar", department: "Cesar", lat: 10.4631, lng: -73.2532 },
  { city: "Montería", department: "Córdoba", lat: 8.7479, lng: -75.8814 },
  { city: "Sopó", department: "Cundinamarca", lat: 4.9083, lng: -73.9431 },
  { city: "Chía", department: "Cundinamarca", lat: 4.8622, lng: -74.0583 },
  { city: "Girardot", department: "Cundinamarca", lat: 4.3039, lng: -74.8055 },
  { city: "Rionegro", department: "Antioquia", lat: 6.1552, lng: -75.3737 },
  { city: "Envigado", department: "Antioquia", lat: 6.1681, lng: -75.5847 },
];

function getClosestLocation(lat: number, lng: number): { city: string; department: string } {
  let closest = COLOMBIA_HUBS[0];
  let minDistance = Number.MAX_VALUE;

  for (const hub of COLOMBIA_HUBS) {
    const d = Math.hypot(hub.lat - lat, hub.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = hub;
    }
  }
  return { city: closest.city, department: closest.department };
}

function detectOperator(name: string, tags: Record<string, any> = {}): string {
  const combined = `${name} ${tags.operator || ""} ${tags.brand || ""} ${tags.network || ""}`.toLowerCase();
  if (combined.includes("terpel") || combined.includes("voltex")) return "Terpel Voltex";
  if (combined.includes("celsia")) return "Celsia";
  if (combined.includes("enel") || combined.includes("enel x") || combined.includes("way")) return "Enel X Way";
  if (combined.includes("epm")) return "EPM";
  if (combined.includes("blink")) return "Blink Charging";
  if (combined.includes("evsy")) return "Evsy";
  if (combined.includes("porsche")) return "Porsche Destination Charging";
  if (combined.includes("bmw")) return "BMW i Charging";
  if (combined.includes("tesla")) return "Tesla Supercharger / Destination";
  if (combined.includes("auteco")) return "Auteco Mobility";
  if (combined.includes("primax")) return "Primax";
  if (combined.includes("petrobras")) return "Petrobras";
  return tags.operator || tags.brand || "Operador Verificado";
}

function detectConnectors(tags: Record<string, any> = {}, operator: string): any[] {
  const connectors: any[] = [];
  const power = parseFloat(tags["capacity"] || tags["output"] || tags["socket:type2_combo:output"] || "60") || 60;

  const hasCcs2 = tags["socket:type2_combo"] === "yes" || tags["socket:ccs"] === "yes" || operator.includes("Enel") || operator.includes("Celsia") || operator.includes("Terpel");
  const hasCcs1 = tags["socket:type1_combo"] === "yes" || tags["socket:ccs1"] === "yes" || operator.includes("Terpel") || operator.includes("Celsia");
  const hasGbt = tags["socket:gbt"] === "yes" || tags["socket:gb_t_dc"] === "yes" || operator.includes("Terpel") || operator.includes("BYD");
  const hasType2 = tags["socket:type2"] === "yes" || tags["socket:type2_cable"] === "yes" || operator.includes("Celsia") || operator.includes("EPM");
  const hasType1 = tags["socket:type1"] === "yes" || tags["socket:j1772"] === "yes";

  if (hasCcs1) {
    connectors.push({ type: "CCS1", powerKw: power, count: 2, pricePerKwh: 1750, isAvailable: true });
  }
  if (hasCcs2) {
    connectors.push({ type: "CCS2", powerKw: power, count: 2, pricePerKwh: 1750, isAvailable: true });
  }
  if (hasGbt) {
    connectors.push({ type: "GB_T_DC", powerKw: power, count: 2, pricePerKwh: 1750, isAvailable: true });
  }
  if (hasType2) {
    connectors.push({ type: "TYPE_2_MENNEKES", powerKw: 22, count: 2, pricePerKwh: 1200, isAvailable: true });
  }
  if (hasType1) {
    connectors.push({ type: "TYPE_1_J1772", powerKw: 7.4, count: 1, pricePerKwh: 1200, isAvailable: true });
  }

  // Fallback standard fast charging hub setup in Colombia if no specific tag is provided
  if (connectors.length === 0) {
    connectors.push(
      { type: "CCS1", powerKw: 60, count: 1, pricePerKwh: 1750, isAvailable: true },
      { type: "CCS2", powerKw: 60, count: 2, pricePerKwh: 1750, isAvailable: true },
      { type: "GB_T_DC", powerKw: 60, count: 1, pricePerKwh: 1750, isAvailable: true },
      { type: "TYPE_2_MENNEKES", powerKw: 22, count: 2, pricePerKwh: 1200, isAvailable: true }
    );
  }

  return connectors;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const hasAdminCookie = req.cookies.has("ve_admin_session");

    if (!hasAdminCookie && user?.role !== "ADMIN" && user?.role !== "MODERATOR") {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // 1. Query OpenStreetMap Overpass API (Live Colombia Dataset)
    const overpassQuery = `
      [out:json][timeout:30];
      area["ISO3166-1"="CO"]->.searchArea;
      (
        node["amenity"="charging_station"](area.searchArea);
        way["amenity"="charging_station"](area.searchArea);
      );
      out body center;
    `;

    try {
      const osmRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain", "User-Agent": "VEColombia/1.0 (info@vehiculoselectricoscolombia.com)" },
        body: overpassQuery,
      });

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const elements = osmData.elements || [];

        for (const el of elements) {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          if (!lat || !lon) continue;

          const tags = el.tags || {};
          const rawName = tags.name || tags.brand || tags.operator || tags.description || `Estación ${tags.operator || "Carga EV"}`;
          const operator = detectOperator(rawName, tags);
          const location = getClosestLocation(lat, lon);
          const city = tags["addr:city"] || location.city;
          const department = tags["addr:province"] || tags["addr:state"] || location.department;
          const address = tags["addr:street"] ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}`.trim() : `Sector ${city}, ${department}`;
          const connectors = detectConnectors(tags, operator);

          const stationName = rawName.includes(operator) ? rawName : `${operator} - ${rawName}`;

          // Match by coordinate proximity (< 500m) or existing name
          const existing = await prisma.chargingStation.findFirst({
            where: {
              OR: [
                {
                  latitude: { gte: lat - 0.003, lte: lat + 0.003 },
                  longitude: { gte: lon - 0.003, lte: lon + 0.003 },
                },
                { name: stationName },
              ],
            },
          });

          if (existing) {
            await prisma.chargingStation.update({
              where: { id: existing.id },
              data: {
                connectors,
                isVerified: true,
                moderation: "APPROVED",
                status: "OPERATIONAL",
                updatedAt: new Date(),
              },
            });
            updatedCount++;
          } else {
            await prisma.chargingStation.create({
              data: {
                name: stationName,
                operator,
                address,
                city,
                department,
                latitude: lat,
                longitude: lon,
                status: "OPERATIONAL",
                access: tags.access === "customers" ? "SHOPPING_CUSTOMER" : tags.access === "hotel_guests" ? "HOTEL_GUEST_ONLY" : "PUBLIC",
                connectors,
                photos: [
                  operator.includes("Terpel")
                    ? "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    : operator.includes("Celsia")
                    ? "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=800&q=80",
                ],
                amenities: ["Carga Rápida", "Seguridad", "Acceso Fácil", "WiFi"],
                priceInfo: tags.fee === "no" ? "Gratuito" : "$1.750 / kWh (Tarifa estándar)",
                rating: 4.8,
                reviewsCount: 1,
                isVerified: true,
                moderation: "APPROVED",
                submittedById: user?.id,
              },
            });
            importedCount++;
          }
        }
      }
    } catch (e: any) {
      console.error("OSM Sync Error:", e);
      errors.push(`OSM Error: ${e.message}`);
    }

    // 2. Query Open Charge Map API if API Key exists in env
    const ocmApiKey = process.env.OPENCHARGEMAP_API_KEY;
    if (ocmApiKey) {
      try {
        const ocmRes = await fetch(
          `https://api.openchargemap.io/v3/poi/?output=json&countrycode=CO&maxresults=250&key=${ocmApiKey}`,
          { headers: { "User-Agent": "VEColombia/1.0" } }
        );
        if (ocmRes.ok) {
          const ocmList = await ocmRes.json();
          for (const item of ocmList) {
            const lat = item.AddressInfo?.Latitude;
            const lon = item.AddressInfo?.Longitude;
            if (!lat || !lon) continue;

            const name = item.AddressInfo?.Title || "Estación de Carga OCM";
            const operator = item.OperatorInfo?.Title || detectOperator(name);
            const city = item.AddressInfo?.Town || getClosestLocation(lat, lon).city;
            const department = item.AddressInfo?.StateOrProvince || getClosestLocation(lat, lon).department;
            const address = item.AddressInfo?.AddressLine1 || `Vía principal ${city}`;

            const existing = await prisma.chargingStation.findFirst({
              where: {
                latitude: { gte: lat - 0.003, lte: lat + 0.003 },
                longitude: { gte: lon - 0.003, lte: lon + 0.003 },
              },
            });

            if (!existing) {
              await prisma.chargingStation.create({
                data: {
                  name,
                  operator,
                  address,
                  city,
                  department,
                  latitude: lat,
                  longitude: lon,
                  status: "OPERATIONAL",
                  access: "PUBLIC",
                  connectors: detectConnectors({}, operator),
                  photos: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"],
                  amenities: ["Carga Rápida DC", "Monitoreo"],
                  priceInfo: "$1.750 / kWh",
                  rating: 4.9,
                  reviewsCount: 1,
                  isVerified: true,
                  moderation: "APPROVED",
                  submittedById: user?.id,
                },
              });
              importedCount++;
            }
          }
        }
      } catch (ocmErr: any) {
        console.error("OCM Sync Error:", ocmErr);
        errors.push(`OCM Error: ${ocmErr.message}`);
      }
    }

    const totalInDb = await prisma.chargingStation.count();

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${importedCount} estaciones nuevas importadas, ${updatedCount} actualizadas. Total en base de datos: ${totalInDb}`,
      data: {
        imported: importedCount,
        updated: updatedCount,
        totalInDb,
        errors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al sincronizar electrolineras" },
      { status: 500 }
    );
  }
}
