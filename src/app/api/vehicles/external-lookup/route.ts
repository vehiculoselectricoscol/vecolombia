import { NextRequest, NextResponse } from "next/server";
import { fetchNhtsaModelsForMake, POPULAR_EV_PRESETS, EVModelPreset } from "@/lib/services/externalVehicleApi";
import { prisma } from "@/lib/db";
import { ConnectorType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    if (!brand) {
      // Retorna las marcas populares disponibles en el catálogo de presets EV
      const presetBrands = Array.from(new Set(Object.values(POPULAR_EV_PRESETS).map((p) => p.brand))).sort();
      return NextResponse.json({
        success: true,
        popularBrands: presetBrands,
        presets: Object.values(POPULAR_EV_PRESETS),
      });
    }

    // 1. Consultar la API pública y gratuita de la NHTSA
    const nhtsaModels = await fetchNhtsaModelsForMake(brand);

    // 2. Cruzar con la base de presets EV enriquecida
    const matchedPresets: EVModelPreset[] = [];
    const lowerBrand = brand.toLowerCase().trim();

    Object.values(POPULAR_EV_PRESETS).forEach((preset) => {
      if (preset.brand.toLowerCase() === lowerBrand) {
        matchedPresets.push(preset);
      }
    });

    // 3. Formatear modelos obtenidos de la API externa
    const externalModels = nhtsaModels.map((item: any) => {
      // Buscar si tenemos especificaciones EV conocidas para este modelo
      const knownPreset = matchedPresets.find((p) =>
        item.modelName.toLowerCase().includes(p.model.toLowerCase()) ||
        p.model.toLowerCase().includes(item.modelName.toLowerCase())
      );

      if (knownPreset) {
        return {
          ...knownPreset,
          source: "NHTSA_AND_EV_PRESET",
        };
      }

      // Modelo nuevo o sin preset: generar sugerencias EV
      return {
        brand: item.makeName,
        model: item.modelName,
        batteryKwh: 60.0,
        realRangeKm: 380,
        wltpRangeKm: 420,
        maxAcKw: 11.0,
        maxDcKw: 100.0,
        efficiencyKwh100: 15.5,
        connectorTypes: ["CCS2", "TYPE_2_MENNEKES"] as ConnectorType[],
        yearStart: 2022,
        yearEnd: 2026,
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        description: `${item.makeName} ${item.modelName} 100% Eléctrico.`,
        source: "NHTSA_API_ESTIMATED",
      };
    });

    // Unir presets enriquecidos con modelos de la API externa sin duplicar
    const combinedModelsMap = new Map<string, any>();

    matchedPresets.forEach((p: any) => {
      combinedModelsMap.set(p.model.toLowerCase(), { ...p, source: "EV_PRESET" });
    });

    externalModels.forEach((m: any) => {
      const key = m.model.toLowerCase();
      if (!combinedModelsMap.has(key)) {
        combinedModelsMap.set(key, m);
      }
    });

    const finalModels = Array.from(combinedModelsMap.values());

    return NextResponse.json({
      success: true,
      brand,
      count: finalModels.length,
      source: "NHTSA_VPIC_FREE_API",
      data: finalModels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al consultar API externa de vehículos" },
      { status: 500 }
    );
  }
}

/**
 * POST: Importar modelos desde la API externa a la base de datos PostgreSQL
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body; // Array of vehicles to import

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debes enviar un array de modelos a importar" },
        { status: 400 }
      );
    }

    const imported: any[] = [];

    for (const v of items) {
      const vehicle = await prisma.vehicle.create({
        data: {
          brand: v.brand,
          model: v.model,
          year: v.year || v.yearStart || 2024,
          yearStart: v.yearStart || 2022,
          yearEnd: v.yearEnd || 2026,
          batteryKwh: parseFloat(v.batteryKwh) || 60.0,
          realRangeKm: parseInt(v.realRangeKm) || 380,
          wltpRangeKm: parseInt(v.wltpRangeKm) || 420,
          maxAcKw: parseFloat(v.maxAcKw) || 11.0,
          maxDcKw: parseFloat(v.maxDcKw) || 100.0,
          efficiencyKwh100: parseFloat(v.efficiencyKwh100) || 15.0,
          connectorTypes: v.connectorTypes || ["CCS2", "TYPE_2_MENNEKES"],
          imageUrl: v.imageUrl || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
          description: v.description || `${v.brand} ${v.model} 100% Eléctrico`,
        },
      });
      imported.push(vehicle);
    }

    return NextResponse.json({
      success: true,
      message: `¡${imported.length} modelos importados exitosamente al catálogo nacional!`,
      data: imported,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al importar modelos" },
      { status: 500 }
    );
  }
}
