"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  MapPin,
  Compass,
  Wrench,
  BookOpen,
  Car,
  ShieldCheck,
  BatteryCharging,
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Mountain,
  Users,
  CheckCircle2,
  Activity,
  Sliders,
  PlusCircle,
  Clock,
  Gauge,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectorBadge } from "@/components/connector-badge";
import { ColombiaMap } from "@/components/map/colombia-map";
import { TripLoggerModal } from "@/components/routes/trip-logger-modal";
import { RouteItem, ChargingStationItem, VehicleItem } from "@/types";

export default function HomePage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [stations, setStations] = useState<ChargingStationItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>("ALL");
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCommunityData = async () => {
    try {
      const [routesRes, stationsRes, vehRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/stations"),
        fetch("/api/vehicles"),
      ]);

      const routesData = await routesRes.json();
      const stationsData = await stationsRes.json();
      const vehData = await vehRes.json();

      if (routesData.success) {
        setRoutes(routesData.data);
        if (routesData.data.length > 0) {
          setSelectedRoute(routesData.data[0]);
        }
      }
      if (stationsData.success) setStations(stationsData.data);
      if (vehData.success) setVehicles(vehData.data);
    } catch (err) {
      console.error("Error fetching homepage data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const filteredRoutes = routes.filter((r) => {
    if (filterBrand === "ALL") return true;
    return r.vehicleUsed?.brand?.toLowerCase() === filterBrand.toLowerCase() ||
           r.title.toLowerCase().includes(filterBrand.toLowerCase());
  });

  const totalCommunityKm = routes.reduce((acc, r) => acc + (r.distanceKm || 0), 0);
  const avgEfficiency = routes.length > 0
    ? (routes.reduce((acc, r) => acc + (r.realEfficiency || r.avgConsumption || 15.0), 0) / routes.length).toFixed(1)
    : "15.4";

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:py-20 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-background via-slate-900/30 to-background">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-cyan-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Action */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Telemetría Comunitaria en Vivo • Datos 100% Reales de Propietarios</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-foreground">
                Consumos Reales, Rutas y Cargas EV en{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Colombia
                </span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Descubre cuánta batería consume realmente cada vehículo eléctrico en la topografía andina. Registra tus viajes paso a paso (salida, paradas de carga, modo de manejo y llegada) y ayuda a calcular promedios auténticos apoyados en OpenRoute.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  size="lg"
                  variant="electric"
                  onClick={() => setIsTripModalOpen(true)}
                  className="gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  Registrar Mi Viaje Real (Bitácora EV)
                </Button>

                <Link href="/rutas">
                  <Button size="lg" variant="outline" className="gap-2 text-sm font-semibold">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    Explorador 3D de Rutas
                  </Button>
                </Link>

                <Link href="/electrolineras">
                  <Button size="lg" variant="outline" className="gap-2 text-sm font-semibold">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Mapa de Carga
                  </Button>
                </Link>
              </div>

              {/* Community Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black font-mono-spec text-emerald-400">
                    {totalCommunityKm.toLocaleString("es-CO")} km
                  </p>
                  <p className="text-[11px] text-muted-foreground font-semibold">Recorridos Registrados</p>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono-spec text-cyan-400">
                    {avgEfficiency} <span className="text-xs">kWh/100km</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-semibold">Eficiencia Media Real</p>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono-spec text-amber-400">
                    {stations.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-semibold">Electrolineras DC/AC</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Colombia Topographic Map */}
            <div className="lg:col-span-5">
              <ColombiaMap
                routes={routes}
                stations={stations}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
                heightClass="h-[480px]"
                show3DControl={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL COMMUNITY TRIPS STREAM */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
              <Activity className="w-4 h-4" />
              Bitácoras Reales de la Comunidad
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground mt-1">
              Últimos Trayectos Registrados por Propietarios
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Haz clic en cualquier trayecto para ver la telemetría detallada de consumo, paradas de carga y perfil de elevación.
            </p>
          </div>

          {/* Quick Filter by Brand */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "BYD", "Tesla", "Renault", "Volvo", "Zeekr"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setFilterBrand(b)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filterBrand === b
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:text-white"
                }`}
              >
                {b === "ALL" ? "Todos los Carros" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            return (
              <Card
                key={route.id}
                onClick={() => {
                  setSelectedRoute(route);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
                className={`cursor-pointer transition-all p-5 flex flex-col justify-between hover:border-emerald-500/50 ${
                  isSelected ? "border-emerald-500 shadow-lg shadow-emerald-500/10 bg-emerald-500/5" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block font-heading">
                        {route.originCity} ➔ {route.destinationCity}
                      </span>
                      <h3 className="text-base font-bold font-heading text-foreground mt-0.5">
                        {route.title}
                      </h3>
                    </div>
                    <Badge variant="default" className="text-[10px] shrink-0">
                      {route.vehicleUsed?.brand || "EV"} {route.vehicleUsed?.model || ""}
                    </Badge>
                  </div>

                  {/* Telemetry Gauge Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono-spec">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Batería SoC</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {route.startSoc || 95}% ➔ {route.endSoc || 42}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Consumo Neto</span>
                      <span className="text-xs font-bold text-cyan-400">
                        {route.actualKwhUsed || 24.5} kWh
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Eficiencia</span>
                      <span className="text-xs font-bold text-amber-400">
                        {route.realEfficiency || route.avgConsumption || 16.5} <span className="text-[9px]">kWh/100k</span>
                      </span>
                    </div>
                  </div>

                  {/* Driving Mode & Climate Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <Badge variant="secondary" className="text-[10px]">
                      Modo {route.drivingMode || "Normal"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {route.climateActive ? "A/C Encendido" : "A/C Apagado"}
                    </Badge>
                    <span className="text-xs font-mono-spec">
                      • {route.distanceKm} km en {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
                    </span>
                  </div>

                  {/* Road comments */}
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    &quot;{route.description}&quot;
                  </p>

                  {/* Charging stop info */}
                  {route.chargingTelemetry && (route.chargingTelemetry as any).length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-emerald-400 font-mono-spec flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Paró a recargar en: {(route.chargingTelemetry as any).map((s: any) => s.stationName).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Subido por: <strong>{route.createdBy?.name || "Propietario VE"}</strong>
                  </span>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                    Ver en Mapa 3D <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. BENCHMARK TABLE: CONSUMOS REALES EN CARRETERAS COLOMBIANAS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-heading">
            <Gauge className="w-4 h-4" />
            Tabla Comparativa de Telemetría Real
          </div>
          <h2 className="text-2xl font-black font-heading text-foreground">
            Promedios de Consumo Real en Carreteras de Colombia
          </h2>
          <p className="text-xs text-muted-foreground">
            Basado en bitácoras auténticas registradas por la comunidad en subidas andinas, autopistas y descensos con regeneración.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-300 font-heading font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Vehículo</th>
                  <th className="p-4">Batería Pack</th>
                  <th className="p-4">Consumo Medio Real</th>
                  <th className="p-4">Autonomía Real Carretera</th>
                  <th className="p-4">Carga DC Soportada</th>
                  <th className="p-4">Conectores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono-spec">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-sans font-bold text-foreground flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <span>{v.brand} {v.model}</span>
                        <span className="block text-[10px] text-slate-500 font-normal">{v.yearStart || 2023} - {v.yearEnd || 2026}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-bold">{v.batteryKwh} kWh</td>
                    <td className="p-4 text-emerald-400 font-bold">{v.efficiencyKwh100 || 15.0} kWh/100km</td>
                    <td className="p-4 text-cyan-400 font-bold">{v.realRangeKm} km reales</td>
                    <td className="p-4 text-white">{v.maxDcKw} kW DC</td>
                    <td className="p-4 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {v.connectorTypes?.map((c: any, i: number) => (
                          <ConnectorBadge key={i} type={c} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. MODAL DE BITÁCORA / REGISTRO DE VIAJE REAL */}
      <TripLoggerModal
        open={isTripModalOpen}
        onOpenChange={setIsTripModalOpen}
        onTripLogged={fetchCommunityData}
      />
    </div>
  );
}
