"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  PlusCircle,
  Download,
  FileText,
  ShieldAlert,
  Cpu,
  Zap,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { INITIAL_MANUALS } from "@/lib/data/seed-data";
import { ManualItem, ManualCategory } from "@/types";
import { toast } from "sonner";
import { manualSubmissionSchema } from "@/lib/validations";

export default function ManualesPage() {
  const [manuals, setManuals] = useState<ManualItem[]>(INITIAL_MANUALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ManualCategory | "ALL">("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");

  // New Manual Modal States
  const [isNewManualOpen, setIsNewManualOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ManualCategory>("SAFETY_FIRST_RESPONDER");
  const [newBrand, setNewBrand] = useState("BYD");
  const [newModel, setNewModel] = useState("Dolphin");
  const [newFileUrl, setNewFileUrl] = useState("https://res.cloudinary.com/vecolombia/manuals/sample.pdf");

  const filteredManuals = manuals.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.brand && m.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = filterCategory === "ALL" || m.category === filterCategory;
    const matchBrand = filterBrand === "ALL" || m.brand === filterBrand;

    return matchSearch && matchCategory && matchBrand;
  });

  const handleDownload = (manual: ManualItem) => {
    const updated = manuals.map((m) =>
      m.id === manual.id ? { ...m, downloadCount: m.downloadCount + 1 } : m
    );
    setManuals(updated);
    toast.success(`Descargando "${manual.title}"...`);
  };

  const handleCreateManual = () => {
    try {
      const payload = {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        brand: newBrand,
        model: newModel,
        fileUrl: newFileUrl,
        fileSizeBytes: 4500000,
        fileFormat: "PDF",
      };

      const validated = manualSubmissionSchema.parse(payload);

      const newManualItem: ManualItem = {
        id: `man-${Date.now()}`,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        brand: validated.brand,
        model: validated.model,
        fileUrl: validated.fileUrl,
        fileSizeBytes: validated.fileSizeBytes,
        fileFormat: validated.fileFormat,
        downloadCount: 0,
        moderation: "APPROVED",
        uploadedById: "u-current",
        uploadedByName: "Alejandro Ríos",
        createdAt: new Date().toISOString(),
      };

      setManuals([newManualItem, ...manuals]);
      setIsNewManualOpen(false);
      setNewTitle("");
      setNewDescription("");
      toast.success("¡Manual técnico subido y verificado exitosamente!");
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
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-heading">
            <BookOpen className="w-4 h-4" />
            Repositorio Técnico Nacional
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Manuales de Rescate, Diagramas HV & Fichas Técnicas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recursos técnicos abiertos para propietarios, talleres, bomberos y primeros respondientes de vehículos eléctricos en Colombia.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsNewManualOpen(true)}
          className="gap-2 font-semibold shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Subir Manual o Diagrama
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por marca, modelo o tema..."
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
            <option value="SAFETY_FIRST_RESPONDER">Rescate & Bomberos (Puntos de Corte)</option>
            <option value="BATTERY_DIAGNOSTICS">Diagnóstico Batería & BMS</option>
            <option value="CHARGING_INFRASTRUCTURE">Infraestructura & Conectores</option>
            <option value="WORKSHOP_REPAIR">Manuales de Taller & Mecánica HV</option>
            <option value="USER_MANUAL">Manuales de Usuario</option>
          </Select>

          <Select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="ALL">Todas las Marcas</option>
            <option value="BYD">BYD</option>
            <option value="Renault">Renault</option>
            <option value="Tesla">Tesla</option>
            <option value="BMW">BMW</option>
            <option value="Volvo">Volvo</option>
          </Select>
        </div>
      </div>

      {/* Manuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredManuals.map((man) => (
          <Card key={man.id} className="p-6 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-[10px]">
                      {man.category}
                    </Badge>
                    {man.brand && (
                      <span className="text-xs font-mono-spec font-bold text-muted-foreground ml-2">
                        {man.brand} {man.model}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-mono-spec font-bold text-muted-foreground">
                  {(man.fileSizeBytes / 1000000).toFixed(1)} MB • {man.fileFormat}
                </span>
              </div>

              <h3 className="text-base font-bold font-heading text-foreground mt-1">
                {man.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {man.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Aportado por <strong>{man.uploadedByName || "Comunidad"}</strong>
              </span>

              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold gap-1.5 hover:border-cyan-500 hover:text-cyan-400"
                onClick={() => handleDownload(man)}
              >
                <Download className="w-3.5 h-3.5" />
                Descargar ({man.downloadCount})
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Manual Modal */}
      <Dialog open={isNewManualOpen} onOpenChange={setIsNewManualOpen}>
        <DialogHeader onClose={() => setIsNewManualOpen(false)}>
          <DialogTitle>Subir Manual o Ficha Técnica</DialogTitle>
          <DialogDescription>
            Comparte documentación técnica, hojas de rescate o guías de diagnóstico para vehículos eléctricos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Título del Documento
            </label>
            <Input
              placeholder="Ej. Guía de Rescate y Puntos de Corte BYD Dolphin"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="SAFETY_FIRST_RESPONDER">Rescate / Bomberos</option>
              <option value="BATTERY_DIAGNOSTICS">Diagnóstico Batería & BMS</option>
              <option value="CHARGING_INFRASTRUCTURE">Protocolos de Carga</option>
              <option value="WORKSHOP_REPAIR">Manual de Taller</option>
              <option value="USER_MANUAL">Manual de Usuario</option>
            </Select>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Marca
              </label>
              <Input
                placeholder="Ej. BYD"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Modelo
              </label>
              <Input
                placeholder="Ej. Dolphin"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Descripción del Contenido
            </label>
            <Textarea
              placeholder="Detalla qué incluye el manual (ej. diagramas de alto voltaje, balanceo de celdas, desenergización...)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Enlace de Archivo / Cloudinary URL (PDF)
            </label>
            <Input
              value={newFileUrl}
              onChange={(e) => setNewFileUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/.../manual.pdf"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewManualOpen(false)}>
            Cancelar
          </Button>
          <Button variant="electric" onClick={handleCreateManual}>
            Subir Documento
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
