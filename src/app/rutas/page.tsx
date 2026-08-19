"use client";

import React, { useState, useMemo } from "react";
import {
  Compass,
  MapPin,
  Car,
  BatteryCharging,
  Zap,
  Mountain,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColombiaMap } from "@/components/map/colombia-map";
import { ElevationChart } from "@/components/map/elevation-chart";
import { calculateEVRoute } from "@/lib/routing/routeService";
import {
  INITIAL_ROUTES,
  INITIAL_STATIONS,
  INITIAL_VEHICLES,
} from "@/lib/data/seed-data";
import { RouteItem } from "@/types";
import { toast } from "sonner";
import { routeSubmissionSchema } from "@/lib/validations";

const COLOMBIAN_CITIES = [
  { name: "Bogotá, D.C.", lat: 4.6097, lng: -74.0817 },
  { name: "Medellín, Antioquia", lat: 6.2442, lng: -75.5812 },
  { name: "Cali, Valle del Cauca", lat: 3.4516, lng: -76.532 },
  { name: "Pereira, Risaralda", lat: 4.8133, lng: -75.6961 },
  { name: "Ibagué, Tolima", lat: 4.4389, lng: -75.2322 },
  { name: "Bucaramanga, Santander", lat: 7.1193, lng: -73.1227 },
  { name: "Barranquilla, Atlántico", lat: 10.9685, lng: -74.7813 },
  { name: "Cartagena, Bolívar", lat: 10.391, lng: -75.4794 },
  { name: "Manizales, Caldas", lat: 5.0689, lng: -75.5174 },
  { name: "Armenia, Quindío", lat: 4.5339, lng: -75.6811 },
  { name: "Villavicencio, Meta", lat: 4.142, lng: -73.6266 },
  { name: "Pasto, Nariño", lat: 1.2136, lng: -77.2811 },
];

