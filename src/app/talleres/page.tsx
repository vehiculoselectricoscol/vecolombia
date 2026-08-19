"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Search,
  PlusCircle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { WorkshopItem } from "@/types";
import { toast } from "sonner";

export default function TalleresPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterSpecialty, setFilterSpecialty] = useState("ALL");
  const [, setLoading] = useState(true);

  // Selected Workshop for Detail & Review Modal
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewService, setReviewService] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewCost, setReviewCost] = useState(2);

  // New Workshop Modal States
  const [isNewWorkshopOpen, setIsNewWorkshopOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Bogotá, D.C.");
  const [newDepartment, setNewDepartment] = useState("Cundinamarca");
  const [newPhone, setNewPhone] = useState("+57 ");
  const [newWhatsapp, setNewWhatsapp] = useState("+57 ");
  const [newSpecialties, setNewSpecialties] = useState("Diagnóstico HV, Baterías BMS");
  const [newBrands, setNewBrands] = useState("BYD, Renault, Tesla");

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workshops");
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.data);
      }
    } catch {
      toast.error("Error conectando con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const filteredWorkshops = workshops.filter((ws) => {
    const matchSearch =
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBrand =
      filterBrand === "ALL" ||
      (Array.isArray(ws.supportedBrands) &&
        (ws.supportedBrands.includes(filterBrand) || ws.supportedBrands.includes("Todas")));

    const matchSpecialty =
      filterSpecialty === "ALL" ||
      (Array.isArray(ws.specialties) &&
        ws.specialties.some((s) => s.toLowerCase().includes(filterSpecialty.toLowerCase())));

    return matchSearch && matchBrand && matchSpecialty;
  });

  const handleAddReview = async () => {
    if (!selectedWorkshop) return;
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: selectedWorkshop.id,
          rating: Number(reviewRating),
          serviceDone: reviewService,
          comment: reviewComment,
          costScore: Number(reviewCost),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Opinión registrada con éxito!");
      setReviewService("");
      setReviewComment("");
      fetchWorkshops();
      setSelectedWorkshop(null);
    } catch (err: any) {
      toast.error(err.message || "Error al calificar taller");
    }
  };

  const handleCreateWorkshop = async () => {
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          address: newAddress,
          city: newCity,
          department: newDepartment,
          latitude: 4.6097,
          longitude: -74.0817,
          phone: newPhone,
          whatsapp: newWhatsapp,
          specialties: newSpecialties.split(",").map((s) => s.trim()),
          certifications: ["Taller Registrado VE Colombia"],
          supportedBrands: newBrands.split(",").map((b) => b.trim()),
          photos: ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80"],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Taller registrado con éxito!");
      setIsNewWorkshopOpen(false);
      setNewName("");
      setNewAddress("");
      fetchWorkshops();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar taller");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Wrench className="w-4 h-4" />
            Red Nacional de Asistencia Técnica EV
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Talleres Especializados en Vehículos Eléctricos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Encuentra centros certificados en diagnóstico de alto voltaje, balanceo de baterías BMS, inversores y mantenimiento preventivo en Colombia.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsNewWorkshopOpen(true)}
          className="gap-2 font-semibold shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Taller EV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="ALL">Todas las Marcas de Vehículo</option>
            <option value="BYD">BYD</option>
            <option value="Tesla">Tesla</option>
            <option value="Renault">Renault E-Tech</option>
            <option value="BMW">BMW i</option>
            <option value="Volvo">Volvo Recharge</option>
            <option value="Hyundai">Hyundai / Kia</option>
          </Select>

          <Select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            <option value="ALL">Todas las Especialidades Técnicas</option>
            <option value="Baterías">Baterías BMS & Celdas</option>
            <option value="Diagnóstico">Diagnóstico Scanner HV</option>
            <option value="Inversores">Inversores & Módulos</option>
            <option value="Cargadores">Cargadores On-Board</option>
          </Select>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkshops.map((ws) => (
          <Card key={ws.id} className="p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-heading text-foreground">{ws.name}</h3>
                    {ws.isVerified && (
                      <Badge variant="default" className="text-[10px] shrink-0">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verificado Retie
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{ws.city}, {ws.department}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ws.address}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono-spec font-bold text-amber-500 text-sm">
                    ⭐ {ws.rating?.toFixed(1) || "5.0"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    ({ws.reviewsCount || 0} opiniones)
                  </span>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Especialidades Técnicas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(ws.specialties) &&
                    ws.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20"
                      >
                        {spec}
                      </span>
                    ))}
                </div>
              </div>

              {/* Certifications */}
              {Array.isArray(ws.certifications) && ws.certifications.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <Award className="w-3 h-3 text-amber-500" />
                    Certificaciones:
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {ws.certifications.join(" • ")}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {ws.whatsapp && (
                <a
                  href={`https://wa.me/${ws.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}

              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
                onClick={() => setSelectedWorkshop(ws)}
              >
                Calificar Taller
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Workshop Detail & Review Modal */}
      {selectedWorkshop && (
        <Dialog open={!!selectedWorkshop} onOpenChange={() => setSelectedWorkshop(null)}>
          <DialogHeader onClose={() => setSelectedWorkshop(null)}>
            <div className="flex items-center gap-2">
              <Badge variant="default">Taller Especializado</Badge>
              {selectedWorkshop.isVerified && (
                <Badge variant="default">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Certificado Retie
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-1">{selectedWorkshop.name}</DialogTitle>
            <DialogDescription>
              {selectedWorkshop.address} • {selectedWorkshop.city} • Tel: {selectedWorkshop.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
                Dejar Calificación de Servicio Técnico
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Calificación"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Muy bueno)</option>
                  <option value="3">⭐⭐⭐ (3 - Promedio)</option>
                  <option value="2">⭐⭐ (2 - Deficiente)</option>
                  <option value="1">⭐ (1 - Pésimo)</option>
                </Select>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Servicio Realizado
                  </label>
                  <Input
                    placeholder="Ej. Diagnóstico BMS y balanceo"
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Select
                  label="Relación Calidad / Precio"
                  value={reviewCost.toString()}
                  onChange={(e) => setReviewCost(Number(e.target.value))}
                >
                  <option value="1">💲 Económico / Justo</option>
                  <option value="2">💲💲 Precio Estándar</option>
                  <option value="3">💲💲💲 Costoso</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Comentario
                </label>
                <Textarea
                  placeholder="¿Cómo fue la atención y conocimiento técnico?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <Button size="sm" variant="electric" onClick={handleAddReview} className="w-full font-semibold">
                Guardar Opinión
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* New Workshop Modal */}
      <Dialog open={isNewWorkshopOpen} onOpenChange={setIsNewWorkshopOpen}>
        <DialogHeader onClose={() => setIsNewWorkshopOpen(false)}>
          <DialogTitle>Registrar Taller Especializado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Nombre del Taller</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Teléfono</label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">WhatsApp</label>
              <Input value={newWhatsapp} onChange={(e) => setNewWhatsapp(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Especialidades (separadas por coma)</label>
            <Input value={newSpecialties} onChange={(e) => setNewSpecialties(e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Marcas Atendidas (separadas por coma)</label>
            <Input value={newBrands} onChange={(e) => setNewBrands(e.target.value)} placeholder="Ej. BYD, Renault, Tesla, MG" className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewWorkshopOpen(false)}>Cancelar</Button>
          <Button variant="electric" onClick={handleCreateWorkshop}>Registrar Taller</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
