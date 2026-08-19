"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Wrench,
  ShoppingBag,
  Award,
  Users,
  Car,
  Trash2,
  RefreshCw,
  PlusCircle,
  Edit,
  Globe,
  Search,
  DownloadCloud,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConnectorBadge } from "@/components/connector-badge";
import { ImageUploader } from "@/components/ui/image-uploader";
import { toast } from "sonner";
import { ConnectorType } from "@/types";

interface QueueItem {
  id: string;
  type: "STATION" | "WORKSHOP" | "ROUTE" | "MANUAL" | "MARKETPLACE";
  title: string;
  subtitle: string;
  submittedBy: string;
  date: string;
  status: string;
  details: string;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  _count?: {
    vehicles: number;
    routes: number;
    marketplaceListings: number;
    stationsAdded: number;
    workshopsAdded: number;
  };
}

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [workshopsList, setWorkshopsList] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Manual Add / Edit Vehicle Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vBrand, setVBrand] = useState("BYD");
  const [vModel, setVModel] = useState("");
  const [vYear, setVYear] = useState(2024);
  const [vYearStart, setVYearStart] = useState(2022);
  const [vYearEnd, setVYearEnd] = useState(2026);
  const [vBatteryKwh, setVBatteryKwh] = useState("60.0");
  const [vRealRangeKm, setVRealRangeKm] = useState("400");
  const [vWltpRangeKm, setVWltpRangeKm] = useState("450");
  const [vMaxAcKw, setVMaxAcKw] = useState("7.0");
  const [vMaxDcKw, setVMaxDcKw] = useState("80.0");
  const [vEfficiency, setVEfficiency] = useState("15.0");
  const [vImageUrl, setVImageUrl] = useState("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80");
  const [vDescription, setVDescription] = useState("");
  const [vConnectors, setVConnectors] = useState<ConnectorType[]>(["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"]);

  // External Free API Lookup States
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiSearchBrand, setApiSearchBrand] = useState("BYD");
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [apiSearching, setApiSearching] = useState(false);
  const [isSyncingStations, setIsSyncingStations] = useState(false);

  const handleSyncStations = async () => {
    setIsSyncingStations(true);
    try {
      const res = await fetch("/api/stations/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Estaciones de carga sincronizadas con éxito");
        fetchDashboardData();
      } else {
        toast.error(data.error || "Error al sincronizar");
      }
    } catch {
      toast.error("Error conectando con el servicio de sincronización");
    } finally {
      setIsSyncingStations(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [modRes, usersRes, wsRes, vehRes] = await Promise.all([
        fetch("/api/moderation"),
        fetch("/api/users"),
        fetch("/api/workshops"),
        fetch("/api/vehicles"),
      ]);

      const modData = await modRes.json();
      const usersData = await usersRes.json();
      const wsData = await wsRes.json();
      const vehData = await vehRes.json();

      if (modData.success) setQueue(modData.data);
      if (usersData.success) setUsersList(usersData.data);
      if (wsData.success) setWorkshopsList(wsData.data);
      if (vehData.success) setVehiclesList(vehData.data);
    } catch {
      toast.error("Error conectando con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleModerationAction = async (item: QueueItem, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: item.id,
          entityType: item.type,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "Acción procesada exitosamente");
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
    } catch (err: any) {
      toast.error(err.message || "Error al procesar moderación");
    }
  };

  const handleRoleChange = async (userId: string, newRole: "USER" | "MODERATOR" | "ADMIN") => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "Rol de usuario actualizado con éxito");
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      toast.error(err.message || "Error actualizando rol");
    }
  };

  const toggleWorkshopVerification = async (wsId: string) => {
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: wsId,
          entityType: "WORKSHOP",
          action: "TOGGLE_VERIFY",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setWorkshopsList((prev) =>
        prev.map((w) => (w.id === wsId ? { ...w, isVerified: !w.isVerified } : w))
      );
      toast.success("Sello de certificación de taller actualizado con éxito");
    } catch (err: any) {
      toast.error(err.message || "Error actualizando certificación");
    }
  };

  const openNewVehicleModal = () => {
    setEditingVehicleId(null);
    setVBrand("BYD");
    setVModel("");
    setVYear(2024);
    setVYearStart(2022);
    setVYearEnd(2026);
    setVBatteryKwh("60.0");
    setVRealRangeKm("400");
    setVWltpRangeKm("450");
    setVMaxAcKw("7.0");
    setVMaxDcKw("80.0");
    setVEfficiency("15.0");
    setVImageUrl("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80");
    setVDescription("");
    setVConnectors(["CCS2", "GB_T_DC", "TYPE_2_MENNEKES"]);
    setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (veh: any) => {
    setEditingVehicleId(veh.id);
    setVBrand(veh.brand);
    setVModel(veh.model);
    setVYear(veh.year);
    setVYearStart(veh.yearStart || veh.year);
    setVYearEnd(veh.yearEnd || veh.year + 2);
    setVBatteryKwh(veh.batteryKwh.toString());
    setVRealRangeKm(veh.realRangeKm.toString());
    setVWltpRangeKm((veh.wltpRangeKm || Math.round(veh.realRangeKm * 1.15)).toString());
    setVMaxAcKw(veh.maxAcKw.toString());
    setVMaxDcKw(veh.maxDcKw.toString());
    setVEfficiency((veh.efficiencyKwh100 || 15.0).toString());
    setVImageUrl(veh.imageUrl || "");
    setVDescription(veh.description || "");
    setVConnectors(veh.connectorTypes || ["CCS2"]);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async () => {
    try {
      const payload = {
        brand: vBrand,
        model: vModel,
        year: Number(vYear),
        yearStart: Number(vYearStart),
        yearEnd: Number(vYearEnd),
        batteryKwh: parseFloat(vBatteryKwh),
        realRangeKm: parseInt(vRealRangeKm),
        wltpRangeKm: parseInt(vWltpRangeKm),
        maxAcKw: parseFloat(vMaxAcKw),
        maxDcKw: parseFloat(vMaxDcKw),
        efficiencyKwh100: parseFloat(vEfficiency),
        imageUrl: vImageUrl,
        description: vDescription,
        connectorTypes: vConnectors,
      };

      const url = "/api/vehicles";
      const method = editingVehicleId ? "PUT" : "POST";
      const body = editingVehicleId ? { id: editingVehicleId, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message || "Vehículo guardado exitosamente");
      setIsVehicleModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar vehículo");
    }
  };

  const handleDeleteVehicle = async (vehId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta línea de vehículo del catálogo nacional?")) return;
    try {
      const res = await fetch(`/api/vehicles?id=${vehId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.info("Línea de vehículo eliminada del catálogo");
      setVehiclesList((prev) => prev.filter((v) => v.id !== vehId));
    } catch (err: any) {
      toast.error(err.message || "Error eliminando vehículo");
    }
  };

  const toggleConnector = (connector: ConnectorType) => {
    if (vConnectors.includes(connector)) {
      if (vConnectors.length > 1) {
        setVConnectors(vConnectors.filter((c) => c !== connector));
      }
    } else {
      setVConnectors([...vConnectors, connector]);
    }
  };

  // External Free API Lookup
  const searchExternalApi = async (brandToSearch: string) => {
    setApiSearching(true);
    setApiSearchBrand(brandToSearch);
    try {
      const res = await fetch(`/api/vehicles/external-lookup?brand=${encodeURIComponent(brandToSearch)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApiResults(data.data);
      } else {
        setApiResults([]);
      }
    } catch {
      toast.error("Error consultando la API externa gratuita");
    } finally {
      setApiSearching(false);
    }
  };

  const handleImportSingleFromApi = async (item: any) => {
    try {
      const res = await fetch("/api/vehicles/external-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item] }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(`¡${item.brand} ${item.model} importado con éxito al catálogo!`);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Error importando modelo");
    }
  };

  const handleImportAllFromApi = async () => {
    if (apiResults.length === 0) return;
    try {
      const res = await fetch("/api/vehicles/external-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: apiResults }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(`¡${apiResults.length} modelos importados al catálogo nacional!`);
      setIsApiModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Error importando modelos");
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  const popularQuickBrands = ["BYD", "Zeekr", "Dongfeng", "Tesla", "Renault", "Volvo", "Kia", "Hyundai", "JAC", "MG", "Chery", "BMW"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider font-heading">
            <ShieldCheck className="w-4 h-4" />
            Consola Administrativa
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Panel de Control & Catálogo Dinámico
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona marcas y líneas de vehículos eléctricos, importa desde APIs automotrices y modera aportes comunitarios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncStations}
            disabled={isSyncingStations}
            className="gap-1.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Zap className={`w-3.5 h-3.5 text-emerald-500 ${isSyncingStations ? "animate-spin" : ""}`} />
            {isSyncingStations ? "Sincronizando..." : "Sincronizar Electrolineras Colombia"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sincronizar DB
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsApiModalOpen(true);
              searchExternalApi("BYD");
            }}
            className="gap-1.5 text-xs font-semibold text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Importar desde API Gratuita
          </Button>

          <Button variant="electric" size="sm" onClick={openNewVehicleModal} className="gap-1.5 text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5" />
            Ingresar Manual
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 font-heading">Catálogo EV</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">{vehiclesList.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Líneas registradas</p>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 font-heading">Por Moderar</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">{queue.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">En cola de revisión</p>
        </Card>

        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-heading">
              Usuarios
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">{usersList.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Registrados activos</p>
        </Card>

        <Card className="p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 font-heading">Talleres EV</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {workshopsList.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Centros técnicos</p>
        </Card>

        <Card className="p-4 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 font-heading">Marketplace</span>
            <ShoppingBag className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {usersList.reduce((acc, u) => acc + (u._count?.marketplaceListings || 0), 0)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Publicaciones de venta</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalogo" className="space-y-6">
        <TabsList className="grid grid-cols-4 sm:w-[680px]">
          <TabsTrigger value="catalogo" className="gap-1.5">
            <Car className="w-4 h-4" />
            Catálogo Dinámico ({vehiclesList.length})
          </TabsTrigger>
          <TabsTrigger value="cola" className="gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Cola Moderación ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-1.5">
            <Users className="w-4 h-4" />
            Usuarios & Roles ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="talleres-verif" className="gap-1.5">
            <Award className="w-4 h-4" />
            Sellos Taller ({workshopsList.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Catálogo Dinámico de Vehículos */}
        <TabsContent value="catalogo" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground">
                Marcas y Líneas de Vehículos Eléctricos en Colombia
              </h2>
              <p className="text-xs text-muted-foreground">
                Agrega marcas manualmente o expórtalas desde la API pública global (NHTSA vPIC) con especificaciones de batería y conectores.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsApiModalOpen(true);
                  searchExternalApi("BYD");
                }}
                className="gap-1.5 text-xs text-cyan-400"
              >
                <Globe className="w-3.5 h-3.5" />
                Buscar en API Gratuita
              </Button>
              <Button variant="electric" size="sm" onClick={openNewVehicleModal} className="gap-1.5 text-xs font-semibold">
                <PlusCircle className="w-3.5 h-3.5" />
                Nueva Línea Manual
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiclesList.map((veh) => (
              <Card key={veh.id} className="p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 block">
                        {veh.brand}
                      </span>
                      <h3 className="text-base font-bold font-heading text-foreground">
                        {veh.model}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Años: {veh.yearStart || veh.year} {veh.yearEnd ? `- ${veh.yearEnd}` : "+"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditVehicleModal(veh)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title="Editar Especificaciones"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(veh.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar del Catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-spec">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Batería</span>
                      <span className="font-bold text-white">{veh.batteryKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Autonomía</span>
                      <span className="font-bold text-emerald-400">{veh.realRangeKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Carga DC</span>
                      <span className="font-bold text-cyan-400">{veh.maxDcKw} kW</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Conectores:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {veh.connectorTypes?.map((c: any, i: number) => (
                        <ConnectorBadge key={i} type={c} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Propietarios en plataforma:</span>
                  <Badge variant="secondary" className="font-mono-spec font-bold">
                    {veh._count?.usersWithVehicle || 0} usuarios
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Cola de Moderación */}
        <TabsContent value="cola" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold font-heading text-foreground">
              Aportes y Anuncios por Moderar
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "MARKETPLACE", "STATION", "WORKSHOP", "ROUTE", "MANUAL"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === type
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "ALL" ? "Todos" : type}
                </button>
              ))}
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <Card className="p-12 text-center space-y-3 bg-muted/20">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                ¡No hay elementos pendientes de moderación!
              </h3>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.type === "MARKETPLACE"
                            ? "default"
                            : item.type === "STATION"
                            ? "secondary"
                            : item.type === "WORKSHOP"
                            ? "amber"
                            : "purple"
                        }
                        className="text-[10px]"
                      >
                        {item.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Fecha: <strong>{item.date}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    <p className="text-xs text-slate-400 italic pt-1">{item.details}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleModerationAction(item, "REJECT")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs font-semibold"
                      onClick={() => handleModerationAction(item, "APPROVE")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Aprobar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Gestión de Usuarios & Roles */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-foreground">
              Directorio de Usuarios Registrados
            </h2>
          </div>

          <div className="space-y-3">
            {usersList.map((user) => (
              <Card key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      {user.name || "Usuario sin nombre"}
                    </h3>
                    <Badge
                      variant={user.role === "ADMIN" ? "amber" : user.role === "MODERATOR" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email} • Tel: {user.phone || "No registrado"}</p>
                  <p className="text-[11px] text-slate-500">
                    Vehículos en garaje: {user._count?.vehicles || 0} • Rutas: {user._count?.routes || 0} • Anuncios: {user._count?.marketplaceListings || 0}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-40">
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                    >
                      <option value="USER">Rol: USER</option>
                      <option value="MODERATOR">Rol: MODERATOR</option>
                      <option value="ADMIN">Rol: ADMIN</option>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Certificar Talleres */}
        <TabsContent value="talleres-verif" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-foreground">
              Verificación de Sellos Retie / ASE EV
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshopsList.map((ws) => (
              <Card key={ws.id} className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-heading text-foreground">{ws.name}</h3>
                    {ws.isVerified && (
                      <Badge variant="default" className="text-[10px]">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{ws.city} • {ws.address}</p>
                  <p className="text-[11px] text-emerald-500 font-mono-spec">
                    {ws.certifications?.join(" • ") || "Sin certificaciones"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={ws.isVerified ? "outline" : "electric"}
                  onClick={() => toggleWorkshopVerification(ws.id)}
                  className="text-xs font-semibold shrink-0"
                >
                  {ws.isVerified ? "Desmarcar Sello" : "Acreditar Sello Retie"}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Free External API Lookup & Import Modal */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogHeader onClose={() => setIsApiModalOpen(false)}>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <DialogTitle>Importar Modelos desde Catálogo Global (NHTSA vPIC & EV Database)</DialogTitle>
          </div>
          <DialogDescription>
            Consulta en tiempo real marcas y modelos homologados a nivel global con especificaciones de batería y potencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Escribe la marca (ej. Zeekr, BYD, Tesla, Dongfeng, Kia, MG, Chery, Volvo)..."
                value={apiSearchBrand}
                onChange={(e) => setApiSearchBrand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchExternalApi(apiSearchBrand)}
                className="pl-9"
              />
            </div>
            <Button
              variant="electric"
              onClick={() => searchExternalApi(apiSearchBrand)}
              disabled={apiSearching}
              className="font-semibold text-xs gap-1.5"
            >
              <Search className={`w-3.5 h-3.5 ${apiSearching ? "animate-spin" : ""}`} />
              {apiSearching ? "Consultando..." : "Consultar Catálogo"}
            </Button>
          </div>

          {/* Quick Brand Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase mr-1">Marcas Rápidas:</span>
            {popularQuickBrands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => searchExternalApi(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  apiSearchBrand.toLowerCase() === b.toLowerCase()
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* API Results */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground font-heading">
                Modelos Encontrados ({apiResults.length}) para &quot;{apiSearchBrand}&quot;
              </span>
              {apiResults.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImportAllFromApi}
                  className="text-xs font-semibold text-emerald-400 border-emerald-500/30 gap-1"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Importar Todos ({apiResults.length}) al Catálogo
                </Button>
              )}
            </div>

            {apiResults.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-heading">
                      {item.brand} {item.model}
                    </span>
                    <Badge variant="secondary" className="text-[9px]">
                      {item.source === "EV_PRESET" ? "Preset EV Enriquecido" : "NHTSA Global"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono-spec">
                    <span>Pack: <strong className="text-white">{item.batteryKwh} kWh</strong></span>
                    <span>Autonomía: <strong className="text-emerald-400">{item.realRangeKm} km</strong></span>
                    <span>Carga DC: <strong className="text-cyan-400">{item.maxDcKw} kW</strong></span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="electric"
                  onClick={() => handleImportSingleFromApi(item)}
                  className="text-xs font-semibold shrink-0 gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Importar al Catálogo
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsApiModalOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Manual New / Edit Vehicle Modal */}
      <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
        <DialogHeader onClose={() => setIsVehicleModalOpen(false)}>
          <DialogTitle>
            {editingVehicleId ? "Editar Especificaciones de Vehículo" : "Ingresar Marca & Línea Manual"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Marca (Fabricante)
              </label>
              <Input
                placeholder="Ej. BYD, Tesla, Zeekr, Dongfeng"
                value={vBrand}
                onChange={(e) => setVBrand(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Línea / Modelo
              </label>
              <Input
                placeholder="Ej. Dolphin, Yuan Plus, 001"
                value={vModel}
                onChange={(e) => setVModel(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Año Lanzamiento</label>
              <Input type="number" value={vYear} onChange={(e) => setVYear(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Año Inicio Prod.</label>
              <Input type="number" value={vYearStart} onChange={(e) => setVYearStart(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Año Fin Prod.</label>
              <Input type="number" value={vYearEnd} onChange={(e) => setVYearEnd(Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Batería Pack (kWh)</label>
              <Input type="number" value={vBatteryKwh} onChange={(e) => setVBatteryKwh(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Autonomía Real (km)</label>
              <Input type="number" value={vRealRangeKm} onChange={(e) => setVRealRangeKm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">WLTP (km)</label>
              <Input type="number" value={vWltpRangeKm} onChange={(e) => setVWltpRangeKm(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Carga Máx AC (kW)</label>
              <Input type="number" value={vMaxAcKw} onChange={(e) => setVMaxAcKw(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Carga Máx DC (kW)</label>
              <Input type="number" value={vMaxDcKw} onChange={(e) => setVMaxDcKw(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Eficiencia (kWh/100km)</label>
              <Input type="number" value={vEfficiency} onChange={(e) => setVEfficiency(e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Connectors selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground block">
              Conectores Soportados por el Vehículo
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "CCS1", label: "CCS1 Combo 1 (DC Americano)" },
                { type: "CCS2", label: "CCS2 Combo 2 (DC Europeo)" },
                { type: "GB_T_DC", label: "GB/T (DC Chino)" },
                { type: "TYPE_2_MENNEKES", label: "Tipo 2 Mennekes (AC)" },
                { type: "TYPE_1_J1772", label: "Tipo 1 J1772 (AC)" },
                { type: "TESLA_NACS", label: "Tesla NACS" },
                { type: "CHADEMO", label: "CHAdeMO" },
              ].map((c) => {
                const isSelected = vConnectors.includes(c.type as any);
                return (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => toggleConnector(c.type as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "} {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ImageUploader
            value={vImageUrl}
            onChange={setVImageUrl}
            folder="vecolombia/vehicles"
            label="Fotografía Oficial del Vehículo"
          />

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Descripción</label>
            <Textarea value={vDescription} onChange={(e) => setVDescription(e.target.value)} rows={2} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsVehicleModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="electric" onClick={handleSaveVehicle}>
            {editingVehicleId ? "Guardar Cambios" : "Guardar en Catálogo Nacional"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
