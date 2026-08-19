"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Search,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ManualItem, ManualCategory } from "@/types";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export default function ManualesPage() {
  const [manuals, setManuals] = useState<ManualItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ManualCategory | "ALL">("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [, setLoading] = useState(true);

  // New Manual Modal States
  const [isNewManualOpen, setIsNewManualOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ManualCategory>("USER_MANUAL");
  const [newBrand, setNewBrand] = useState("BYD");
  const [newFileUrl, setNewFileUrl] = useState("https://res.cloudinary.com/demo/image/upload/sample.pdf");

  const fetchManuals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manuals");
      const data = await res.json();
      if (data.success) {
        setManuals(data.data);
      }
    } catch {
      toast.error("Error conectando con el repositorio de manuales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const filteredManuals = manuals.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.brand && m.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = filterCategory === "ALL" || m.category === filterCategory;
    const matchBrand = filterBrand === "ALL" || m.brand === filterBrand;

    return matchSearch && matchCategory && matchBrand;
  });

  const handleDownload = async (manual: ManualItem) => {
    try {
      await fetch("/api/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualId: manual.id, action: "DOWNLOAD" }),
      });
      toast.success(`Descargando: ${manual.title}`);
      window.open(manual.fileUrl, "_blank");
      fetchManuals();
    } catch {
      window.open(manual.fileUrl, "_blank");
    }
  };

  const handleCreateManual = async () => {
    try {
      const res = await fetch("/api/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          brand: newBrand,
          fileUrl: newFileUrl,
          fileSizeBytes: 4800000,
          fileFormat: "PDF",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Manual técnico registrado con éxito!");
      setIsNewManualOpen(false);
      setNewTitle("");
      setNewDescription("");
      fetchManuals();
    } catch (err: any) {
      toast.error(err.message || "Error al subir manual");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <BookOpen className="w-4 h-4" />
            Repositorio Técnico & Hojas de Rescate EV
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Manuales, Guías y Diagramas de Alto Voltaje
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acceso abierto a manuales de propietario, hojas de rescate para cuerpos de bomberos, diagramas de potencia e informes de degradación de baterías.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsNewManualOpen(true)}
          className="gap-2 font-semibold shadow-md self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Aportar Manual / PDF
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por modelo, título o tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="SAFETY_FIRST_RESPONDER">Hojas de Rescate (Bomberos/Emergencias)</option>
            <option value="WIRING_HIGH_VOLTAGE">Diagramas de Alto Voltaje (HV)</option>
            <option value="BATTERY_DIAGNOSTICS">Diagnóstico de Batería & BMS</option>
            <option value="USER_MANUAL">Manuales de Propietario</option>
            <option value="CHARGING_INFRASTRUCTURE">Infraestructura & Wallbox</option>
          </Select>

          <Select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="ALL">Todas las Marcas</option>
            <option value="BYD">BYD</option>
            <option value="Tesla">Tesla</option>
            <option value="Renault">Renault</option>
            <option value="Volvo">Volvo</option>
            <option value="Universal">General / Multimarca</option>
          </Select>
        </div>
      </div>

      {/* Manuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManuals.map((manual) => (
          <Card key={manual.id} className="p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {manual.brand || "General"}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold font-heading text-foreground line-clamp-1">{manual.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{manual.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono-spec">
                <span>{formatBytes(manual.fileSizeBytes || 4500000)} • PDF</span>
                <span>{manual.downloadCount || 0} descargas</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="electric"
                size="sm"
                className="w-full gap-2 font-semibold"
                onClick={() => handleDownload(manual)}
              >
                <Download className="w-4 h-4" />
                Descargar Documento
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Manual Modal */}
      <Dialog open={isNewManualOpen} onOpenChange={setIsNewManualOpen}>
        <DialogHeader onClose={() => setIsNewManualOpen(false)}>
          <DialogTitle>Aportar Manual o Hoja de Rescate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Título del Documento</label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="USER_MANUAL">Manual de Propietario</option>
              <option value="SAFETY_FIRST_RESPONDER">Hoja de Rescate (Bomberos)</option>
              <option value="WIRING_HIGH_VOLTAGE">Diagrama Eléctrico HV</option>
              <option value="BATTERY_DIAGNOSTICS">Diagnóstico Batería / BMS</option>
              <option value="CHARGING_INFRASTRUCTURE">Cargador / Wallbox</option>
            </Select>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Marca</label>
              <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">URL del Documento / PDF</label>
            <Input value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Descripción</label>
            <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewManualOpen(false)}>Cancelar</Button>
          <Button variant="electric" onClick={handleCreateManual}>Publicar Documento</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
