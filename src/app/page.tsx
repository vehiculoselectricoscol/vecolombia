"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectorBadge } from "@/components/connector-badge";
import { ColombiaMap } from "@/components/map/colombia-map";
import { ElevationChart } from "@/components/map/elevation-chart";
import {
  INITIAL_STATIONS,
  INITIAL_ROUTES,
  INITIAL_WORKSHOPS,
  INITIAL_MANUALS,
  INITIAL_VEHICLES,
} from "@/lib/data/seed-data";
import { ConnectorType } from "@/types";

export default function HomePage() {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | "ALL">("ALL");
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const currentRoute = INITIAL_ROUTES[activeRouteIndex];

  const filteredStations =
    selectedConnector === "ALL"
      ? INITIAL_STATIONS
      : INITIAL_STATIONS.filter((st) =>
          st.connectors.some((c) => c.type === selectedConnector)
        );

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-background via-slate-900/20 to-background">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Copy & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>La Red de Movilidad Eléctrica más Confiable de Colombia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-foreground">
                Conduce, Carga y Comparte sin Límites en{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Colombia
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Plataforma comunitaria para propietarios de carros eléctricos. Planifica rutas 3D con cálculo de regeneración andina, encuentra electrolineras verificadas (CCS2, GB/T), talleres de alta tensión y manuales técnicos.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/rutas">
                  <Button size="lg" variant="electric" className="gap-2 text-sm">
                    <Compass className="w-4 h-4" />
                    Explorar Rutas 3D & Elevación
                  </Button>
                </Link>
                <Link href="/electrolineras">
                  <Button size="lg" variant="outline" className="gap-2 text-sm font-semibold">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    Mapa de Electrolineras
                  </Button>
                </Link>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black font-heading text-emerald-500">100%</p>
                  <p className="text-xs text-muted-foreground">Datos Moderados</p>
                </div>
                <div>
                  <p className="text-2xl font-black font-heading text-cyan-400">150+ kW</p>
                  <p className="text-xs text-muted-foreground">Carga Rápida DC</p>
                </div>
                <div>
                  <p className="text-2xl font-black font-heading text-foreground">0 COP</p>
                  <p className="text-xs text-muted-foreground">Rutas & Mapas Gratis</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Mini Map Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-2 bg-gradient-to-b from-emerald-500/20 to-transparent border border-slate-200 dark:border-slate-800 shadow-2xl">
                <ColombiaMap
                  stations={filteredStations}
                  selectedRoute={currentRoute}
                  heightClass="h-[420px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK CONNECTOR FILTER & CHARGING HUBS */}
      <section className="py-16 bg-muted/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1 font-heading">
                <Zap className="w-4 h-4" />
                Infraestructura Nacional
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                Electrolineras Verificadas por la Comunidad
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Filtra por el tipo de conector de tu vehículo para ver estaciones compatibles en tiempo real.
              </p>
            </div>

            <Link href="/electrolineras">
              <Button variant="ghost" className="gap-1.5 text-xs font-semibold text-emerald-500">
                Ver Todas las Estaciones <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Connector Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedConnector("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedConnector === "ALL"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos los Conectores
            </button>
            <button
              type="button"
              onClick={() => setSelectedConnector("CCS2")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedConnector === "CCS2"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              CCS2 (Europa/BYD)
            </button>
            <button
              type="button"
              onClick={() => setSelectedConnector("GB_T_DC")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedConnector === "GB_T_DC"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              GB/T DC (China)
            </button>
            <button
              type="button"
              onClick={() => setSelectedConnector("TYPE_2_MENNEKES")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedConnector === "TYPE_2_MENNEKES"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              Tipo 2 Mennekes (AC)
            </button>
            <button
              type="button"
              onClick={() => setSelectedConnector("TYPE_1_J1772")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedConnector === "TYPE_1_J1772"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              Tipo 1 J1772 (USA/Japón)
            </button>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStations.slice(0, 3).map((st) => (
              <Card key={st.id} className="overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={st.photos[0]}
                    alt={st.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="fastCharge" className="bg-slate-900/80 backdrop-blur-md">
                      {st.operator}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono-spec font-bold text-emerald-400 border border-slate-700">
                    ⭐ {st.rating.toFixed(1)} ({st.reviewsCount})
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{st.city}, {st.department}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-1 line-clamp-1">
                    {st.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1">{st.address}</CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {st.connectors.map((c, i) => (
                      <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-muted-foreground">Tarifa referencial:</span>
                    <span className="font-mono-spec font-bold text-emerald-600 dark:text-emerald-400">
                      {st.priceInfo || "Consultar en app"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED 3D ANDEAN ROUTE & ELEVATION SIMULATION */}
      <section className="py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold font-heading">
              <Mountain className="w-3.5 h-3.5" />
              Topografía Colombiana & Modelado de Batería
            </div>
            <h2 className="text-3xl font-black font-heading text-foreground">
              Rutas Reales con Análisis de Elevación Andina
            </h2>
            <p className="text-sm text-muted-foreground">
              En Colombia las montañas definen tu autonomía. Nuestro calculador simula el gasto energético en ascensos y la energía recuperada por regeneración en descensos.
            </p>
          </div>

          {/* Route selector buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {INITIAL_ROUTES.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRouteIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-heading transition-all ${
                  activeRouteIndex === idx
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-lg"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.originCity.split(",")[0]} ➔ {r.destinationCity.split(",")[0]} ({r.distanceKm} km)
              </button>
            ))}
          </div>

          {/* Route Detail Card with Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <Card>
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={currentRoute.difficulty === "CHALLENGING" ? "destructive" : "default"}>
                      Dificultad: {currentRoute.difficulty}
                    </Badge>
                    <span className="text-xs font-mono-spec text-muted-foreground">
                      {Math.floor(currentRoute.durationMinutes / 60)}h {currentRoute.durationMinutes % 60}m
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold font-heading mt-2">
                    {currentRoute.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {currentRoute.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono-spec">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Distancia Total</span>
                      <span className="text-sm font-bold text-foreground">{currentRoute.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Ascenso Acumulado</span>
                      <span className="text-sm font-bold text-emerald-500">+{currentRoute.elevationGainM} m</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Consumo Promedio</span>
                      <span className="text-sm font-bold text-cyan-400">{currentRoute.avgConsumption} kWh/100km</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Estado de Vía</span>
                      <span className="text-sm font-bold text-amber-400">Verificada</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block font-heading">
                      Paradas de Carga Estratégicas:
                    </span>
                    {currentRoute.waypoints
                      ?.filter((w) => w.isChargingStop)
                      .map((w, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="font-semibold text-foreground">{w.name}</span>
                          </div>
                          {w.recommendedChargeMins && (
                            <Badge variant="fastCharge" className="text-[10px]">
                              ~{w.recommendedChargeMins} min
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>

                  <Link href="/rutas" className="block pt-2">
                    <Button variant="electric" className="w-full text-xs font-semibold">
                      Abrir Planificador de Ruta Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              {currentRoute.elevationProfile && (
                <ElevationChart
                  data={currentRoute.elevationProfile}
                  title={`Perfil de Altura y Batería: ${currentRoute.originCity.split(",")[0]} a ${currentRoute.destinationCity.split(",")[0]}`}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKSHOPS & MANUALS GRID */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Specialized EV Workshops */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
                    <Wrench className="w-4 h-4" />
                    Mantenimiento & Reparación
                  </div>
                  <h3 className="text-xl font-bold font-heading text-foreground mt-1">
                    Talleres Especializados en Alto Voltaje
                  </h3>
                </div>
                <Link href="/talleres">
                  <Button variant="ghost" size="sm" className="text-xs text-emerald-500">
                    Ver Directorio <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {INITIAL_WORKSHOPS.slice(0, 2).map((ws) => (
                  <Card key={ws.id} className="p-5 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-heading text-foreground">{ws.name}</h4>
                          {ws.isVerified && (
                            <Badge variant="default" className="text-[10px]">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ws.city}, {ws.department} • {ws.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-spec font-bold text-amber-500 text-xs">
                          ⭐ {ws.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({ws.reviewsCount} opiniones)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {ws.specialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono-spec">{ws.phone}</span>
                      {ws.whatsapp && (
                        <a
                          href={`https://wa.me/${ws.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-500 font-semibold hover:underline flex items-center gap-1"
                        >
                          Contactar WhatsApp ➔
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: EV Manuals & Technical Resources */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-heading">
                    <BookOpen className="w-4 h-4" />
                    Biblioteca Técnica
                  </div>
                  <h3 className="text-xl font-bold font-heading text-foreground mt-1">
                    Manuales de Rescate & Diagramas BMS
                  </h3>
                </div>
                <Link href="/manuales">
                  <Button variant="ghost" size="sm" className="text-xs text-cyan-400">
                    Ver Manuales <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {INITIAL_MANUALS.slice(0, 2).map((man) => (
                  <Card key={man.id} className="p-5 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="secondary" className="text-[10px] mb-1.5">
                          {man.category}
                        </Badge>
                        <h4 className="text-sm font-bold font-heading text-foreground line-clamp-1">
                          {man.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {man.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono-spec">
                        {man.brand || "General"} • {(man.fileSizeBytes / 1000000).toFixed(1)} MB (PDF)
                      </span>
                      <Link href="/manuales">
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">
                          Descargar ({man.downloadCount})
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY CTA SECTION */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden bg-gradient-to-r from-emerald-950/30 via-slate-900/50 to-cyan-950/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Únete a la Red de Propietarios Eléctricos de Colombia
          </h2>
          <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Registra tus trayectos, califica las estaciones de carga en carretera, ayuda a otros conductores a no quedarse sin batería y mantén un registro de salud de tu batería (SOH).
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button size="lg" variant="electric" className="text-sm font-bold">
                Crear Cuenta / Acceder a mi Garaje
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-400" />
                Moderación Comunitaria
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
