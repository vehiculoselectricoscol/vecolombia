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
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ChevronDown,
  Star,
  Sparkles,
  RotateCcw,
  MessageSquare,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConnectorBadge } from "@/components/connector-badge";
import { ColombiaMap } from "@/components/map/colombia-map";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Avatar } from "@/components/ui/avatar";
import { ChargingStationItem, ConnectorType } from "@/types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function ElectrolinerasPage() {
  const { user, openLoginModal } = useAuth();
  const [stations, setStations] = useState<ChargingStationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("ALL");
  const [filterOperator, setFilterOperator] = useState("ALL");
  const [filterConnector, setFilterConnector] = useState<ConnectorType | "ALL">("ALL");
  const [filterMinPower, setFilterMinPower] = useState(0);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID" | "MAP">("TABLE");
  const [, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Accordion open/close state for smooth sidebar categories
  const [openAccordions, setOpenAccordions] = useState({
    cities: true,
    rating: true,
    connectors: true,
    operators: false,
    power: false,
  });

  const toggleAccordion = (key: keyof typeof openAccordions) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selected Station for Details & Reviews Modal
  const [selectedStation, setSelectedStation] = useState<ChargingStationItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"details" | "logbook" | "edit">("details");

  // Review / Logbook Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewConnector, setReviewConnector] = useState<ConnectorType>("CCS1");
  const [reviewPower, setReviewPower] = useState<string>("55");
  const [reviewCost, setReviewCost] = useState<string>("35000");
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Edit Station States (Registered users / admin)
  const [editAddress, setEditAddress] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAmenities, setEditAmenities] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // New Station Submission Modal States
  const [isNewStationOpen, setIsNewStationOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOperator, setNewOperator] = useState("Terpel Voltex");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Bogotá");
  const [newDepartment, setNewDepartment] = useState("Cundinamarca");
  const [newConnectorType, setNewConnectorType] = useState<ConnectorType>("CCS1");
  const [newPowerKw, setNewPowerKw] = useState("60");
  const [newPrice, setNewPrice] = useState("$1.750 / kWh");

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

  const handleSyncStations = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/stations/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Estaciones sincronizadas con éxito");
        fetchStations();
      } else {
        toast.error(data.error || "Error al sincronizar");
      }
    } catch {
      toast.error("Error conectando con el servicio de sincronización");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // When opening station modal, prefill edit state
  useEffect(() => {
    if (selectedStation) {
      setEditAddress(selectedStation.address || "");
      setEditPrice(selectedStation.priceInfo || "$1.750 / kWh");
      setEditAmenities(Array.isArray(selectedStation.amenities) ? selectedStation.amenities.join(", ") : "");
      setActiveModalTab("details");
    }
  }, [selectedStation]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCity, filterOperator, filterConnector, filterMinPower, filterMinRating, pageSize]);

  // Derived lists for filters
  const cities = Array.from(new Set(stations.map((s) => s.city))).filter(Boolean).sort();
  const operators = Array.from(new Set(stations.map((s) => s.operator))).filter(Boolean).sort();

  // Filter logic
  const filteredStations = stations.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCity = filterCity === "ALL" || st.city.toLowerCase() === filterCity.toLowerCase();
    const matchOperator = filterOperator === "ALL" || st.operator === filterOperator;

    const matchConnector =
      filterConnector === "ALL" ||
      (Array.isArray(st.connectors) && st.connectors.some((c) => c.type === filterConnector));

    const matchPower =
      filterMinPower === 0 ||
      (Array.isArray(st.connectors) && st.connectors.some((c) => c.powerKw >= filterMinPower));

    const matchRating = filterMinRating === 0 || (st.rating || 5.0) >= filterMinRating;

    return matchSearch && matchCity && matchOperator && matchConnector && matchPower && matchRating;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStations = filteredStations.slice(startIndex, startIndex + pageSize);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterCity("ALL");
    setFilterOperator("ALL");
    setFilterConnector("ALL");
    setFilterMinPower(0);
    setFilterMinRating(0);
    setCurrentPage(1);
  };

  const handleAddReview = async () => {
    if (!selectedStation) return;
    if (!reviewComment.trim()) {
      toast.error("Por favor ingresa un comentario u observación sobre la carga");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: selectedStation.id,
          rating: Number(reviewRating),
          comment: reviewComment,
          connectorUsed: reviewConnector,
          powerDeliveredKw: reviewPower ? Number(reviewPower) : undefined,
          costTotalCop: reviewCost ? Number(reviewCost) : undefined,
          photoUrl: reviewPhotoUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Registro de carga & feedback agregado a la bitácora!");
      setReviewComment("");
      setReviewPhotoUrl("");
      await fetchStations();

      // Update selectedStation in place
      const updated = stations.find((s) => s.id === selectedStation.id);
      if (updated) setSelectedStation(updated);
    } catch (err: any) {
      toast.error(err.message || "Error guardando en la bitácora");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateStation = async () => {
    if (!selectedStation) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/stations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStation.id,
          address: editAddress.trim(),
          priceInfo: editPrice.trim(),
          amenities: editAmenities.split(",").map((a) => a.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Ficha técnica de la estación actualizada!");
      await fetchStations();
      setSelectedStation((prev) =>
        prev
          ? {
              ...prev,
              address: editAddress,
              priceInfo: editPrice,
              amenities: editAmenities.split(",").map((a) => a.trim()).filter(Boolean),
            }
          : null
      );
      setActiveModalTab("details");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar estación");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateStation = async () => {
    try {
      if (!newName || !newAddress || !newCity) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }

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
          photos: [],
          amenities: ["24/7", "WiFi", "Baños", "Cafetería"],
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
            <Zap className="w-4 h-4 text-emerald-500" />
            Red Nacional de Carga Eléctrica
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Directorio & Mapa de Electrolineras en Colombia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Encuentra estaciones de carga rápida DC (CCS1, CCS2, GB/T) y media AC con direcciones completas, tarifas reales y bitácora comunitaria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm font-bold"
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
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Mapa 3D
            </button>
          </div>

          {user?.role === "ADMIN" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncStations}
              disabled={isSyncing}
              className="gap-2 text-xs font-semibold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Red"}
            </Button>
          )}

          <Button
            variant="electric"
            onClick={() => setIsNewStationOpen(true)}
            className="gap-2 font-semibold shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Reportar Estación
          </Button>
        </div>
      </div>

      {/* Main Layout: Left Accordion Sidebar + Right Data View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: ACCORDION FILTERS */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold font-heading uppercase text-foreground">
                  Filtros Avanzados
                </span>
              </div>
              {(searchQuery || filterCity !== "ALL" || filterOperator !== "ALL" || filterConnector !== "ALL" || filterMinPower > 0 || filterMinRating > 0) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>

            {/* General Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar estación, vía..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* Results Count Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between">
              <span>Estaciones encontradas</span>
              <strong className="font-mono-spec font-bold">{filteredStations.length}</strong>
            </div>

            {/* ACCORDION 1: CIUDADES */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordion("cities")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-foreground flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ciudad ({cities.length})</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    openAccordions.cities ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openAccordions.cities ? "max-h-60 p-3 overflow-y-auto space-y-1.5" : "max-h-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setFilterCity("ALL")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    filterCity === "ALL"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span>Todas las Ciudades</span>
                  <span className="text-[10px] font-mono-spec">{stations.length}</span>
                </button>
                {cities.map((c) => {
                  const count = stations.filter((s) => s.city.toLowerCase() === c.toLowerCase()).length;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilterCity(c)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        filterCity.toLowerCase() === c.toLowerCase()
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="truncate">{c}</span>
                      <span className="text-[10px] font-mono-spec font-semibold text-muted-foreground">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACCORDION 2: CALIFICACIÓN MÍNIMA */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordion("rating")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-foreground flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Calificación Mínima</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    openAccordions.rating ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openAccordions.rating ? "max-h-48 p-3 space-y-1" : "max-h-0"
                }`}
              >
                {[
                  { value: 0, label: "Todas las Calificaciones" },
                  { value: 4.5, label: "⭐ 4.5+ (Excelente)" },
                  { value: 4.0, label: "⭐ 4.0+ (Muy Buena)" },
                  { value: 3.0, label: "⭐ 3.0+ (Aceptable)" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFilterMinRating(r.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      filterMinRating === r.value
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACCORDION 3: CONECTORES SOPORTADOS */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordion("connectors")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-foreground flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tipo de Conector</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    openAccordions.connectors ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openAccordions.connectors ? "max-h-72 p-3 space-y-1" : "max-h-0"
                }`}
              >
                {[
                  { value: "ALL", label: "Todos los Conectores" },
                  { value: "CCS1", label: "Combo 1 (CCS1 DC)" },
                  { value: "CCS2", label: "Combo 2 (CCS2 DC)" },
                  { value: "GB_T_DC", label: "GB/T (DC China)" },
                  { value: "TYPE_2_MENNEKES", label: "Tipo 2 Mennekes (AC)" },
                  { value: "TYPE_1_J1772", label: "Tipo 1 J1772 (AC)" },
                  { value: "TESLA_NACS", label: "Tesla NACS" },
                  { value: "CHADEMO", label: "CHAdeMO (DC)" },
                ].map((conn) => (
                  <button
                    key={conn.value}
                    type="button"
                    onClick={() => setFilterConnector(conn.value as any)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      filterConnector === conn.value
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{conn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACCORDION 4: OPERADORES */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordion("operators")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-foreground flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Operador de Red ({operators.length})</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    openAccordions.operators ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openAccordions.operators ? "max-h-60 p-3 overflow-y-auto space-y-1" : "max-h-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setFilterOperator("ALL")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    filterOperator === "ALL"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span>Todos los Operadores</span>
                  <span className="text-[10px] font-mono-spec">{stations.length}</span>
                </button>
                {operators.map((op) => {
                  const count = stations.filter((s) => s.operator === op).length;
                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setFilterOperator(op)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        filterOperator === op
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="truncate">{op}</span>
                      <span className="text-[10px] font-mono-spec font-semibold text-muted-foreground">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACCORDION 5: POTENCIA */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordion("power")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-foreground flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Potencia Mínima (kW)</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    openAccordions.power ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openAccordions.power ? "max-h-48 p-3 space-y-1" : "max-h-0"
                }`}
              >
                {[
                  { value: 0, label: "Cualquier Potencia (AC / DC)" },
                  { value: 22, label: "Semi-Rápida (≥ 22 kW AC)" },
                  { value: 50, label: "Carga Rápida DC (≥ 50 kW)" },
                  { value: 60, label: "Electrolinera DC (≥ 60 kW)" },
                  { value: 100, label: "Ultra-Rápida (≥ 100 kW DC)" },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFilterMinPower(p.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      filterMinPower === p.value
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA: TABLE / GRID / MAP */}
        <main className="lg:col-span-9 space-y-6">
          {/* View: MAP Mode */}
          {viewMode === "MAP" && (
            <div className="space-y-4">
              <ColombiaMap
                stations={filteredStations}
                onSelectStation={(st) => setSelectedStation(st)}
                heightClass="h-[650px]"
              />
            </div>
          )}

          {/* View: TABLE Mode */}
          {viewMode === "TABLE" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-5 py-3.5">Estación & Operador</th>
                        <th scope="col" className="px-5 py-3.5">Ubicación & Dirección Completa</th>
                        <th scope="col" className="px-5 py-3.5">Conectores Soportados</th>
                        <th scope="col" className="px-5 py-3.5">Potencia Máx</th>
                        <th scope="col" className="px-5 py-3.5">Tarifa</th>
                        <th scope="col" className="px-5 py-3.5 text-right">Bitácora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedStations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                            No se encontraron estaciones con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        paginatedStations.map((st) => {
                          const maxPower =
                            Array.isArray(st.connectors) && st.connectors.length > 0
                              ? Math.max(...st.connectors.map((c: any) => c.powerKw || 0))
                              : 60;

                          return (
                            <tr
                              key={st.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                              onClick={() => setSelectedStation(st)}
                            >
                              {/* Station & Operator (Icon without image) */}
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                                    <Zap className="w-5 h-5 text-emerald-500" />
                                  </div>
                                  <div>
                                    <div className="font-bold font-heading text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
                                      {st.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="fastCharge" className="text-[10px] py-0 px-1.5 font-semibold">
                                        {st.operator}
                                      </Badge>
                                      <span className="text-[11px] font-mono-spec text-amber-500 font-bold flex items-center gap-0.5">
                                        ⭐ {st.rating?.toFixed(1) || "5.0"}
                                        <span className="text-muted-foreground text-[10px]">
                                          ({st.reviews?.length || st.reviewsCount || 0})
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Full Location & Address */}
                              <td className="px-5 py-4">
                                <div className="flex items-start gap-1.5 text-xs text-foreground">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-foreground">
                                      {st.city}, {st.department}
                                    </span>
                                    <p className="text-muted-foreground text-xs mt-0.5">{st.address}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Connectors */}
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                                  {Array.isArray(st.connectors) &&
                                    st.connectors.map((c: any, i: number) => (
                                      <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                                    ))}
                                </div>
                              </td>

                              {/* Power */}
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-1 font-mono-spec font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Zap className="w-3 h-3 text-emerald-500" />
                                  {maxPower} kW
                                </span>
                              </td>

                              {/* Price */}
                              <td className="px-5 py-4">
                                <span className="font-mono-spec font-bold text-xs text-foreground">
                                  {st.priceInfo || "$1.750 / kWh"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs font-semibold gap-1 hover:border-emerald-500 hover:text-emerald-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStation(st);
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver Ficha
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* View: GRID Cards Mode (Without photo banner) */}
          {viewMode === "GRID" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedStations.map((st) => {
                const maxPower =
                  Array.isArray(st.connectors) && st.connectors.length > 0
                    ? Math.max(...st.connectors.map((c: any) => c.powerKw || 0))
                    : 60;

                return (
                  <Card
                    key={st.id}
                    className="overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between group p-5 bg-card cursor-pointer"
                    onClick={() => setSelectedStation(st)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="fastCharge" className="text-xs font-bold py-0.5">
                            {st.operator}
                          </Badge>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                            24/7 Operativa
                          </span>
                        </div>
                        <span className="text-xs font-mono-spec font-bold text-amber-500 flex items-center gap-1">
                          ⭐ {st.rating?.toFixed(1) || "5.0"}
                          <span className="text-muted-foreground text-[11px]">
                            ({st.reviews?.length || st.reviewsCount || 0})
                          </span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold font-heading text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
                          {st.name}
                        </h3>
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {st.city}, {st.department}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{st.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">Conectores:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(st.connectors) &&
                            st.connectors.map((c: any, i: number) => (
                              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-muted-foreground block text-[10px]">Tarifa Estimada</span>
                        <span className="font-mono-spec font-bold text-emerald-600 dark:text-emerald-400">
                          {st.priceInfo || "$1.750 / kWh"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono-spec font-bold text-xs text-muted-foreground">
                          Máx {maxPower} kW
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold gap-1 hover:border-emerald-500 hover:text-emerald-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStation(st);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Ficha
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Footer (For Table & Grid views) */}
          {(viewMode === "TABLE" || viewMode === "GRID") && filteredStations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>
                  Mostrando <strong className="text-foreground">{startIndex + 1}</strong> -{" "}
                  <strong className="text-foreground">{Math.min(startIndex + pageSize, filteredStations.length)}</strong> de{" "}
                  <strong className="text-foreground">{filteredStations.length}</strong> estaciones
                </span>

                <div className="flex items-center gap-2">
                  <span>Por pág:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-foreground"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="h-8 w-8 p-0"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>

                <div className="px-3 py-1 font-mono-spec font-bold text-xs bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-foreground">
                  {currentPage} / {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2 gap-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-8 w-8 p-0"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* STATION DETAILS & COMMUNITY LOGBOOK MODAL */}
      {selectedStation && (
        <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)} maxWidth="xl">
          <DialogHeader onClose={() => setSelectedStation(null)}>
            <div className="flex items-center gap-2">
              <Badge variant="fastCharge">{selectedStation.operator}</Badge>
              {selectedStation.isVerified && (
                <Badge variant="default" className="text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Estación Verificada
                </Badge>
              )}
              <span className="text-xs font-mono-spec font-bold text-amber-500 ml-auto">
                ⭐ {selectedStation.rating?.toFixed(1) || "5.0"} ({selectedStation.reviews?.length || selectedStation.reviewsCount || 0} reseñas)
              </span>
            </div>
            <DialogTitle className="mt-1.5 text-xl font-black font-heading">{selectedStation.name}</DialogTitle>
            <DialogDescription className="text-xs flex items-center gap-1.5 text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <strong>{selectedStation.address}</strong> • {selectedStation.city}, {selectedStation.department}
            </DialogDescription>
          </DialogHeader>

          {/* Modal Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModalTab("details")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeModalTab === "details"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              Ficha Técnica & Conectores
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab("logbook")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModalTab === "logbook"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Bitácora Comunitaria ({selectedStation.reviews?.length || 0})
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setActiveModalTab("edit")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeModalTab === "edit"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Actualizar Ficha
              </button>
            )}
          </div>

          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* TAB 1: FICHA TÉCNICA */}
            {activeModalTab === "details" && (
              <div className="space-y-5">
                {/* Connectors Grid */}
                <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
                    Puntos de Carga & Conectores
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.isArray(selectedStation.connectors) &&
                      selectedStation.connectors.map((c: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <ConnectorBadge type={c.type} />
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {c.powerKw} kW {c.type.includes("DC") ? "Carga Rápida DC" : "Carga AC"}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {c.count || 2} tomas • {c.isAvailable !== false ? "Disponible" : "Ocupado"}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono-spec font-bold text-emerald-500">
                            {c.pricePerKwh ? `$${c.pricePerKwh.toLocaleString("es-CO")} / kWh` : selectedStation.priceInfo || "$1.750 / kWh"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Location & Details Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Dirección Completa
                    </span>
                    <p className="text-sm font-semibold text-foreground">{selectedStation.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedStation.city}, {selectedStation.department} (Colombia)
                    </p>
                    <div className="pt-2 text-[11px] font-mono-spec text-muted-foreground">
                      Coordenadas GPS: {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Tarifa & Amenidades
                    </span>
                    <p className="text-sm font-mono-spec font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedStation.priceInfo || "$1.750 / kWh (Tarifa promedio)"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(selectedStation.amenities || ["WiFi", "Baños", "24/7", "Cafetería", "Seguridad"]).map((a, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BITÁCORA COMUNITARIA & CHECK-INS */}
            {activeModalTab === "logbook" && (
              <div className="space-y-6">
                {/* Form: Add Check-in */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-heading flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Registrar Mi Experiencia de Carga en la Bitácora
                    </span>
                    {user && (
                      <span className="text-[11px] text-muted-foreground">
                        Registrando como: <strong className="text-foreground">{user.name || user.email}</strong>
                      </span>
                    )}
                  </div>

                  {user ? (
                    <div className="space-y-3.5">
                      {/* Rating selector */}
                      <div>
                        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                          Calificación de la Carga
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-1 text-amber-400 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono-spec font-bold text-amber-400 ml-2">
                            {reviewRating} de 5 estrellas
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-muted-foreground block">
                            Conector Usado
                          </label>
                          <Select
                            value={reviewConnector}
                            onChange={(e) => setReviewConnector(e.target.value as any)}
                            className="mt-1 text-xs"
                          >
                            <option value="CCS1">CCS1 (Combo 1 DC Americano)</option>
                            <option value="CCS2">CCS2 (Combo 2 DC)</option>
                            <option value="GB_T_DC">GB/T DC (China / BYD)</option>
                            <option value="TYPE_2_MENNEKES">Tipo 2 Mennekes (AC)</option>
                            <option value="TYPE_1_J1772">Tipo 1 J1772 (AC)</option>
                            <option value="TESLA_NACS">Tesla NACS</option>
                          </Select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold uppercase text-muted-foreground block">
                            Potencia Real Observada (kW)
                          </label>
                          <Input
                            type="number"
                            placeholder="Ej. 55"
                            value={reviewPower}
                            onChange={(e) => setReviewPower(e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold uppercase text-muted-foreground block">
                            Costo Pagado ($ COP)
                          </label>
                          <Input
                            type="number"
                            placeholder="Ej. 35000"
                            value={reviewCost}
                            onChange={(e) => setReviewCost(e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase text-muted-foreground block">
                          Comentario / Observaciones de la Estación
                        </label>
                        <Textarea
                          placeholder="Describe el estado del cargador, velocidad de recarga, si los baños estaban limpios, facilidad de pago..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={2}
                          className="mt-1 text-xs"
                        />
                      </div>

                      {/* Photo Upload (Optional) */}
                      <ImageUploader
                        value={reviewPhotoUrl}
                        onChange={setReviewPhotoUrl}
                        folder="vecolombia/stations"
                        label="Fotografía del Cargador / Estación (Opcional)"
                      />

                      <Button
                        variant="electric"
                        onClick={handleAddReview}
                        disabled={submittingReview}
                        className="w-full text-xs font-semibold gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {submittingReview ? "Guardando..." : "Guardar Registro en Bitácora Comunitaria"}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Inicia sesión con tu cuenta para registrar tu carga real, subir fotos y aportar a la bitácora de la comunidad.
                      </p>
                      <Button size="sm" variant="electric" onClick={openLoginModal} className="text-xs font-semibold">
                        Iniciar Sesión para Registrar Carga
                      </Button>
                    </div>
                  )}
                </div>

                {/* Timeline / Bitácora Feed */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading block">
                    Historial de Bitácora & Check-ins ({selectedStation.reviews?.length || 0})
                  </span>

                  {(!selectedStation.reviews || selectedStation.reviews.length === 0) ? (
                    <p className="text-xs text-muted-foreground italic p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      Aún no hay registros en la bitácora de esta estación. ¡Sé el primero en documentar tu carga!
                    </p>
                  ) : (
                    selectedStation.reviews.map((r: any) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={r.user?.image}
                              fallback={r.user?.name?.slice(0, 2) || "VE"}
                              className="w-8 h-8 text-[10px]"
                            />
                            <div>
                              <div className="text-xs font-bold text-foreground">
                                {r.user?.name || "Usuario de la Comunidad"}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString("es-CO", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 font-mono-spec font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            ⭐ {r.rating} / 5
                          </div>
                        </div>

                        {/* Telemetry Chips */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {r.connectorUsed && <ConnectorBadge type={r.connectorUsed} />}
                          {r.powerDeliveredKw && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono-spec font-bold text-[11px]">
                              {r.powerDeliveredKw} kW entregados
                            </span>
                          )}
                          {r.costTotalCop && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono-spec font-bold text-[11px] text-foreground">
                              ${r.costTotalCop.toLocaleString("es-CO")} COP
                            </span>
                          )}
                        </div>

                        {/* Comment text */}
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>

                        {/* Photo attachment if uploaded */}
                        {r.photoUrl && (
                          <div className="pt-2">
                            <img
                              src={r.photoUrl}
                              alt="Foto del check-in"
                              className="h-36 w-auto max-w-full rounded-xl object-cover border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ACTUALIZAR FICHA TÉCNICA */}
            {activeModalTab === "edit" && user && (
              <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-heading block">
                  Actualizar Datos & Dirección de la Estación
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block">
                      Dirección Completa Exacta
                    </label>
                    <Input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Ej. Km 25 Autopista Norte, Estación Terpel Briceño"
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block">
                      Información de Tarifa
                    </label>
                    <Input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Ej. $1.750 / kWh (Carga Rápida DC)"
                      className="mt-1 text-xs font-mono-spec"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block">
                      Amenidades (separadas por comas)
                    </label>
                    <Input
                      value={editAmenities}
                      onChange={(e) => setEditAmenities(e.target.value)}
                      placeholder="Ej. 24/7, WiFi, Baños, Tienda Altoque, Juan Valdez"
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button
                    variant="electric"
                    onClick={handleUpdateStation}
                    disabled={savingEdit}
                    className="w-full text-xs font-semibold gap-1.5 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {savingEdit ? "Guardando..." : "Guardar Cambios en la Ficha"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedStation(null)} className="text-xs">
              Cerrar
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* NEW STATION SUBMISSION MODAL */}
      <Dialog open={isNewStationOpen} onOpenChange={setIsNewStationOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsNewStationOpen(false)}>
          <DialogTitle>Reportar Nueva Electrolinera en Colombia</DialogTitle>
          <DialogDescription>
            Añade un nuevo punto de carga eléctrica a la base de datos nacional verificada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Nombre de la Estación</label>
              <Input
                placeholder="Ej. Terpel Voltex Briceño"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <Select
              label="Operador de Red"
              value={newOperator}
              onChange={(e) => setNewOperator(e.target.value)}
            >
              <option value="Terpel Voltex">Terpel Voltex</option>
              <option value="Celsia">Celsia</option>
              <option value="Enel X Way">Enel X Way</option>
              <option value="EPM">EPM</option>
              <option value="Blink Charging">Blink Charging</option>
              <option value="Evsy">Evsy</option>
              <option value="Porsche Destination">Porsche Destination Charging</option>
              <option value="Tesla Supercharger">Tesla Supercharger</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Dirección Completa</label>
            <Input
              placeholder="Ej. Km 25 Autopista Norte, EDS Briceño"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Ciudad</label>
              <Input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Ej. Bogotá"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Departamento</label>
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Ej. Cundinamarca"
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Conector Principal"
              value={newConnectorType}
              onChange={(e) => setNewConnectorType(e.target.value as any)}
            >
              <option value="CCS1">CCS1 Combo 1 (DC Americano)</option>
              <option value="CCS2">CCS2 Combo 2 (DC)</option>
              <option value="GB_T_DC">GB/T (DC)</option>
              <option value="TYPE_2_MENNEKES">Tipo 2 (AC)</option>
              <option value="TYPE_1_J1772">Tipo 1 (AC)</option>
              <option value="TESLA_NACS">Tesla NACS</option>
              <option value="CHADEMO">CHAdeMO (DC)</option>
            </Select>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Potencia (kW)</label>
              <Input
                type="number"
                value={newPowerKw}
                onChange={(e) => setNewPowerKw(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Tarifa Estimada</label>
              <Input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="mt-1 text-xs font-mono-spec"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsNewStationOpen(false)} className="text-xs">
            Cancelar
          </Button>
          <Button variant="electric" size="sm" onClick={handleCreateStation} className="text-xs font-semibold">
            Guardar Estación
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
