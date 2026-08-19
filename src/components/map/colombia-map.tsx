"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChargingStationItem, RouteItem } from "@/types";
import { Zap, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

interface ColombiaMapProps {
  stations?: ChargingStationItem[];
  routes?: RouteItem[];
  selectedRoute?: RouteItem | null;
  onSelectRoute?: (route: RouteItem) => void;
  onSelectStation?: (station: ChargingStationItem) => void;
  heightClass?: string;
  show3DControl?: boolean;
}

export function ColombiaMap({
  stations = [],
  routes = [],
  selectedRoute = null,
  onSelectRoute,
  onSelectStation,
  heightClass = "h-[560px]",
}: ColombiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapTheme, setMapTheme] = useState<"dark" | "streets" | "topo">("dark");
  const [activeRouteInfo, setActiveRouteInfo] = useState<RouteItem | null>(selectedRoute);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current || !isMounted) return;

      // Prevent re-initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Center of Colombia: Lat 4.5709, Lng -74.2973
      const map = L.map(mapContainerRef.current, {
        center: [4.711, -74.0721],
        zoom: 6.5,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Create Layer Group for markers & routes
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Set Tile Layer
      updateTileLayer(map, L, mapTheme);
      renderMapData(map, L, layerGroup);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      updateTileLayer(mapInstanceRef.current, L.default, mapTheme);
    });
  }, [mapTheme]);

  // Re-render markers and routes when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    import("leaflet").then((L) => {
      renderMapData(mapInstanceRef.current, L.default, layerGroupRef.current);
    });
    if (selectedRoute) {
      setActiveRouteInfo(selectedRoute);
    }
  }, [stations, routes, selectedRoute]);

  const updateTileLayer = (map: any, L: any, theme: "dark" | "streets" | "topo") => {
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let subdomains = "abcd";

    if (theme === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (theme === "streets") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      subdomains = "abc";
    } else if (theme === "topo") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      subdomains = "";
    }

    L.tileLayer(tileUrl, {
      subdomains,
      maxZoom: 19,
    }).addTo(map);
  };

  const renderMapData = (map: any, L: any, layerGroup: any) => {
    layerGroup.clearLayers();

    // 1. Draw Real Community Route Polylines
    routes.forEach((route) => {
      const isSelected = selectedRoute?.id === route.id;
      const originLat = route.originCoords.lat;
      const originLng = route.originCoords.lng;
      const destLat = route.destinationCoords.lat;
      const destLng = route.destinationCoords.lng;

      let polylinePoints: [number, number][] = [];

      if (route.waypoints && Array.isArray(route.waypoints) && route.waypoints.length > 0) {
        // If waypoints exist as coordinate array
        if (Array.isArray(route.waypoints[0])) {
          polylinePoints = route.waypoints as any;
        } else {
          polylinePoints = [
            [originLat, originLng],
            ...(route.waypoints.map((w: any) => [w.latitude || w.lat, w.longitude || w.lng]) as any),
            [destLat, destLng],
          ];
        }
      } else {
        // Direct route vector with curvature for Andean realism
        polylinePoints = [
          [originLat, originLng],
          [(originLat + destLat) / 2 + (originLng > destLng ? 0.05 : -0.05), (originLng + destLng) / 2],
          [destLat, destLng],
        ];
      }

      // Draw glowing polyline
      const polyline = L.polyline(polylinePoints, {
        color: isSelected ? "#10b981" : "#059669",
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 0.95 : 0.6,
        dashArray: isSelected ? undefined : "6, 6",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layerGroup);

      polyline.on("click", () => {
        setActiveRouteInfo(route);
        if (onSelectRoute) onSelectRoute(route);
      });

      // Custom Origin HTML Pin (with start SoC %)
      const originIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            background: #10b981;
            color: #022c22;
            font-family: monospace;
            font-size: 10px;
            font-weight: 900;
            padding: 3px 6px;
            border-radius: 9999px;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
            border: 2px solid #ffffff;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            ⚡ ${route.startSoc || 95}%
          </div>
        `,
        iconSize: [40, 20],
        iconAnchor: [20, 10],
      });

      const originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(layerGroup);
      originMarker.on("click", () => {
        setActiveRouteInfo(route);
        if (onSelectRoute) onSelectRoute(route);
      });

      // Custom Destination HTML Pin (with end SoC %)
      const destIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            background: #06b6d4;
            color: #083344;
            font-family: monospace;
            font-size: 10px;
            font-weight: 900;
            padding: 3px 6px;
            border-radius: 9999px;
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.7);
            border: 2px solid #ffffff;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            🏁 ${route.endSoc || 42}%
          </div>
        `,
        iconSize: [40, 20],
        iconAnchor: [20, 10],
      });

      const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(layerGroup);
      destMarker.on("click", () => {
        setActiveRouteInfo(route);
        if (onSelectRoute) onSelectRoute(route);
      });
    });

    // 2. Draw Verified Charging Stations
    stations.forEach((st) => {
      const stationIcon = L.divIcon({
        className: "custom-station-pin",
        html: `
          <div style="
            background: #047857;
            color: #ffffff;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            border: 2px solid #a7f3d0;
            cursor: pointer;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon }).addTo(layerGroup);
      marker.on("click", () => {
        if (onSelectStation) onSelectStation(st);
      });

      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="font-size: 13px; color: #047857;">${st.name}</strong><br/>
          <span>${st.operator} • ${st.city}</span><br/>
          <span style="font-weight: bold; color: #0284c7;">${st.priceInfo || "Carga Rápida DC"}</span>
        </div>
      `);
    });
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([4.711, -74.0721], 6.5, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300`}
    >
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Layer Selector & Controls */}
      <div className="absolute top-4 right-4 z-[500] flex items-center gap-2">
        <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl">
          <button
            type="button"
            onClick={() => setMapTheme("dark")}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              mapTheme === "dark" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Oscuro
          </button>
          <button
            type="button"
            onClick={() => setMapTheme("streets")}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              mapTheme === "streets" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Calles
          </button>
          <button
            type="button"
            onClick={() => setMapTheme("topo")}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              mapTheme === "topo" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Relieve
          </button>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="h-8 px-2.5 bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-200 hover:bg-slate-800"
          title="Centrar Colombia"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
        </Button>
      </div>

      {/* Live Telemetry Overlay Card for Selected Route */}
      {activeRouteInfo && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[500] rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-heading">
                  Ruta Comunitaria en Colombia
                </span>
              </div>
              <h3 className="text-sm font-bold font-heading text-white mt-0.5">
                {activeRouteInfo.originCity} ➔ {activeRouteInfo.destinationCity}
              </h3>
            </div>

            <Badge variant="default" className="text-[10px] shrink-0">
              {activeRouteInfo.vehicleUsed?.brand || "EV"} {activeRouteInfo.vehicleUsed?.model || ""}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-spec">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Distancia</span>
              <span className="font-bold text-white">{activeRouteInfo.distanceKm} km</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Batería</span>
              <span className="font-bold text-emerald-400">
                {activeRouteInfo.startSoc || 95}% ➔ {activeRouteInfo.endSoc || 42}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Consumo</span>
              <span className="font-bold text-cyan-400">{activeRouteInfo.actualKwhUsed || 24.5} kWh</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Eficiencia</span>
              <span className="font-bold text-amber-400">{activeRouteInfo.realEfficiency || 16.8}</span>
            </div>
          </div>

          {activeRouteInfo.description && (
            <p className="text-[11px] text-slate-300 italic line-clamp-2">
              &quot;{activeRouteInfo.description}&quot;
            </p>
          )}

          {activeRouteInfo.chargingTelemetry && (activeRouteInfo.chargingTelemetry as any).length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono-spec">
              <Zap className="w-3 h-3" />
              Recarga en: {(activeRouteInfo.chargingTelemetry as any).map((s: any) => s.stationName).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
