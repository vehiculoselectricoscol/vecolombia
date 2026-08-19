"use client";

import React, { useState } from "react";
import { ChargingStationItem, RouteItem } from "@/types";
import { Zap, MapPin, Navigation, Eye, Layers, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ColombiaMapProps {
  stations?: ChargingStationItem[];
  selectedRoute?: RouteItem | null;
  onSelectStation?: (station: ChargingStationItem) => void;
  heightClass?: string;
  show3DControl?: boolean;
}

export function ColombiaMap({
  stations = [],
  selectedRoute = null,
  onSelectStation,
  heightClass = "h-[500px]",
  show3DControl = true,
}: ColombiaMapProps) {
  const [is3DMode, setIs3DMode] = useState(true);
  const [activeStation, setActiveStation] = useState<ChargingStationItem | null>(null);

  // Colombian Major Hubs Coordinates for interactive projection
  // Lat: 0.5 to 12.5 (N), Lng: -79 to -70 (W)
  const mapBounds = {
    minLat: 1.0,
    maxLat: 11.5,
    minLng: -78.5,
    maxLng: -71.5,
  };

  // Convert GPS coordinates to percentage relative to container
  const getPositionStyle = (lat: number, lng: number) => {
    const top = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 88 + 6;
    const left = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 88 + 6;
    return {
      top: `${Math.min(94, Math.max(6, top))}%`,
      left: `${Math.min(94, Math.max(6, left))}%`,
    };
  };

  const cities = [
    { name: "Bogotá, D.C.", lat: 4.6097, lng: -74.0817, alt: "2.640m" },
    { name: "Medellín", lat: 6.2442, lng: -75.5812, alt: "1.495m" },
    { name: "Cali", lat: 3.4516, lng: -76.532, alt: "995m" },
    { name: "Barranquilla", lat: 10.9685, lng: -74.7813, alt: "18m" },
    { name: "Bucaramanga", lat: 7.1193, lng: -73.1227, alt: "959m" },
    { name: "Pereira", lat: 4.8133, lng: -75.6961, alt: "1.411m" },
    { name: "Ibagué", lat: 4.4389, lng: -75.2322, alt: "1.285m" },
  ];

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500`}
    >
      {/* 3D Perspective Canvas Container */}
      <div
        className={`w-full h-full relative transition-all duration-700 ease-out ${
          is3DMode ? "perspective-[1000px]" : ""
        }`}
      >
        <div
          className={`w-full h-full relative transition-transform duration-700 ${
            is3DMode ? "rotate-x-[24deg] scale-[0.98] -translate-y-2" : ""
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%),
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 35px 35px, 35px 35px",
          }}
        >
          {/* Topographic Contours & Colombia Outline Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-30">
            <svg
              viewBox="0 0 500 650"
              className="w-[85%] h-[85%] stroke-emerald-500 fill-emerald-950/20"
              strokeWidth="1.5"
            >
              {/* Simplified Colombia Shape */}
              <path
                d="M 230 40 
                   Q 260 50 310 110 
                   Q 330 160 300 230 
                   Q 350 280 430 310 
                   Q 440 370 380 440 
                   Q 350 560 280 620 
                   Q 230 630 190 560 
                   Q 150 490 100 450 
                   Q 70 390 90 320 
                   Q 70 230 120 180 
                   Q 160 140 210 110 Z"
              />
              {/* Cordilleras (Andes) */}
              <path
                d="M 120 460 Q 180 320 220 180"
                stroke="#06b6d4"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 160 460 Q 220 300 250 160"
                stroke="#10b981"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 190 460 Q 260 290 290 170"
                stroke="#06b6d4"
                strokeDasharray="4 4"
                fill="none"
              />
            </svg>
          </div>

          {/* Selected Route Polyline (if any) */}
          {selectedRoute && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>
              {selectedRoute.waypoints && selectedRoute.waypoints.length > 1 && (
                <polyline
                  points={selectedRoute.waypoints
                    .map((w) => {
                      const pos = getPositionStyle(w.latitude, w.longitude);
                      const topNum = (parseFloat(pos.top) / 100) * 500;
                      const leftNum = (parseFloat(pos.left) / 100) * 700;
                      return `${leftNum},${topNum}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              )}
            </svg>
          )}

          {/* Major Cities Pins */}
          {cities.map((city) => {
            const pos = getPositionStyle(city.lat, city.lng);
            return (
              <div
                key={city.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={pos}
              >
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-900 group-hover:scale-150 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur-sm mt-1 whitespace-nowrap border border-slate-800">
                    {city.name}
                  </span>
                  <span className="text-[8px] font-mono-spec text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {city.alt}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Charging Stations Pins */}
          {stations.map((st) => {
            const pos = getPositionStyle(st.latitude, st.longitude);
            const hasFastDC = st.connectors.some(
              (c) => (c.type === "CCS2" || c.type === "GB_T_DC") && c.powerKw >= 50
            );

            return (
              <div
                key={st.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                style={pos}
                onClick={() => {
                  setActiveStation(st);
                  onSelectStation?.(st);
                }}
              >
                {/* Ping animation for high-power DC stations */}
                {hasFastDC && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 animate-ping" />
                )}

                <div
                  className={`relative flex items-center justify-center w-7 h-7 rounded-xl shadow-lg transition-all duration-200 group-hover:scale-125 ${
                    hasFastDC
                      ? "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/40"
                      : "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/40"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {show3DControl && (
          <Button
            size="sm"
            variant={is3DMode ? "electric" : "outline"}
            className="text-xs h-8 gap-1.5 shadow-lg backdrop-blur-md"
            onClick={() => setIs3DMode(!is3DMode)}
          >
            <Compass className="w-3.5 h-3.5" />
            {is3DMode ? "Vista 3D Andina" : "Vista 2D Plana"}
          </Button>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-40 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 space-y-1.5 shadow-xl max-w-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
          Red Nacional VE Colombia
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-[11px]">DC Rápida (50-150 kW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-[11px]">AC Media (7-22 kW)</span>
          </div>
        </div>
      </div>

      {/* Active Station Popover Detail */}
      {activeStation && (
        <div className="absolute top-4 left-4 z-40 bg-slate-900/95 backdrop-blur-lg border border-emerald-500/40 rounded-2xl p-4 text-xs text-white shadow-2xl max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div>
              <span className="text-[10px] font-mono-spec font-bold text-emerald-400 uppercase tracking-wider">
                {activeStation.operator}
              </span>
              <h4 className="text-sm font-bold font-heading text-white">{activeStation.name}</h4>
              <p className="text-[11px] text-slate-400">{activeStation.city}, {activeStation.department}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStation(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {activeStation.connectors.map((c, i) => (
                <Badge key={i} variant="fastCharge" className="text-[10px]">
                  {c.type} • {c.powerKw} kW
                </Badge>
              ))}
            </div>

            {activeStation.priceInfo && (
              <p className="text-[11px] text-slate-300">
                Tarifa: <span className="font-semibold text-emerald-400">{activeStation.priceInfo}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                ⭐ {activeStation.rating.toFixed(1)} ({activeStation.reviewsCount} reseñas)
              </span>
              <Button
                size="sm"
                variant="electric"
                className="h-7 text-xs font-semibold"
                onClick={() => onSelectStation?.(activeStation)}
              >
                Ver Ficha & Check-in
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
