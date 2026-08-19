import { ConnectorType } from "@/types";

// Base de conocimiento enriquecida para vehículos eléctricos comerciales en Colombia / Global
export interface EVModelPreset {
  brand: string;
  model: string;
  batteryKwh: number;
  realRangeKm: number;
  wltpRangeKm: number;
  maxAcKw: number;
  maxDcKw: number;
  efficiencyKwh100: number;
  connectorTypes: ConnectorType[];
  imageUrl?: string;
  description?: string;
  yearStart?: number;
  yearEnd?: number;
}

export const POPULAR_EV_PRESETS: Record<string, EVModelPreset> = {
  // BYD
  "byd-seagull": {
    brand: "BYD",
    model: "Seagull / Dolphin Mini",
    batteryKwh: 38.0,
    realRangeKm: 280,
    wltpRangeKm: 305,
    maxAcKw: 6.6,
    maxDcKw: 40.0,
    efficiencyKwh100: 12.5,
    connectorTypes: ["GB_T_DC", "CCS2", "GB_T_AC"],
    yearStart: 2023,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
    description: "Hatchback urbano ultra eficiente con batería Blade LFP.",
  },
  "byd-dolphin": {
    brand: "BYD",
    model: "Dolphin",
    batteryKwh: 44.9,
    realRangeKm: 310,
    wltpRangeKm: 340,
    maxAcKw: 6.6,
    maxDcKw: 60.0,
    efficiencyKwh100: 13.8,
    connectorTypes: ["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"],
    yearStart: 2022,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
    description: "Hatchback 100% eléctrico superventas en Colombia.",
  },
  "byd-yuan-plus": {
    brand: "BYD",
    model: "Yuan Plus (Atto 3)",
    batteryKwh: 60.48,
    realRangeKm: 400,
    wltpRangeKm: 420,
    maxAcKw: 7.0,
    maxDcKw: 80.0,
    efficiencyKwh100: 15.2,
    connectorTypes: ["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"],
    yearStart: 2022,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    description: "SUV compacto de alta autonomía con plataforma e-Platform 3.0.",
  },
  "byd-seal": {
    brand: "BYD",
    model: "Seal AWD Performance",
    batteryKwh: 82.5,
    realRangeKm: 510,
    wltpRangeKm: 570,
    maxAcKw: 11.0,
    maxDcKw: 150.0,
    efficiencyKwh100: 16.5,
    connectorTypes: ["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"],
    yearStart: 2023,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    description: "Sedán deportivo de alto rendimiento con aceleración 0-100 en 3.8s.",
  },
  "byd-tang": {
    brand: "BYD",
    model: "Tang EV AWD (7 Pasajeros)",
    batteryKwh: 108.8,
    realRangeKm: 505,
    wltpRangeKm: 530,
    maxAcKw: 11.0,
    maxDcKw: 170.0,
    efficiencyKwh100: 21.0,
    connectorTypes: ["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"],
    yearStart: 2021,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    description: "SUV familiar de 7 plazas con tracción integral y batería de 108 kWh.",
  },

  // Tesla
  "tesla-model-3": {
    brand: "Tesla",
    model: "Model 3 Long Range",
    batteryKwh: 78.1,
    realRangeKm: 560,
    wltpRangeKm: 629,
    maxAcKw: 11.0,
    maxDcKw: 250.0,
    efficiencyKwh100: 14.2,
    connectorTypes: ["CCS2", "TESLA_NACS"],
    yearStart: 2019,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    description: "Referente en eficiencia aerodinámica y red de supercargadores.",
  },
  "tesla-model-y": {
    brand: "Tesla",
    model: "Model Y Dual Motor",
    batteryKwh: 78.1,
    realRangeKm: 500,
    wltpRangeKm: 533,
    maxAcKw: 11.0,
    maxDcKw: 250.0,
    efficiencyKwh100: 15.6,
    connectorTypes: ["CCS2", "TESLA_NACS"],
    yearStart: 2020,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    description: "Crossover eléctrico más vendido a nivel mundial.",
  },

  // Renault
  "renault-kwid-etech": {
    brand: "Renault",
    model: "Kwid E-Tech",
    batteryKwh: 26.8,
    realRangeKm: 210,
    wltpRangeKm: 230,
    maxAcKw: 6.6,
    maxDcKw: 30.0,
    efficiencyKwh100: 12.0,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2022,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    description: "Vehículo eléctrico citadino accesible con bajo consumo energético.",
  },
  "renault-megane-etech": {
    brand: "Renault",
    model: "Megane E-Tech EV60",
    batteryKwh: 60.0,
    realRangeKm: 410,
    wltpRangeKm: 450,
    maxAcKw: 22.0,
    maxDcKw: 130.0,
    efficiencyKwh100: 14.8,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2022,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    description: "Crossover premium con carga AC trifásica de 22kW.",
  },

  // Volvo
  "volvo-ex30": {
    brand: "Volvo",
    model: "EX30 Ultra Extended Range",
    batteryKwh: 69.0,
    realRangeKm: 420,
    wltpRangeKm: 476,
    maxAcKw: 22.0,
    maxDcKw: 153.0,
    efficiencyKwh100: 15.7,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2023,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80",
    description: "SUV compacto con diseño escandinavo y gran aceleración.",
  },

  // Zeekr
  "zeekr-001": {
    brand: "Zeekr",
    model: "001 AWD Long Range",
    batteryKwh: 100.0,
    realRangeKm: 580,
    wltpRangeKm: 620,
    maxAcKw: 22.0,
    maxDcKw: 200.0,
    efficiencyKwh100: 17.2,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES", "GB_T_DC"],
    yearStart: 2023,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    description: "Shooting brake de lujo con arquitectura eléctrica de alto voltaje.",
  },
  "zeekr-x": {
    brand: "Zeekr",
    model: "X Urban SUV",
    batteryKwh: 66.0,
    realRangeKm: 390,
    wltpRangeKm: 440,
    maxAcKw: 22.0,
    maxDcKw: 150.0,
    efficiencyKwh100: 15.9,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES", "GB_T_DC"],
    yearStart: 2023,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    description: "SUV premium urbano con interiores personalizables y alta tecnología.",
  },

  // Dongfeng / Nammi
  "dongfeng-box": {
    brand: "Dongfeng",
    model: "Box / Nammi 01",
    batteryKwh: 42.3,
    realRangeKm: 310,
    wltpRangeKm: 330,
    maxAcKw: 6.6,
    maxDcKw: 50.0,
    efficiencyKwh100: 13.2,
    connectorTypes: ["CCS2", "GB_T_DC"],
    yearStart: 2024,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    description: "Hatchback 100% eléctrico compacto con puertas sin marco y gran habitabilidad.",
  },

  // JAC
  "jac-e10x": {
    brand: "JAC",
    model: "E10X",
    batteryKwh: 31.4,
    realRangeKm: 230,
    wltpRangeKm: 260,
    maxAcKw: 6.6,
    maxDcKw: 45.0,
    efficiencyKwh100: 13.0,
    connectorTypes: ["GB_T_DC", "CCS2"],
    yearStart: 2021,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
    description: "Citycar eléctrico con batería LFP y bajo costo de mantenimiento.",
  },

  // MG
  "mg-4": {
    brand: "MG",
    model: "MG4 Electric Standard/Long Range",
    batteryKwh: 64.0,
    realRangeKm: 420,
    wltpRangeKm: 450,
    maxAcKw: 11.0,
    maxDcKw: 135.0,
    efficiencyKwh100: 15.0,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2022,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    description: "Hatchback deportivo de tracción trasera con plataforma modular MSP.",
  },

  // Hyundai / Kia
  "hyundai-ioniq-5": {
    brand: "Hyundai",
    model: "Ioniq 5 AWD Long Range",
    batteryKwh: 77.4,
    realRangeKm: 460,
    wltpRangeKm: 507,
    maxAcKw: 11.0,
    maxDcKw: 230.0,
    efficiencyKwh100: 16.8,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2021,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80",
    description: "Crossover retro-futurista con arquitectura E-GMP de 800V y carga ultrarrápida.",
  },
  "kia-ev6": {
    brand: "Kia",
    model: "EV6 GT-Line",
    batteryKwh: 77.4,
    realRangeKm: 470,
    wltpRangeKm: 528,
    maxAcKw: 11.0,
    maxDcKw: 230.0,
    efficiencyKwh100: 16.5,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2021,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80",
    description: "Crossover aerodinámico con carga del 10% al 80% en 18 minutos.",
  },

  // BMW
  "bmw-ix3": {
    brand: "BMW",
    model: "iX3 M Sport",
    batteryKwh: 80.0,
    realRangeKm: 440,
    wltpRangeKm: 460,
    maxAcKw: 11.0,
    maxDcKw: 150.0,
    efficiencyKwh100: 17.5,
    connectorTypes: ["CCS2", "TYPE_2_MENNEKES"],
    yearStart: 2021,
    yearEnd: 2026,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    description: "SAV premium con tecnología eDrive de 5ª generación y tracción trasera.",
  },
};

/**
 * Consulta la API pública y gratuita de la NHTSA (National Highway Traffic Safety Administration)
 * vPIC API: https://vpic.nhtsa.dot.gov/api/
 */
export async function fetchNhtsaModelsForMake(make: string) {
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(
      make
    )}?format=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.Results || !Array.isArray(data.Results)) return [];

    return data.Results.map((item: any) => ({
      makeId: item.Make_ID,
      makeName: item.Make_Name,
      modelId: item.Model_ID,
      modelName: item.Model_Name,
    }));
  } catch (error) {
    console.error("Error consultando NHTSA vPIC API:", error);
    return [];
  }
}
