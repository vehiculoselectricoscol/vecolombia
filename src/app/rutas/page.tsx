"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { ColombiaMap } from "@/components/map/colombia-map";
import { ElevationChart } from "@/components/map/elevation-chart";
import { TripLoggerModal } from "@/components/routes/trip-logger-modal";
import { calculateEVRoute } from "@/lib/routing/routeService";
import { RouteItem, VehicleItem } from "@/types";
import { toast } from "sonner";

const COLOMBIAN_CITIES = [
  { name: "Bogotá, D.C.", lat: 4.6097, lng: -74.0817 },
  { name: "Tunja, Boyacá", lat: 5.5353, lng: -73.3678 },
  { name: "Medellín, Antioquia", lat: 6.2442, lng: -75.5812 },
  { name: "Cali, Valle del Cauca", lat: 3.4516, lng: -76.532 },
  { name: "Pereira, Risaralda", lat: 4.8133, lng: -75.6961 },
  { name: "Ibagué, Tolima", lat: 4.4389, lng: -75.2322 },
  { name: "Girardot, Cundinamarca", lat: 4.305, lng: -74.8017 },
  { name: "Bucaramanga, Santander", lat: 7.1193, lng: -73.1227 },
  { name: "Barranquilla, Atlántico", lat: 10.9685, lng: -74.7813 },
];

