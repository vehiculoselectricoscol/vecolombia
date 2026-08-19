"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Car,
  Zap,
  Cable,
  Cpu,
  Layers,
  Search,
  PlusCircle,
  MessageCircle,
  MapPin,
  BatteryCharging,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { MarketplaceListingItem, MarketplaceCategory, ItemCondition } from "@/types";
import { formatCOP } from "@/lib/utils";
import { toast } from "sonner";

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<MarketplaceCategory | "ALL">("ALL");
  const [filterCondition, setFilterCondition] = useState<ItemCondition | "ALL">("ALL");
  const [filterCity, setFilterCity] = useState("ALL");
  const [, setLoading] = useState(true);

  // Selected Listing for Detail Modal
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingItem | null>(null);

  // New Listing Modal States
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<MarketplaceCategory>("VEHICLE_COMPLETE");
  const [newCondition, setNewCondition] = useState<ItemCondition>("USED_GOOD");
  const [newPrice, setNewPrice] = useState("");
  const [newCity, setNewCity] = useState("Bogotá, D.C.");
  const [newDepartment, setNewDepartment] = useState("Cundinamarca");
  const [newPhone, setNewPhone] = useState("+57 312 456 7890");
  const [newPhotoUrl, setNewPhotoUrl] = useState("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80");
  
  // Specific vehicle fields
  const [newBrand, setNewBrand] = useState("BYD");
  const [newModel, setNewModel] = useState("Yuan Plus");
  const [newYear, setNewYear] = useState(2023);
  const [newMileage, setNewMileage] = useState("18000");
  const [newSoh, setNewSoh] = useState(99.0);
  const [newPlate, setNewPlate] = useState("EVK-***");
  const [newPowerKw, setNewPowerKw] = useState("7.4");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace");
      const data = await res.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch {
      toast.error("Error conectando con el Marketplace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vehicleBrand && item.vehicleBrand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = filterCategory === "ALL" || item.category === filterCategory;
    const matchCondition = filterCondition === "ALL" || item.condition === filterCondition;
    const matchCity = filterCity === "ALL" || item.city.toLowerCase().includes(filterCity.toLowerCase());

    return matchSearch && matchCategory && matchCondition && matchCity;
  });

  const categories = [
    { key: "ALL", label: "Todo el Marketplace", icon: ShoppingBag },
    { key: "VEHICLE_COMPLETE", label: "Carros Eléctricos", icon: Car },
    { key: "CHARGER_WALLBOX", label: "Wallbox & Cargadores", icon: Zap },
    { key: "ADAPTER_CONNECTOR", label: "Adaptadores", icon: Cable },
    { key: "BATTERY_CELLS_BMS", label: "Baterías & BMS", icon: Cpu },
    { key: "ACCESSORIES_TIRES", label: "Accesorios & Llantas", icon: Layers },
  ];

  const handleCreateListing = async () => {
    try {
      const payload: any = {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        condition: newCondition,
        priceCop: parseFloat(newPrice),
        isNegotiable: true,
        city: newCity,
        department: newDepartment,
        contactPhone: newPhone,
        photos: [newPhotoUrl],
      };

      if (newCategory === "VEHICLE_COMPLETE") {
        payload.vehicleBrand = newBrand;
        payload.vehicleModel = newModel;
        payload.vehicleYear = Number(newYear);
        payload.mileageKm = Number(newMileage);
        payload.batteryHealthSoh = Number(newSoh);
        payload.licensePlateMask = newPlate;
        payload.connectorType = "CCS2";
      } else if (newCategory === "CHARGER_WALLBOX" || newCategory === "ADAPTER_CONNECTOR") {
        payload.chargingPowerKw = parseFloat(newPowerKw);
      }

      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Anuncio publicado exitosamente!");
      setIsNewListingOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPrice("");
      fetchListings();
    } catch (err: any) {
      toast.error(err.message || "Error al publicar en Marketplace");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider font-heading">
            <ShoppingBag className="w-4 h-4" />
            Marketplace Comunitario de Movilidad Eléctrica
          </div>
          <h1 className="text-3xl font-black font-heading text-foreground mt-1">
            Compra y Venta de Vehículos Eléctricos, Cargadores & Partes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comercio seguro entre propietarios en Colombia: carros con reporte de salud de batería (SOH), cargadores Wallbox, adaptadores y celdas.
          </p>
        </div>

        <Button
          variant="electric"
          onClick={() => setIsNewListingOpen(true)}
          className="gap-2 font-semibold shadow-md self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Publicar Anuncio
        </Button>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filterCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterCategory(cat.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-card border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por marca, modelo o cargador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value as any)}
          >
            <option value="ALL">Cualquier Estado / Condición</option>
            <option value="NEW">Nuevo / En Caja</option>
            <option value="LIKE_NEW">Como Nuevo / Poco Uso</option>
            <option value="USED_GOOD">Usado en Buen Estado</option>
            <option value="FOR_PARTS">Para Repuestos</option>
          </Select>

          <Select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="ALL">Todas las Ciudades de Colombia</option>
            <option value="Bogotá">Bogotá, D.C.</option>
            <option value="Medellín">Medellín / Antioquia</option>
            <option value="Cali">Cali / Valle</option>
            <option value="Pereira">Pereira / Eje Cafetero</option>
            <option value="Bucaramanga">Bucaramanga</option>
          </Select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.photos[0] || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={item.category === "VEHICLE_COMPLETE" ? "default" : "secondary"}>
                    {item.category === "VEHICLE_COMPLETE"
                      ? "Vehículo EV"
                      : item.category === "CHARGER_WALLBOX"
                      ? "Wallbox"
                      : item.category === "ADAPTER_CONNECTOR"
                      ? "Adaptador"
                      : "Repuesto/Accesorio"}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono-spec font-bold text-emerald-400 border border-slate-800">
                  {formatCOP(item.priceCop)}
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {item.city}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.condition === "NEW" ? "Nuevo" : item.condition === "LIKE_NEW" ? "Como nuevo" : "Usado"}
                  </span>
                </div>

                <CardTitle className="text-base font-bold font-heading line-clamp-1 mt-1 text-foreground">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>

              {item.category === "VEHICLE_COMPLETE" && item.batteryHealthSoh && (
                <div className="px-5 py-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono-spec flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                      Salud Batería (SOH):
                    </span>
                    <span className="font-bold text-emerald-500">{item.batteryHealthSoh}%</span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-5 pt-0 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Por <strong>{item.userName || "Propietario"}</strong>
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, "")}?text=Hola,%20vi%20tu%20publicacion%20en%20VE%20Colombia:%20${encodeURIComponent(item.title)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs text-emerald-500 hover:text-emerald-400">
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="electric"
                  className="h-8 text-xs font-semibold"
                  onClick={() => setSelectedListing(item)}
                >
                  Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogHeader onClose={() => setSelectedListing(null)}>
            <div className="flex items-center gap-2">
              <Badge variant="default">{selectedListing.category}</Badge>
              <span className="text-xs text-muted-foreground">{selectedListing.city}, {selectedListing.department}</span>
            </div>
            <DialogTitle className="mt-1">{selectedListing.title}</DialogTitle>
            <DialogDescription className="font-mono-spec text-lg font-bold text-emerald-500">
              {formatCOP(selectedListing.priceCop)} {selectedListing.isNegotiable && "(Negociable)"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-900">
              <img
                src={selectedListing.photos[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedListing.category === "VEHICLE_COMPLETE" && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-spec">
                <div>
                  <span className="text-slate-400 block text-[10px]">Año</span>
                  <span className="font-bold text-white">{selectedListing.vehicleYear || 2023}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kilometraje</span>
                  <span className="font-bold text-white">{selectedListing.mileageKm || 0} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Salud Batería (SOH)</span>
                  <span className="font-bold text-emerald-400">{selectedListing.batteryHealthSoh}%</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Descripción del Vendedor
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedListing.description}
              </p>
            </div>
          </div>
        </Dialog>
      )}

      {/* New Listing Modal */}
      <Dialog open={isNewListingOpen} onOpenChange={setIsNewListingOpen}>
        <DialogHeader onClose={() => setIsNewListingOpen(false)}>
          <DialogTitle>Publicar Anuncio en el Marketplace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Título del Anuncio</label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="VEHICLE_COMPLETE">Vehículo Eléctrico Completo</option>
              <option value="CHARGER_WALLBOX">Cargador de Pared / Wallbox</option>
              <option value="ADAPTER_CONNECTOR">Adaptador de Carga</option>
              <option value="BATTERY_CELLS_BMS">Celdas de Batería & BMS</option>
              <option value="ACCESSORIES_TIRES">Accesorios / Repuestos</option>
            </Select>

            <Select
              label="Condición"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value as any)}
            >
              <option value="NEW">Nuevo / En Caja</option>
              <option value="LIKE_NEW">Como Nuevo / Poco Uso</option>
              <option value="USED_GOOD">Usado en Buen Estado</option>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Precio (COP)</label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="mt-1" />
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

          {newCategory === "VEHICLE_COMPLETE" && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block font-heading">
                Detalles del Carro Eléctrico
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Marca</label>
                  <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Modelo</label>
                  <Input value={newModel} onChange={(e) => setNewModel(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Kilometraje</label>
                  <Input value={newMileage} onChange={(e) => setNewMileage(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Año</label>
                  <Input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Placa (ej. EVK-***)</label>
                  <Input value={newPlate} onChange={(e) => setNewPlate(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <Slider
                label="Salud Batería (SOH %)"
                value={newSoh}
                min={70}
                max={100}
                step={0.1}
                onChange={setNewSoh}
                valueDisplay={`${newSoh}%`}
              />
            </div>
          )}

          {(newCategory === "CHARGER_WALLBOX" || newCategory === "ADAPTER_CONNECTOR") && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Potencia de Carga (kW)</label>
              <Input value={newPowerKw} onChange={(e) => setNewPowerKw(e.target.value)} placeholder="Ej. 7.4 o 22" className="h-8 text-xs" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Descripción</label>
            <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="mt-1" />
          </div>

          <ImageUploader
            value={newPhotoUrl}
            onChange={setNewPhotoUrl}
            folder="vecolombia/marketplace"
            label="Fotografía Real del Vehículo / Artículo"
          />

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Teléfono / WhatsApp</label>
            <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewListingOpen(false)}>Cancelar</Button>
          <Button variant="electric" onClick={handleCreateListing}>Publicar Anuncio</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
