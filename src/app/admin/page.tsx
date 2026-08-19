"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Zap,
  Wrench,
  Compass,
  BookOpen,
  ShoppingBag,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  INITIAL_STATIONS,
  INITIAL_WORKSHOPS,
  INITIAL_ROUTES,
  INITIAL_MANUALS,
  INITIAL_MARKETPLACE,
} from "@/lib/data/seed-data";
import { ModerationStatus } from "@/types";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  type: "STATION" | "WORKSHOP" | "ROUTE" | "MANUAL" | "MARKETPLACE";
  title: string;
  subtitle: string;
  submittedBy: string;
  date: string;
  status: ModerationStatus;
  details: string;
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "mod-1",
    type: "MARKETPLACE",
    title: "Venta: BYD Yuan Plus GLX 2023 - $142.000.000 COP",
    subtitle: "Bogotá • SOH Batería: 99.2% • 18.500 km",
    submittedBy: "Alejandro Ríos",
    date: "Hace 30 min",
    status: "PENDING",
    details: "Vehículo en perfecto estado, cargador Wallbox incluido, peritaje al día.",
  },
  {
    id: "mod-2",
    type: "STATION",
    title: "Enel X Way - Estación La Mesa (Cundinamarca)",
    subtitle: "Km 42 Vía Mosquera - Anapoima",
    submittedBy: "Juan Carlos Ortiz",
    date: "Hace 2 horas",
    status: "PENDING",
    details: "Cargador rápido 50kW CCS2 y 22kW Tipo 2 en Parador Los Arrayanes.",
  },
  {
    id: "mod-3",
    type: "WORKSHOP",
    title: "ElectroAuto Medellín - Servicio Técnico 400V",
    subtitle: "Carrera 65 # 34-12, Belén",
    submittedBy: "Ing. Mauricio Gómez",
    date: "Hace 5 horas",
    status: "PENDING",
    details: "Taller certificado con equipos de diagnóstico para BYD, Renault y Tesla.",
  },
  {
    id: "mod-4",
    type: "MARKETPLACE",
    title: "Venta: Adaptador CCS2 a GB/T DC 150kW - $3.200.000 COP",
    subtitle: "Cali • Estado: Como nuevo",
    submittedBy: "VoltMotors Cali",
    date: "Hace 6 horas",
    status: "PENDING",
    details: "Probado en Terpel Voltex y Celsia a 120kW sin calentamiento.",
  },
  {
    id: "mod-5",
    type: "ROUTE",
    title: "Bogotá a Armenia vía La Línea con parada en Ibagué",
    subtitle: "290 km • Desnivel +3,200m",
    submittedBy: "Paola Morales (BYD Dolphin)",
    date: "Ayer",
    status: "PENDING",
    details: "Consumo real de 42 kWh con regeneración de 3.8 kWh bajando a Calarcá.",
  },
  {
    id: "mod-6",
    type: "MANUAL",
    title: "Diagrama Eléctrico de Potencia e Inversor BYD Dolphin",
    subtitle: "PDF • 8.4 MB",
    submittedBy: "Comunidad EV Medellín",
    date: "Ayer",
    status: "PENDING",
    details: "Documentación técnica para balanceo pasivo de celdas Blade LFP.",
  },
];

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [workshopsList, setWorkshopsList] = useState(INITIAL_WORKSHOPS);
  const [filterType, setFilterType] = useState<string>("ALL");

  const handleApprove = (id: string) => {
    setQueue(queue.map((q) => (q.id === id ? { ...q, status: "APPROVED" } : q)));
    toast.success("¡Contenido APROBADO y publicado en la plataforma nacional!");
  };

  const handleReject = (id: string) => {
    setQueue(queue.map((q) => (q.id === id ? { ...q, status: "REJECTED" } : q)));
    toast.error("Contenido RECHAZADO y notificado al autor.");
  };

  const toggleWorkshopVerification = (id: string) => {
    const updated = workshopsList.map((ws) =>
      ws.id === id ? { ...ws, isVerified: !ws.isVerified } : ws
    );
    setWorkshopsList(updated);
    toast.success("Estado de verificación de taller actualizado");
  };

  const filteredQueue = queue.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  const pendingCount = queue.filter((q) => q.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider font-heading">
            <ShieldCheck className="w-4 h-4" />
            Panel de Control & Moderación
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Administración Nacional VE Colombia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Garantiza la confiabilidad del ecosistema moderando electrolineras, talleres, rutas, manuales y anuncios de compra/venta del Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="amber" className="text-xs py-1.5 px-3 font-semibold">
            {pendingCount} Aportes por Moderar
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-heading">
              Marketplace
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {INITIAL_MARKETPLACE.length + 4}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Anuncios en venta</p>
        </Card>

        <Card className="p-4 border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 font-heading">
              Electrolineras
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {INITIAL_STATIONS.length + 12}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Activas en Colombia</p>
        </Card>

        <Card className="p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 font-heading">Talleres EV</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {workshopsList.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Certificados en HV</p>
        </Card>

        <Card className="p-4 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 font-heading">Rutas 3D</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {INITIAL_ROUTES.length + 8}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Trayectos modelados</p>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 font-heading">Manuales</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black font-mono-spec text-foreground mt-2">
            {INITIAL_MANUALS.length + 15}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Hojas de rescate</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cola" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="cola" className="gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Cola de Moderación ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="talleres-verif" className="gap-1.5">
            <Award className="w-4 h-4" />
            Certificar Talleres
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Cola de Moderación */}
        <TabsContent value="cola" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold font-heading text-foreground">
              Aportes y Anuncios por Moderar
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterType === "ALL" ? "bg-slate-800 text-white" : "text-muted-foreground"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterType("MARKETPLACE")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterType === "MARKETPLACE" ? "bg-slate-800 text-white" : "text-muted-foreground"
                }`}
              >
                Marketplace
              </button>
              <button
                type="button"
                onClick={() => setFilterType("STATION")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterType === "STATION" ? "bg-slate-800 text-white" : "text-muted-foreground"
                }`}
              >
                Electrolineras
              </button>
              <button
                type="button"
                onClick={() => setFilterType("WORKSHOP")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterType === "WORKSHOP" ? "bg-slate-800 text-white" : "text-muted-foreground"
                }`}
              >
                Talleres
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ROUTE")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterType === "ROUTE" ? "bg-slate-800 text-white" : "text-muted-foreground"
                }`}
              >
                Rutas
              </button>
            </div>
          </div>

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
                      Por <strong>{item.submittedBy}</strong> • {item.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  <p className="text-xs text-slate-400 italic pt-1">{item.details}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.status === "PENDING" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleReject(item.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs font-semibold"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Aprobar y Publicar
                      </Button>
                    </>
                  ) : (
                    <Badge variant={item.status === "APPROVED" ? "default" : "destructive"}>
                      {item.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Certificar Talleres */}
        <TabsContent value="talleres-verif" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-foreground">
              Directorio de Talleres y Verificación de Sellos Retie / ASE EV
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
                    {ws.certifications.join(" • ") || "Sin certificaciones"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={ws.isVerified ? "outline" : "electric"}
                  onClick={() => toggleWorkshopVerification(ws.id)}
                  className="text-xs font-semibold shrink-0"
                >
                  {ws.isVerified ? "Desmarcar" : "Verificar Sello"}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