export default function RutasPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  // Live Simulator States
  const [originCityName, setOriginCityName] = useState(COLOMBIAN_CITIES[0].name);
  const [destCityName, setDestCityName] = useState(COLOMBIAN_CITIES[1].name);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [initialSoc, setInitialSoc] = useState(95);
  const [simulatedRoute, setSimulatedRoute] = useState<any>(null);

  const fetchRoutesAndVehicles = async () => {
    try {
      const [routesRes, vehRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/vehicles"),
      ]);

      const routesData = await routesRes.json();
      const vehData = await vehRes.json();

      if (routesData.success && routesData.data.length > 0) {
        setRoutes(routesData.data);
        setSelectedRoute(routesData.data[0]);
      }
      if (vehData.success && vehData.data.length > 0) {
        setVehicles(vehData.data);
        setSelectedVehicleId(vehData.data[0].id);
      }
    } catch {
      toast.error("Error al cargar rutas y vehículos");
    }
  };

  useEffect(() => {
    fetchRoutesAndVehicles();
  }, []);

  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const originCity = COLOMBIAN_CITIES.find((c) => c.name === originCityName) || COLOMBIAN_CITIES[0];
  const destCity = COLOMBIAN_CITIES.find((c) => c.name === destCityName) || COLOMBIAN_CITIES[1];

  useEffect(() => {
    async function runCalc() {
      if (!currentVehicle) return;
      try {
        const res = await calculateEVRoute({
          origin: { lat: originCity.lat, lng: originCity.lng, name: originCity.name },
          destination: { lat: destCity.lat, lng: destCity.lng, name: destCity.name },
          vehicleSpecs: {
            batteryCapacityKwh: currentVehicle.batteryKwh,
            efficiencyKwh100: currentVehicle.efficiencyKwh100 || 15.0,
            maxDcKw: currentVehicle.maxDcKw,
          },
          initialSocPercent: initialSoc,
        });
        setSimulatedRoute(res);
      } catch (err) {
        console.error("Error calculating simulation", err);
      }
    }
    runCalc();
  }, [originCity, destCity, currentVehicle, initialSoc]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Compass className="w-4 h-4" />
            Planificador Topográfico & Rutas Comunitarias
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Rutas 3D & Telemetría Real de Viajes EV
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explora las bitácoras reales compartidas por propietarios en Colombia o simula un nuevo trayecto con cálculo de regeneración andina y OpenRoute.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsTripModalOpen(true)}
          className="gap-2 font-bold shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Mi Viaje Real (Bitácora EV)
        </Button>
      </div>

      {/* Main Map & Interactive Route Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Map */}
        <div className="lg:col-span-8 space-y-4">
          <ColombiaMap
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            heightClass="h-[520px]"
            show3DControl={true}
          />

          {/* Elevation Profile if route is selected */}
          {selectedRoute && (
            <Card className="p-5 border-emerald-500/20 bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold font-heading text-white">
                    Perfil Altimétrico 3D: {selectedRoute.originCity} ➔ {selectedRoute.destinationCity}
                  </h3>
                </div>
                <Badge variant="secondary" className="font-mono-spec text-xs">
                  +{selectedRoute.elevationGainM || 1150}m Desnivel Acumulado
                </Badge>
              </div>

              <ElevationChart
                title={`Perfil: ${selectedRoute.title}`}
                data={
                  selectedRoute.elevationProfile && selectedRoute.elevationProfile.length > 0
                    ? selectedRoute.elevationProfile
                    : [
                        { distanceKm: 0, elevationM: 2640, batterySocPercent: selectedRoute.startSoc || 95 },
                        { distanceKm: Math.round(selectedRoute.distanceKm * 0.3), elevationM: 2750, batterySocPercent: (selectedRoute.startSoc || 95) - 15 },
                        { distanceKm: Math.round(selectedRoute.distanceKm * 0.7), elevationM: 2600, batterySocPercent: (selectedRoute.startSoc || 95) - 30 },
                        { distanceKm: selectedRoute.distanceKm, elevationM: 2820, batterySocPercent: selectedRoute.endSoc || 42 },
                      ]
                }
              />
            </Card>
          )}
        </div>

        {/* Right: Selected Route Telemetry & Live Calculator */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Community Route Card */}
          {selectedRoute && (
            <Card className="p-5 border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block font-heading">
                    Telemetría del Trayecto
                  </span>
                  <h3 className="text-base font-bold font-heading text-white mt-0.5">
                    {selectedRoute.title}
                  </h3>
                </div>
                <Badge variant="default" className="text-xs">
                  {selectedRoute.vehicleUsed?.brand} {selectedRoute.vehicleUsed?.model}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono-spec text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Distancia</span>
                  <span className="text-base font-black text-white">{selectedRoute.distanceKm} km</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Batería</span>
                  <span className="text-base font-black text-emerald-400">
                    {selectedRoute.startSoc || 95}% ➔ {selectedRoute.endSoc || 42}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Consumo Neto</span>
                  <span className="text-base font-black text-cyan-400">{selectedRoute.actualKwhUsed || 23.8} kWh</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Eficiencia</span>
                  <span className="text-base font-black text-amber-400">{selectedRoute.realEfficiency || 17.2} <span className="text-[9px]">kWh/100k</span></span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Modo de Manejo:</strong> Modo {selectedRoute.drivingMode || "Normal"} • {selectedRoute.climateActive ? "A/C Encendido" : "A/C Apagado"}
                </p>
                <p className="text-slate-400 italic">
                  &quot;{selectedRoute.description}&quot;
                </p>
                {selectedRoute.chargingTelemetry && (selectedRoute.chargingTelemetry as any).length > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono-spec text-[11px]">
                    ⚡ Paradas de carga: {(selectedRoute.chargingTelemetry as any).map((s: any) => `${s.stationName} (+${s.kwhCharged} kWh)`).join(", ")}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Quick Route Estimator */}
          {currentVehicle && (
            <Card className="p-5 border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-heading text-white">
                  Simulador de Ruta Rápida (OpenRoute)
                </h3>
              </div>

              <div className="space-y-3">
                <Select
                  label="Origen"
                  value={originCityName}
                  onChange={(e) => setOriginCityName(e.target.value)}
                >
                  {COLOMBIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Destino"
                  value={destCityName}
                  onChange={(e) => setDestCityName(e.target.value)}
                >
                  {COLOMBIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Vehículo"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.batteryKwh} kWh)
                    </option>
                  ))}
                </Select>

                <Slider
                  label="Batería al Salir (% SoC)"
                  value={initialSoc}
                  min={20}
                  max={100}
                  step={5}
                  onChange={setInitialSoc}
                  valueDisplay={`${initialSoc}%`}
                />

                {simulatedRoute && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono-spec space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distancia Estimada:</span>
                      <strong className="text-white">{simulatedRoute.distanceKm?.toFixed(1)} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Batería al Llegar:</span>
                      <strong className={simulatedRoute.finalSocPercent > 20 ? "text-emerald-400" : "text-red-400"}>
                        {simulatedRoute.finalSocPercent?.toFixed(0)}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Community Routes Cards Grid */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-foreground">
            Todas las Rutas & Bitácoras de la Comunidad ({routes.length})
          </h2>
          <Button variant="electric" size="sm" onClick={() => setIsTripModalOpen(true)} className="text-xs font-bold gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            Publicar Mi Bitácora
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Card
              key={route.id}
              onClick={() => {
                setSelectedRoute(route);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="cursor-pointer p-5 flex flex-col justify-between hover:border-emerald-500 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                      {route.originCity} ➔ {route.destinationCity}
                    </span>
                    <h3 className="text-base font-bold font-heading text-foreground group-hover:text-emerald-400 transition-colors">
                      {route.title}
                    </h3>
                  </div>
                  <Badge variant="default" className="text-[10px]">
                    {route.vehicleUsed?.brand || "EV"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono-spec text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Batería</span>
                    <span className="font-bold text-emerald-400">{route.startSoc || 95}% ➔ {route.endSoc || 42}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Consumo</span>
                    <span className="font-bold text-cyan-400">{route.actualKwhUsed || 24} kWh</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Eficiencia</span>
                    <span className="font-bold text-amber-400">{route.realEfficiency || 17}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  &quot;{route.description}&quot;
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{route.distanceKm} km • {route.durationMinutes} min</span>
                <span className="text-emerald-400 font-bold">Ver Detalles ➔</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bitácora Modal */}
      <TripLoggerModal
        open={isTripModalOpen}
        onOpenChange={setIsTripModalOpen}
        onTripLogged={fetchRoutesAndVehicles}
      />
    </div>
  );
}
