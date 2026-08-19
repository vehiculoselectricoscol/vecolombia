"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Search,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ConnectorBadge } from "@/components/connector-badge";
import { VehicleItem, ConnectorType } from "@/types";
import { estimateChargingMinutes } from "@/lib/utils";
import { toast } from "sonner";

export default function VehiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterConnector, setFilterConnector] = useState<ConnectorType | "ALL">("ALL");
  const [, setLoading] = useState(true);

  // Selected Vehicle for Live Charging Calculator
  const [calcVehicleId, setCalcVehicleId] = useState<string>("");
  const [calcFromSoc, setCalcFromSoc] = useState(20);
  const [calcToSoc, setCalcToSoc] = useState(80);
  const [calcChargerKw, setCalcChargerKw] = useState(60);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success && data.data) {
          setVehicles(data.data);
          if (data.data.length > 0 && !calcVehicleId) {
            setCalcVehicleId(data.data[0].id);
          }
        }
      } catch {
        toast.error("Error al cargar catálogo de vehículos");
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [calcVehicleId]);

  const calcVehicle = vehicles.find((v) => v.id === calcVehicleId) || vehicles[0];

  const estimatedMinutes = calcVehicle
    ? estimateChargingMinutes({
        batteryKwh: calcVehicle.batteryKwh,
        fromSoc: calcFromSoc,
        toSoc: calcToSoc,
        chargerKw: calcChargerKw,
        maxCarKw: calcVehicle.maxDcKw,
      })
    : 35;

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBrand = filterBrand === "ALL" || v.brand.toLowerCase() === filterBrand.toLowerCase();
    const matchConnector =
      filterConnector === "ALL" || (v.connectorTypes && v.connectorTypes.includes(filterConnector));

    return matchSearch && matchBrand && matchConnector;
  });

  const brands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Car className="w-4 h-4" />
            Catálogo Nacional de Movilidad Eléctrica
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Fichas Técnicas & Calculadora de Carga EV
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compara especificaciones técnicas de batería, potencia de carga AC/DC y conectores disponibles en Colombia.
          </p>
        </div>
      </div>

      {/* Live Charging Simulator Card */}
      {calcVehicle && (
        <Card className="p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-transparent">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold font-heading text-foreground">
                Simulador Dinámico de Tiempo de Carga
              </h2>
            </div>
            <Badge variant="default" className="text-xs">
              {calcVehicle.brand} {calcVehicle.model} ({calcVehicle.batteryKwh} kWh)
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Vehículo del Catálogo"
                  value={calcVehicleId}
                  onChange={(e) => setCalcVehicleId(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.batteryKwh} kWh)
                    </option>
                  ))}
                </Select>

                <Select
                  label="Potencia del Cargador"
                  value={calcChargerKw}
                  onChange={(e) => setCalcChargerKw(Number(e.target.value))}
                >
                  <option value="3.7">Cargador Lento Portátil 110V/220V (3.7 kW AC)</option>
                  <option value="7.4">Wallbox Residencial Monofásico (7.4 kW AC)</option>
                  <option value="11.0">Wallbox Bifásico / Trifásico (11.0 kW AC)</option>
                  <option value="22.0">Cargador Público Urbano (22.0 kW AC)</option>
                  <option value="50.0">Electrolinera Rápida DC (50.0 kW DC)</option>
                  <option value="60.0">Electrolinera DC (60.0 kW DC)</option>
                  <option value="120.0">Electrolinera Ultra-Rápida (120.0 kW DC)</option>
                  <option value="150.0">Electrolinera Alta Potencia (150.0 kW DC)</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Slider
                  label="Batería Actual (% SoC Inicial)"
                  value={calcFromSoc}
                  min={5}
                  max={calcToSoc - 5}
                  step={5}
                  onChange={setCalcFromSoc}
                  valueDisplay={`${calcFromSoc}%`}
                />
                <Slider
                  label="Batería Objetivo (% SoC Deseado)"
                  value={calcToSoc}
                  min={calcFromSoc + 5}
                  max={100}
                  step={5}
                  onChange={setCalcToSoc}
                  valueDisplay={`${calcToSoc}%`}
                />
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-emerald-400" />
                Tiempo de Carga Estimado
              </div>
              <p className="text-3xl font-black font-mono-spec text-emerald-400">
                {estimatedMinutes >= 60
                  ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
                  : `${estimatedMinutes} minutos`}
              </p>
              <p className="text-[11px] text-slate-400">
                De {calcFromSoc}% a {calcToSoc}% • Energía: +{((calcVehicle.batteryKwh * (calcToSoc - calcFromSoc)) / 100).toFixed(1)} kWh
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por marca o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="ALL">Todas las Marcas ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>

          <Select
            value={filterConnector}
            onChange={(e) => setFilterConnector(e.target.value as any)}
          >
            <option value="ALL">Todos los Conectores</option>
            <option value="CCS1">Combo 1 (CCS1 DC Americano)</option>
            <option value="CCS2">Combo 2 (CCS2 DC)</option>
            <option value="GB_T_DC">GB/T DC (China / BYD)</option>
            <option value="TYPE_2_MENNEKES">Tipo 2 (AC)</option>
            <option value="TYPE_1_J1772">Tipo 1 (AC)</option>
            <option value="TESLA_NACS">Tesla NACS</option>
            <option value="CHADEMO">CHAdeMO (DC)</option>
          </Select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((veh) => (
          <Card
            key={veh.id}
            className="overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={veh.imageUrl || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"}
                  alt={`${veh.brand} ${veh.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-slate-950/80 backdrop-blur-md">
                    {veh.brand}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono-spec font-bold text-emerald-400 border border-slate-800">
                  {veh.realRangeKm} km reales
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  {veh.brand} {veh.model}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {veh.description || "Vehículo 100% Eléctrico"}
                </CardDescription>
              </CardHeader>

              <div className="px-5 py-2">
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-spec text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Batería</span>
                    <span className="font-bold text-white">{veh.batteryKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Carga AC</span>
                    <span className="font-bold text-white">{veh.maxAcKw} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Carga DC</span>
                    <span className="font-bold text-cyan-400">{veh.maxDcKw} kW</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Conectores Soportados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {veh.connectorTypes?.map((c: any, i: number) => (
                    <ConnectorBadge key={i} type={c} />
                  ))}
                </div>
              </div>
            </div>

            <CardContent className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Eficiencia: <strong>{veh.efficiencyKwh100 || 15.0} kWh/100km</strong>
              </span>

              <Button
                size="sm"
                variant="electric"
                className="text-xs font-semibold"
                onClick={() => {
                  setCalcVehicleId(veh.id);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
              >
                Simular Carga
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
