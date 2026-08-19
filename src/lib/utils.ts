import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ConnectorType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export interface ConnectorInfo {
  label: string;
  short: string;
  type: "AC" | "DC";
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  standardRegion: string;
}

export const CONNECTOR_METADATA: Record<ConnectorType, ConnectorInfo> = {
  CCS2: {
    label: "Combo 2 (CCS2)",
    short: "CCS2 DC",
    type: "DC",
    description: "Carga rápida estándar europea. Muy común en Colombia (BYD, Renault, BMW, Hyundai).",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-950/40",
    borderClass: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    textClass: "text-emerald-600 dark:text-emerald-400",
    standardRegion: "Europa / Colombia",
  },
  GB_T_DC: {
    label: "GB/T (DC)",
    short: "GB/T DC",
    type: "DC",
    description: "Carga rápida estándar chino (BYD importación directa, Changan, JAC, Chery).",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-950/40",
    borderClass: "border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    textClass: "text-cyan-600 dark:text-cyan-400",
    standardRegion: "China",
  },
  TYPE_2_MENNEKES: {
    label: "Tipo 2 (Mennekes)",
    short: "Tipo 2 AC",
    type: "AC",
    description: "Carga lenta/semi-rápida AC estándar europeo (hasta 22 kW).",
    bgClass: "bg-blue-500/10 dark:bg-blue-950/40",
    borderClass: "border-blue-500/30 text-blue-600 dark:text-blue-400",
    textClass: "text-blue-600 dark:text-blue-400",
    standardRegion: "Europa / Global",
  },
  TYPE_1_J1772: {
    label: "Tipo 1 (J1772)",
    short: "Tipo 1 AC",
    type: "AC",
    description: "Carga lenta AC estándar americano/japonés (Nissan Leaf, Chevrolet Bolt, Kia antiguos).",
    bgClass: "bg-amber-500/10 dark:bg-amber-950/40",
    borderClass: "border-amber-500/30 text-amber-600 dark:text-amber-400",
    textClass: "text-amber-600 dark:text-amber-400",
    standardRegion: "Norteamérica / Japón",
  },
  CCS1: {
    label: "Combo 1 (CCS1)",
    short: "CCS1 DC",
    type: "DC",
    description: "Carga rápida DC estándar americano (Chevrolet Bolt EUV, Ford Mustang Mach-E USA).",
    bgClass: "bg-purple-500/10 dark:bg-purple-950/40",
    borderClass: "border-purple-500/30 text-purple-600 dark:text-purple-400",
    textClass: "text-purple-600 dark:text-purple-400",
    standardRegion: "Norteamérica",
  },
  GB_T_AC: {
    label: "GB/T (AC)",
    short: "GB/T AC",
    type: "AC",
    description: "Carga lenta AC estándar chino (Wallboxes para BYD chinos, E10X, etc.).",
    bgClass: "bg-teal-500/10 dark:bg-teal-950/40",
    borderClass: "border-teal-500/30 text-teal-600 dark:text-teal-400",
    textClass: "text-teal-600 dark:text-teal-400",
    standardRegion: "China",
  },
  CHADEMO: {
    label: "CHAdeMO",
    short: "CHAdeMO DC",
    type: "DC",
    description: "Carga rápida DC japonesa (Nissan Leaf 1ra y 2da gen, Mitsubishi Outlander PHEV).",
    bgClass: "bg-rose-500/10 dark:bg-rose-950/40",
    borderClass: "border-rose-500/30 text-rose-600 dark:text-rose-400",
    textClass: "text-rose-600 dark:text-rose-400",
    standardRegion: "Japón",
  },
  TESLA_NACS: {
    label: "Tesla / NACS",
    short: "NACS / Tesla",
    type: "DC",
    description: "Supercargadores y cargadores de destino Tesla.",
    bgClass: "bg-red-500/10 dark:bg-red-950/40",
    borderClass: "border-red-500/30 text-red-600 dark:text-red-400",
    textClass: "text-red-600 dark:text-red-400",
    standardRegion: "Tesla / Global",
  },
};

/**
 * Calculates battery consumption adjusting for Colombian mountain elevation.
 * In Colombia, crossing mountain passes (La Línea, Alto de Letras) increases consumption on ascents,
 * but allows 60-70% regenerative braking recovery on descents.
 */
export function calculateEVEnergy({
  distanceKm,
  elevationGainM = 0,
  elevationLossM = 0,
  baseEfficiencyKwh100 = 15.5,
  batteryCapacityKwh = 60,
  initialSocPercent = 100,
}: {
  distanceKm: number;
  elevationGainM?: number;
  elevationLossM?: number;
  baseEfficiencyKwh100?: number;
  batteryCapacityKwh?: number;
  initialSocPercent?: number;
}) {
  // Flat terrain base consumption
  const flatConsumptionKwh = (distanceKm * baseEfficiencyKwh100) / 100;

  // Potential energy: m * g * h / 3.6e6 kWh (approx. 0.005 kWh per 100m elevation gain for a ~1800kg EV)
  const climbConsumptionKwh = (elevationGainM / 100) * 0.052;

  // Regenerative braking recovery (descents recover ~65% of potential energy)
  const regenRecoveredKwh = (elevationLossM / 100) * 0.034;

  const totalKwhNeeded = Math.max(0, flatConsumptionKwh + climbConsumptionKwh - regenRecoveredKwh);
  const finalSocPercent = Math.max(0, initialSocPercent - (totalKwhNeeded / batteryCapacityKwh) * 100);
  const remainingRangeKm = (batteryCapacityKwh * (finalSocPercent / 100) * 100) / baseEfficiencyKwh100;
  const requiresChargeStop = finalSocPercent < 15;

  return {
    totalKwhNeeded: Number(totalKwhNeeded.toFixed(1)),
    finalSocPercent: Math.round(finalSocPercent),
    remainingRangeKm: Math.round(remainingRangeKm),
    requiresChargeStop,
    regenRecoveredKwh: Number(regenRecoveredKwh.toFixed(1)),
    climbExtraKwh: Number(climbConsumptionKwh.toFixed(1)),
  };
}

/**
 * Estimates charging time (in minutes) based on battery size, SoC, and station kW
 */
export function estimateChargingMinutes({
  batteryKwh,
  fromSoc,
  toSoc = 80,
  chargerKw,
  maxCarKw,
}: {
  batteryKwh: number;
  fromSoc: number;
  toSoc?: number;
  chargerKw: number;
  maxCarKw: number;
}): number {
  if (fromSoc >= toSoc) return 0;
  const effectiveKw = Math.min(chargerKw, maxCarKw) * 0.88; // 88% average power curve efficiency
  const kwhToCharge = (batteryKwh * (toSoc - fromSoc)) / 100;
  const hours = kwhToCharge / effectiveKw;
  return Math.round(hours * 60);
}
