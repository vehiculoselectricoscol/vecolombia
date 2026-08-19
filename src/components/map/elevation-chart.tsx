"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ElevationPoint } from "@/types";
import { Mountain, BatteryCharging, Zap } from "lucide-react";

interface ElevationChartProps {
  data: ElevationPoint[];
  title?: string;
  className?: string;
}

export function ElevationChart({
  data,
  title = "Perfil Topográfico & Regeneración de Batería",
  className,
}: ElevationChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className={`rounded-2xl bg-card border border-slate-200 dark:border-slate-800 p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <Mountain className="w-4 h-4 text-emerald-500" />
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">
            Visualiza ascensos de cordillera, valles y zonas de frenado regenerativo en Colombia.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-spec">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span>Altitud (msnm)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-1 bg-cyan-400 rounded-full" />
            <span>Batería SoC (%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="distanceKm"
              unit=" km"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              yAxisId="elev"
              unit="m"
              stroke="#10b981"
              fontSize={11}
              domain={[0, "auto"]}
              tickLine={false}
            />
            <YAxis
              yAxisId="soc"
              orientation="right"
              unit="%"
              stroke="#06b6d4"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as ElevationPoint;
                  return (
                    <div className="rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 shadow-xl text-xs space-y-1">
                      {p.locationName && (
                        <p className="font-bold text-white border-b border-slate-700 pb-1">
                          {p.locationName}
                        </p>
                      )}
                      <p className="text-slate-300">
                        Distancia: <span className="font-mono-spec font-bold text-white">{p.distanceKm} km</span>
                      </p>
                      <p className="text-emerald-400">
                        Altitud: <span className="font-mono-spec font-bold">{p.elevationM} msnm</span>
                      </p>
                      {p.batterySocPercent !== undefined && (
                        <p className="text-cyan-400">
                          Batería estimada:{" "}
                          <span className="font-mono-spec font-bold">{p.batterySocPercent}%</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              yAxisId="elev"
              type="monotone"
              dataKey="elevationM"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorElevation)"
              name="Altitud"
            />
            <Area
              yAxisId="soc"
              type="monotone"
              dataKey="batterySocPercent"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorSoc)"
              name="Batería"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-slate-200 dark:border-slate-800/80 pt-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-500" />
          <span>Frenado regenerativo activo en descensos de cordillera</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modelo de consumo andino calibrado para Colombia</span>
        </div>
      </div>
    </div>
  );
}