export default function RutasPage() {
  const [routes, setRoutes] = useState<RouteItem[]>(INITIAL_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem>(INITIAL_ROUTES[0]);

  // Interactive Route Simulator States
  const [originCityName, setOriginCityName] = useState(COLOMBIAN_CITIES[0].name);
  const [destCityName, setDestCityName] = useState(COLOMBIAN_CITIES[1].name);
  const [selectedVehicleId, setSelectedVehicleId] = useState(INITIAL_VEHICLES[1].id);
  const [initialSoc, setInitialSoc] = useState(100);

  // New Route Modal
  const [isNewRouteOpen, setIsNewRouteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MODERATE" | "CHALLENGING">("MODERATE");

  // Selected vehicle object
  const currentVehicle = useMemo(() => {
    return INITIAL_VEHICLES.find((v) => v.id === selectedVehicleId) || INITIAL_VEHICLES[0];
  }, [selectedVehicleId]);

  // Origin & Destination coordinates
  const originCity = COLOMBIAN_CITIES.find((c) => c.name === originCityName) || COLOMBIAN_CITIES[0];
  const destCity = COLOMBIAN_CITIES.find((c) => c.name === destCityName) || COLOMBIAN_CITIES[1];

  // Dynamic calculated route simulation
  const [simulatedRoute, setSimulatedRoute] = useState<any>(null);

  React.useEffect(() => {
    async function runCalc() {
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
    }
    runCalc();
  }, [originCity, destCity, currentVehicle, initialSoc]);

  const handleCreateRoute = () => {
    try {
      const payload = {
        title: newTitle,
        description: newDescription,
        originCity: originCityName,
        destinationCity: destCityName,
        originCoords: { lat: originCity.lat, lng: originCity.lng },
        destinationCoords: { lat: destCity.lat, lng: destCity.lng },
        distanceKm: simulatedRoute?.distanceKm || 200,
        durationMinutes: simulatedRoute?.durationMinutes || 240,
        difficulty: newDifficulty,
        vehicleUsedId: selectedVehicleId,
        chargingStops: [],
        photos: [],
      };

      const validated = routeSubmissionSchema.parse(payload);

      const newRouteItem: RouteItem = {
        id: `ruta-user-${Date.now()}`,
        title: validated.title,
        description: validated.description,
        originCity: validated.originCity,
        destinationCity: validated.destinationCity,
        originCoords: validated.originCoords,
        destinationCoords: validated.destinationCoords,
        distanceKm: validated.distanceKm,
        durationMinutes: validated.durationMinutes,
        elevationGainM: simulatedRoute?.elevationGainM || 1800,
        difficulty: validated.difficulty,
        photos: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"],
        waypoints: simulatedRoute?.waypoints || [],
        elevationProfile: simulatedRoute?.elevationProfile || [],
        chargingStops: [],
        moderation: "APPROVED",
        createdById: "user-current",
        createdByName: "Alejandro Ríos",
        createdAt: new Date().toISOString(),
        comments: [],
      };

      setRoutes([newRouteItem, ...routes]);
      setSelectedRoute(newRouteItem);
      setIsNewRouteOpen(false);
      setNewTitle("");
      setNewDescription("");
      toast.success("¡Ruta comunitaria agregada exitosamente!");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Por favor revisa los campos requeridos.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Compass className="w-4 h-4" />
            Planificador Andino & Red Comunitaria
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Rutas 3D & Simulación Energética EV
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calcula el impacto del relieve montañoso colombiano en la autonomía de tu vehículo eléctrico.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsNewRouteOpen(true)}
          className="gap-2 font-semibold shadow-md self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Aportar Nueva Ruta
        </Button>
      </div>

      {/* Simulator Control Panel + Interactive 3D Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Route Configurator */}
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Configurar Trayecto
              </CardTitle>
              <CardDescription className="text-xs">
                Selecciona origen, destino y modelo de carro para simular el consumo real.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Ciudad Origen"
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
                  label="Ciudad Destino"
                  value={destCityName}
                  onChange={(e) => setDestCityName(e.target.value)}
                >
                  {COLOMBIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name} disabled={c.name === originCityName}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Select
                label="Vehículo Eléctrico"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                {INITIAL_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.batteryKwh} kWh • Real ~{v.realRangeKm} km)
                  </option>
                ))}
              </Select>

              <Slider
                label="Batería al salir (SoC Inicial)"
                value={initialSoc}
                min={20}
                max={100}
                step={5}
                onChange={setInitialSoc}
                valueDisplay={`${initialSoc}%`}
              />

              {/* Simulation Result Metrics */}
              {simulatedRoute && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-spec space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Distancia Estimada</span>
                    <span className="text-white font-bold">{simulatedRoute.distanceKm} km</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Tiempo de Conducción</span>
                    <span className="text-white font-bold">
                      {Math.floor(simulatedRoute.durationMinutes / 60)}h {simulatedRoute.durationMinutes % 60}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Ascenso / Descenso</span>
                    <span className="text-emerald-400 font-bold">
                      +{simulatedRoute.elevationGainM}m / -{simulatedRoute.elevationLossM}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Energía Neta Requerida</span>
                    <span className="text-cyan-400 font-bold">{simulatedRoute.estimatedEnergyKwh} kWh</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Batería al Llegar</span>
                    <span
                      className={`font-bold text-sm ${
                        simulatedRoute.finalSocPercent < 15
                          ? "text-red-400 animate-pulse"
                          : "text-emerald-400"
                      }`}
                    >
                      {simulatedRoute.finalSocPercent}%
                    </span>
                  </div>

                  {simulatedRoute.requiresChargingStop && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
                      ⚠️ <strong>Alerta:</strong> Batería insuficiente para trayecto directo. Se requiere al menos 1 parada de carga rápida intermedia.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Interactive 3D Map */}
        <div className="lg:col-span-7">
          <ColombiaMap
            stations={INITIAL_STATIONS}
            selectedRoute={selectedRoute}
            heightClass="h-[480px]"
          />
        </div>
      </div>

      {/* Topographic Chart */}
      {simulatedRoute?.elevationProfile && (
        <ElevationChart
          data={simulatedRoute.elevationProfile}
          title={`Simulación Topográfica en Vivo: ${originCityName.split(",")[0]} a ${destCityName.split(",")[0]}`}
        />
      )}

      {/* Community Routes Library */}
      <div className="space-y-6 pt-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Trayectos y Rutas Compartidas por la Comunidad
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Experiencias reales de otros conductores con datos de consumo, paradas de recarga y estado del asfalto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Card
              key={route.id}
              className={`cursor-pointer transition-all duration-200 hover:border-emerald-500/50 ${
                selectedRoute?.id === route.id ? "ring-2 ring-emerald-500 border-transparent shadow-lg" : ""
              }`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="relative h-40 w-full overflow-hidden rounded-t-xl bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={route.photos[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"}
                  alt={route.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={route.difficulty === "CHALLENGING" ? "destructive" : "default"}>
                    {route.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded text-xs font-mono-spec font-bold text-white">
                  {route.distanceKm} km
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold font-heading">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{route.originCity.split(",")[0]} ➔ {route.destinationCity.split(",")[0]}</span>
                </div>
                <CardTitle className="text-base font-bold font-heading line-clamp-1 mt-1">
                  {route.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">{route.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Por {route.createdByName.split("(")[0]}</span>
                  <span className="font-mono-spec font-bold text-emerald-500">
                    +{route.elevationGainM || 0}m
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New Route Submission Dialog */}
      <Dialog open={isNewRouteOpen} onOpenChange={setIsNewRouteOpen}>
        <DialogHeader onClose={() => setIsNewRouteOpen(false)}>
          <DialogTitle>Aportar Nuevo Trayecto / Ruta EV</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia de viaje para ayudar a la comunidad a planificar sus cargas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Título del Trayecto
            </label>
            <Input
              placeholder="Ej. Bogotá a Girardot pasando por Fusagasugá"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Descripción & Consejos de Carga
            </label>
            <Textarea
              placeholder="Indica qué electrolineras usaste, estado del pavimento, regeneración en bajadas..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <Select
            label="Nivel de Dificultad Topográfica"
            value={newDifficulty}
            onChange={(e) => setNewDifficulty(e.target.value as any)}
          >
            <option value="EASY">Fácil (Poco desnivel / Doble calzada)</option>
            <option value="MODERATE">Moderada (Pendientes medias)</option>
            <option value="CHALLENGING">Desafiante (Alta montaña / Paso de cordillera)</option>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewRouteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="electric" onClick={handleCreateRoute}>
            Publicar Ruta
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
