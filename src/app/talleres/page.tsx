"use client";

import React, { useState } from "react";
import {
  Wrench,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Star,
  Search,
  PlusCircle,
  Award,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { INITIAL_WORKSHOPS } from "@/lib/data/seed-data";
import { WorkshopItem, WorkshopReviewItem } from "@/types";
import { toast } from "sonner";
import { workshopSubmissionSchema, workshopReviewSchema } from "@/lib/validations";

export default function TalleresPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterSpecialty, setFilterSpecialty] = useState("ALL");

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

  const filteredWorkshops = workshops.filter((ws) => {
    const matchSearch =
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBrand =
      filterBrand === "ALL" ||
      ws.supportedBrands.includes(filterBrand) ||
      ws.supportedBrands.includes("Todas");

    const matchSpecialty =
      filterSpecialty === "ALL" ||
      ws.specialties.some((s) => s.toLowerCase().includes(filterSpecialty.toLowerCase()));

    return matchSearch && matchBrand && matchSpecialty;
  });

  const handleAddReview = () => {
    if (!selectedWorkshop) return;
    try {
      const payload = {
        workshopId: selectedWorkshop.id,
        rating: Number(reviewRating),
        serviceDone: reviewService,
        comment: reviewComment,
        costScore: Number(reviewCost),
      };

      workshopReviewSchema.parse(payload);

      const newReview: WorkshopReviewItem = {
        id: `wr-${Date.now()}`,
        workshopId: selectedWorkshop.id,
        userId: "u-current",
        userName: "Alejandro Ríos",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        rating: payload.rating,
        serviceDone: payload.serviceDone,
        comment: payload.comment,
        costScore: payload.costScore,
        verifiedVisit: true,
        createdAt: new Date().toISOString(),
      };

      const updated = workshops.map((w) => {
        if (w.id === selectedWorkshop.id) {
          const currentReviews = w.reviews || [];
          const newCount = w.reviewsCount + 1;
          const newRating = (w.rating * w.reviewsCount + payload.rating) / newCount;
          return {
            ...w,
            reviewsCount: newCount,
            rating: Number(newRating.toFixed(1)),
            reviews: [newReview, ...currentReviews],
          };
        }
        return w;
      });

      setWorkshops(updated);
      setSelectedWorkshop(updated.find((w) => w.id === selectedWorkshop.id) || null);
      setReviewService("");
      setReviewComment("");
      toast.success("¡Opinión sobre el taller registrada con éxito!");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Por favor completa los campos de la reseña.");
      }
    }
  };

  const handleCreateWorkshop = () => {
    try {
      const payload = {
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
      };

      const validated = workshopSubmissionSchema.parse(payload);

      const newWorkshopItem: WorkshopItem = {
        id: `ws-${Date.now()}`,
        name: validated.name,
        address: validated.address,
        city: validated.city,
        department: validated.department,
        latitude: validated.latitude,
        longitude: validated.longitude,
        phone: validated.phone,
        whatsapp: validated.whatsapp,
        specialties: validated.specialties,
        certifications: validated.certifications,
        supportedBrands: validated.supportedBrands,
        photos: validated.photos,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        moderation: "APPROVED",
        createdAt: new Date().toISOString(),
      };

      setWorkshops([newWorkshopItem, ...workshops]);
      setIsNewWorkshopOpen(false);
      setNewName("");
      setNewAddress("");
      toast.success("¡Taller especializado agregado al directorio!");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Por favor revisa los datos del formulario.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <Wrench className="w-4 h-4" />
            Red de Asistencia Técnica
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
            <option value="Inversores">Inversores & Módulos de Potencia</option>
            <option value="Cargadores">Cargadores On-Board (OBC)</option>
            <option value="Climatización">Bomba de Calor & Clima HV</option>
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
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
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
                    ⭐ {ws.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    ({ws.reviewsCount} reseñas)
                  </span>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Especialidades Técnicas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ws.specialties.map((spec, i) => (
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
              {ws.certifications.length > 0 && (
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
                Ver Reseñas & Calificar
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
                  <ShieldCheck className="w-3 h-3 mr-1" /> Certificado
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-1">{selectedWorkshop.name}</DialogTitle>
            <DialogDescription>
              {selectedWorkshop.address} • {selectedWorkshop.city} • Tel: {selectedWorkshop.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {/* New Review Form */}
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
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Comentario sobre la Calidad y Costo
                </label>
                <Textarea
                  placeholder="¿Cómo fue la atención, tiempo de entrega y conocimiento técnico?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <Button size="sm" variant="electric" onClick={handleAddReview} className="w-full font-semibold">
                Publicar Opinión
              </Button>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Opiniones de Clientes ({selectedWorkshop.reviews?.length || 0})
              </h4>

              {selectedWorkshop.reviews && selectedWorkshop.reviews.length > 0 ? (
                selectedWorkshop.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{rev.userName}</span>
                      <span className="text-amber-500 font-mono-spec font-bold">
                        {"⭐".repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-emerald-500 font-semibold">{rev.serviceDone}</p>
                    <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Aún no hay reseñas registradas para este taller.
                </p>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* New Workshop Modal */}
      <Dialog open={isNewWorkshopOpen} onOpenChange={setIsNewWorkshopOpen}>
        <DialogHeader onClose={() => setIsNewWorkshopOpen(false)}>
          <DialogTitle>Registrar Taller Especializado en EV</DialogTitle>
          <DialogDescription>
            Suma tu taller o recomienda un centro de servicio técnico con experiencia en alta tensión.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Nombre del Taller
            </label>
            <Input
              placeholder="Ej. ElectroDrive Colombia"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Dirección
              </label>
              <Input
                placeholder="Ej. Calle 128B # 58A-34"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Ciudad
              </label>
              <Input
                placeholder="Ej. Bogotá"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Departamento
              </label>
              <Input
                placeholder="Ej. Cundinamarca"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Teléfono Fijo / Móvil
              </label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+57 601 745 8920"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                WhatsApp
              </label>
              <Input
                value={newWhatsapp}
                onChange={(e) => setNewWhatsapp(e.target.value)}
                placeholder="+57 310 889 4521"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Especialidades Técnicas (separadas por coma)
            </label>
            <Input
              value={newSpecialties}
              onChange={(e) => setNewSpecialties(e.target.value)}
              placeholder="Ej. Diagnóstico HV, Reparación Baterías BMS, Inversores"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Marcas Atendidas (separadas por coma)
            </label>
            <Input
              value={newBrands}
              onChange={(e) => setNewBrands(e.target.value)}
              placeholder="Ej. BYD, Tesla, Renault, BMW, Todas"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewWorkshopOpen(false)}>
            Cancelar
          </Button>
          <Button variant="electric" onClick={handleCreateWorkshop}>
            Registrar Taller
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
