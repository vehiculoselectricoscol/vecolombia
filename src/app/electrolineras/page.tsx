"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  MapPin,
  Search,
  PlusCircle,
  ShieldCheck,
  Grid,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConnectorBadge } from "@/components/connector-badge";
import { ColombiaMap } from "@/components/map/colombia-map";
import { ChargingStationItem, ConnectorType } from "@/types";
import { toast } from "sonner";

export default function ElectrolinerasPage() {
  const [stations, setStations] = useState<ChargingStationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOperator, setFilterOperator] = useState("ALL");
  const [filterConnector, setFilterConnector] = useState<ConnectorType | "ALL">("ALL");
  const [filterMinPower, setFilterMinPower] = useState(0);
  const [viewMode, setViewMode] = useState<"GRID" | "MAP">("GRID");
  const [, setLoading] = useState(true);

  // Selected Station for Details & Reviews Modal
  const [selectedStation, setSelectedStation] = useState<ChargingStationItem | null>(null);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPower, setReviewPower] = useState<string>("55");
  const [reviewCost, setReviewCost] = useState<string>("45000");

  // New Station Submission Modal States
  const [isNewStationOpen, setIsNewStationOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOperator, setNewOperator] = useState("Celsia");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Bogotá, D.C.");
  const [newDepartment, setNewDepartment] = useState("Cundinamarca");
  const [newConnectorType, setNewConnectorType] = useState<ConnectorType>("CCS2");
  const [newPowerKw, setNewPowerKw] = useState("60");
  const [newPrice, setNewPrice] = useState("$1.700 / kWh");

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stations");
      const data = await res.json();
      if (data.success) {
        setStations(data.data);
      }
    } catch {
      toast.error("Error conectando con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Filter logic
  const filteredStations = stations.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchOperator = filterOperator === "ALL" || st.operator === filterOperator;

    const matchConnector =
      filterConnector === "ALL" ||
      (Array.isArray(st.connectors) && st.connectors.some((c) => c.type === filterConnector));

    const matchPower =
      filterMinPower === 0 ||
      (Array.isArray(st.connectors) && st.connectors.some((c) => c.powerKw >= filterMinPower));

    return matchSearch && matchOperator && matchConnector && matchPower;
  });

  const operators = Array.from(new Set(stations.map((s) => s.operator)));

  const handleAddReview = async () => {
    if (!selectedStation) return;
    try {
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: selectedStation.id,
          rating: Number(reviewRating),
          comment: reviewComment,
          powerDeliveredKw: reviewPower ? Number(reviewPower) : undefined,
          costTotalCop: reviewCost ? Number(reviewCost) : undefined,
          connectorUsed: "CCS2",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Check-in registrado exitosamente!");
      setReviewComment("");
      fetchStations();
      setSelectedStation(null);
    } catch (err: any) {
      toast.error(err.message || "Error guardando check-in");
    }
  };

  const handleCreateStation = async () => {
    try {
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          operator: newOperator,
          address: newAddress,
          city: newCity,
          department: newDepartment,
          latitude: 4.6853,
          longitude: -74.0538,
          connectors: [
            {
              type: newConnectorType,
              powerKw: parseFloat(newPowerKw),
              count: 2,
              isAvailable: true,
            },
          ],
          photos: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"],
          amenities: ["24/7", "WiFi", "Baños"],
          priceInfo: newPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Electrolinera registrada con éxito!");
      setIsNewStationOpen(false);
      setNewName("");
      setNewAddress("");
      fetchStations();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar estación");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Zap className="w-4 h-4" />
            Red Nacional de Carga Eléctrica
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Mapa & Directorio de Electrolineras en Colombia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Encuentra estaciones de carga rápida DC (CCS2, GB/T) y media AC con información de tarifas y estado operativo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setViewMode("MAP")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "MAP"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Mapa 3D
            </button>
          </div>

          <Button
            variant="electric"
            onClick={() => setIsNewStationOpen(true)}
            className="gap-2 font-semibold shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Reportar Electrolinera
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por ciudad, nombre o vía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value)}
          >
            <option value="ALL">Todos los Operadores</option>
            {operators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </Select>

          <Select
            value={filterConnector}
            onChange={(e) => setFilterConnector(e.target.value as any)}
          >
            <option value="ALL">Todos los Conectores</option>
            <option value="CCS2">Combo 2 (CCS2 DC)</option>
            <option value="GB_T_DC">GB/T DC (China / BYD)</option>
            <option value="TYPE_2_MENNEKES">Tipo 2 Mennekes (AC)</option>
            <option value="TYPE_1_J1772">Tipo 1 J1772 (AC)</option>
            <option value="CHADEMO">CHAdeMO (DC)</option>
          </Select>

          <Select
            value={filterMinPower}
            onChange={(e) => setFilterMinPower(Number(e.target.value))}
          >
            <option value="0">Cualquier Potencia (AC/DC)</option>
            <option value="50">Solo Carga Rápida DC (≥ 50 kW)</option>
            <option value="100">Carga Ultra-Rápida (≥ 100 kW)</option>
          </Select>
        </div>
      </div>

      {/* View: MAP Mode */}
      {viewMode === "MAP" && (
        <div className="space-y-4">
          <ColombiaMap
            stations={filteredStations}
            onSelectStation={(st) => setSelectedStation(st)}
            heightClass="h-[600px]"
          />
        </div>
      )}

      {/* View: GRID Cards Mode */}
      {viewMode === "GRID" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map((st) => (
            <Card
              key={st.id}
              className="overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={st.photos[0] || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"}
                  alt={st.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="fastCharge" className="bg-slate-950/80 backdrop-blur-md">
                    {st.operator}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono-spec font-bold text-emerald-400 border border-slate-700">
                  ⭐ {st.rating?.toFixed(1) || "5.0"} ({st.reviewsCount || 0})
                </div>
              </div>

              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{st.city}, {st.department}</span>
                </div>
                <CardTitle className="text-base font-bold font-heading line-clamp-1 mt-1">
                  {st.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1">{st.address}</CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(st.connectors) &&
                      st.connectors.map((c, i) => (
                        <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-muted-foreground block text-[10px]">Tarifa</span>
                    <span className="font-mono-spec font-bold text-emerald-600 dark:text-emerald-400">
                      {st.priceInfo || "Según consumo"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold hover:border-emerald-500 hover:text-emerald-500"
                    onClick={() => setSelectedStation(st)}
                  >
                    Detalles & Check-in
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Station Details & Reviews Modal */}
      {selectedStation && (
        <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)}>
          <DialogHeader onClose={() => setSelectedStation(null)}>
            <div className="flex items-center gap-2">
              <Badge variant="fastCharge">{selectedStation.operator}</Badge>
              {selectedStation.isVerified && (
                <Badge variant="default" className="text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Estación Verificada
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-1">{selectedStation.name}</DialogTitle>
            <DialogDescription>
              {selectedStation.address} • {selectedStation.city}, {selectedStation.department}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {/* Check-in Form */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-heading">
                Registrar Check-in
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Calificación"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Buena)</option>
                  <option value="3">⭐⭐⭐ (3 - Regular)</option>
                  <option value="2">⭐⭐ (2 - Lenta)</option>
                  <option value="1">⭐ (1 - Fuera de servicio)</option>
                </Select>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Potencia Real (kW)
                  </label>
                  <Input
                    type="number"
                    value={reviewPower}
                    onChange={(e) => setReviewPower(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Costo Total (COP)
                  </label>
                  <Input
                    type="number"
                    value={reviewCost}
                    onChange={(e) => setReviewCost(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Comentario
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="¿Cómo fue la carga en esta estación?"
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <Button size="sm" variant="electric" onClick={handleAddReview} className="w-full font-semibold">
                Guardar Check-in
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* New Station Modal */}
      <Dialog open={isNewStationOpen} onOpenChange={setIsNewStationOpen}>
        <DialogHeader onClose={() => setIsNewStationOpen(false)}>
          <DialogTitle>Reportar Nueva Electrolinera</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Nombre de la Estación
              </label>
              <Input
                placeholder="Ej. Terpel Voltex Autopista Norte"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1"
              />
            </div>

            <Select
              label="Operador de Carga"
              value={newOperator}
              onChange={(e) => setNewOperator(e.target.value)}
            >
              <option value="Celsia">Celsia</option>
              <option value="Terpel Voltex">Terpel Voltex</option>
              <option value="Enel X Way">Enel X Way</option>
              <option value="EPM">EPM</option>
              <option value="Blink Charging">Blink Charging</option>
              <option value="Evsy">Evsy</option>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Dirección</label>
              <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Ciudad</label>
              <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Departamento</label>
              <Input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Conector Principal"
              value={newConnectorType}
              onChange={(e) => setNewConnectorType(e.target.value as any)}
            >
              <option value="CCS2">CCS2 (DC)</option>
              <option value="GB_T_DC">GB/T (DC)</option>
              <option value="TYPE_2_MENNEKES">Tipo 2 (AC)</option>
              <option value="TYPE_1_J1772">Tipo 1 (AC)</option>
            </Select>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Potencia (kW)</label>
              <Input type="number" value={newPowerKw} onChange={(e) => setNewPowerKw(e.target.value)} className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Tarifa</label>
              <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewStationOpen(false)}>Cancelar</Button>
          <Button variant="electric" onClick={handleCreateStation}>Guardar Estación</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
