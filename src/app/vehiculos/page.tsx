"use client";

import React, { useState } from "react";
import {
  Car,
  Zap,
  BatteryCharging,
  Gauge,
  Search,
  Sliders,
  CheckCircle2,
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
import { INITIAL_VEHICLES } from "@/lib/data/seed-data";
import { VehicleItem, ConnectorType } from "@/types";
import { estimateChargingMinutes } from "@/lib/utils";

export default function VehiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>(INITIAL_VEHICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterConnector, setFilterConnector] = useState<ConnectorType | "ALL">("ALL");

  // Selected Vehicle for Live Charging Calculator
  const [calcVehicleId, setCalcVehicleId] = useState(INITIAL_VEHICLES[1].id);
  const [calcFromSoc, setCalcFromSoc] = useState(20);
  const [calcToSoc, setCalcToSoc] = useState(80);
  const [calcChargerKw, setCalcChargerKw] = useState(60);

  const calcVehicle = vehicles.find((v) => v.id === calcVehicleId) || vehicles[0];

  const estimatedMinutes = estimateChargingMinutes({
    batteryKwh: calcVehicle.batteryKwh,
    fromSoc: calcFromSoc,
    toSoc: calcToSoc,
    chargerKw: calcChargerKw,
    maxCarKw: calcVehicle.maxDcKw,
  });

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBrand = filterBrand === "ALL" || v.brand === filterBrand;
    const matchConnector =
      filterConnector === "ALL" || v.connectorTypes.includes(filterConnector);

    return matchSearch && matchBrand && matchConnector;
  });

  const brands = Array.from(new Set(vehicles.map((v) => v.brand)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Car className="w-4 h-4" />
            Base de Datos Oficial
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Catálogo de Vehículos Eléctricos en Colombia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Especificaciones técnicas reales, compatibilidad de conectores (CCS2, GB/T, Type 2), curvas de carga y potencias máximas.
          </p>
        </div>
      </div>

      {/* Interactive Charging Speed Calculator */}
      <Card className="p-6 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-cyan-950/20 border-emerald-500/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador de Tiempo de Carga
            </div>
            <h3 className="text-xl font-bold font-heading text-white">
              ¿Cuánto tarda en cargar tu carro eléctrico?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El tiempo real depende del tamaño de la batería, el porcentaje deseado y la potencia soportada por el vehículo y la electrolinera.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Select
                label="Modelo de Vehículo"
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
                <option value="7">Wallbox Domiciliario (7.4 kW AC)</option>
                <option value="11">Wallbox Trifásico (11 kW AC)</option>
                <option value="22">Cargador Público Medio (22 kW AC)</option>
                <option value="50">Carga Rápida DC (50 kW)</option>
                <option value="60">Carga Rápida DC (60 kW)</option>
                <option value="100">Carga Ultra Rápida DC (100 kW)</option>
                <option value="150">Hub Alta Potencia (150 kW DC)</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <Slider
                label="SoC Inicial"
                value={calcFromSoc}
                min={5}
                max={90}
                step={5}
                onChange={setCalcFromSoc}
                valueDisplay={`${calcFromSoc}%`}
              />
              <Slider
                label="SoC Objetivo"
                value={calcToSoc}
                min={calcFromSoc + 5}
                max={100}
                step={5}
                onChange={setCalcToSoc}
                valueDisplay={`${calcToSoc}%`}
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
            <Clock className="w-8 h-8 text-emerald-400" />
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Tiempo Estimado ({calcFromSoc}% a {calcToSoc}%)</p>
              <p className="text-4xl font-black font-mono-spec text-emerald-400">
                {Math.floor(estimatedMinutes / 60)}h {estimatedMinutes % 60}m
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono-spec text-slate-400 border-t border-slate-800/80 pt-3 w-full max-w-xs">
              <div>
                <span>Energía Requerida:</span>
                <p className="font-bold text-white">
                  {(((calcToSoc - calcFromSoc) * calcVehicle.batteryKwh) / 100).toFixed(1)} kWh
                </p>
              </div>
              <div>
                <span>Potencia Efectiva:</span>
                <p className="font-bold text-cyan-400">
                  {Math.min(calcChargerKw, calcVehicle.maxDcKw)} kW
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

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
            <option value="ALL">Cualquier Conector</option>
            <option value="CCS2">Combo 2 (CCS2)</option>
            <option value="GB_T_DC">GB/T (DC)</option>
            <option value="TYPE_2_MENNEKES">Tipo 2 (Mennekes AC)</option>
            <option value="TYPE_1_J1772">Tipo 1 (J1772 AC)</option>
            <option value="CCS1">Combo 1 (CCS1 DC)</option>
            <option value="TESLA_NACS">Tesla / NACS</option>
          </Select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((veh) => (
          <Card key={veh.id} className="overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={veh.imageUrl || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"}
                  alt={`${veh.brand} ${veh.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-slate-950/80 backdrop-blur-md">
                    {veh.brand}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono-spec font-bold text-emerald-400 border border-slate-700">
                  {veh.batteryKwh} kWh
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono-spec">Año {veh.year}</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono-spec">
                    Real ~{veh.realRangeKm} km
                  </span>
                </div>
                <CardTitle className="text-lg font-bold font-heading text-foreground mt-1">
                  {veh.brand} {veh.model}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {veh.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono-spec">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Carga Rápida DC</span>
                    <span className="font-bold text-emerald-500">{veh.maxDcKw} kW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Carga Lenta AC</span>
                    <span className="font-bold text-blue-400">{veh.maxAcKw} kW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Consumo Medio</span>
                    <span className="font-bold text-foreground">{veh.efficiencyKwh100 || 15} kWh/100km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Rango WLTP</span>
                    <span className="font-bold text-foreground">{veh.wltpRangeKm || veh.realRangeKm} km</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Conectores Soportados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {veh.connectorTypes.map((c, i) => (
                      <ConnectorBadge key={i} type={c} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
