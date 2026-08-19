"use client";

import React, { useState } from "react";
import {
  Car,
  Compass,
  ShoppingBag,
  PlusCircle,
  Settings,
  Phone,
  Mail,
  Trash2,
  Tag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { ConnectorBadge } from "@/components/connector-badge";
import { DEMO_USER, INITIAL_VEHICLES, INITIAL_ROUTES, INITIAL_MARKETPLACE } from "@/lib/data/seed-data";
import { UserProfile, UserVehicleItem, MarketplaceListingItem } from "@/types";
import { formatCOP } from "@/lib/utils";
import { toast } from "sonner";
import { userProfileSchema, userVehicleSchema } from "@/lib/validations";

export default function UserDashboardPage() {
  const [user, setUser] = useState<UserProfile>(DEMO_USER);
  const [vehicles, setVehicles] = useState<UserVehicleItem[]>(DEMO_USER.vehicles || []);
  const [myListings, setMyListings] = useState<MarketplaceListingItem[]>(
    INITIAL_MARKETPLACE.filter((m) => m.userId === DEMO_USER.id)
  );

  // Edit Profile States
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");

  // Add Vehicle Modal States
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedVehicleCatalogId, setSelectedVehicleCatalogId] = useState(INITIAL_VEHICLES[0].id);
  const [nickname, setNickname] = useState("");
  const [plate, setPlate] = useState("");
  const [batteryHealth, setBatteryHealth] = useState(99.0);

  const handleUpdateProfile = () => {
    try {
      const validated = userProfileSchema.parse({ name, phone });
      setUser({ ...user, name: validated.name, phone: validated.phone });
      toast.success("¡Perfil actualizado con éxito!");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Por favor verifica los datos ingresados.");
      }
    }
  };

  const handleAddVehicle = () => {
    try {
      const validated = userVehicleSchema.parse({
        vehicleId: selectedVehicleCatalogId,
        nickname,
        licensePlate: plate,
        batteryHealth,
        isPrimary: vehicles.length === 0,
      });

      const catalogCar = INITIAL_VEHICLES.find((v) => v.id === validated.vehicleId) || INITIAL_VEHICLES[0];

      const newUV: UserVehicleItem = {
        id: `uv-${Date.now()}`,
        userId: user.id,
        vehicleId: validated.vehicleId,
        nickname: validated.nickname || `${catalogCar.brand} ${catalogCar.model}`,
        licensePlate: validated.licensePlate || "EV-***",
        batteryHealth: validated.batteryHealth || 100,
        isPrimary: validated.isPrimary || false,
        vehicle: catalogCar,
      };

      setVehicles([...vehicles, newUV]);
      setIsAddVehicleOpen(false);
      setNickname("");
      setPlate("");
      toast.success("¡Vehículo agregado a tu garaje!");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Por favor completa los campos del vehículo.");
      }
    }
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.info("Vehículo eliminado del garaje");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="p-6 rounded-3xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.image} fallback="AR" className="w-16 h-16 text-lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-heading text-foreground">{user.name}</h1>
              <Badge variant="default" className="text-[10px]">
                {user.role}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1 font-mono-spec">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="electric"
          size="sm"
          onClick={() => setIsAddVehicleOpen(true)}
          className="gap-2 font-semibold shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar Vehículo al Garaje
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="garaje" className="space-y-6">
        <TabsList className="grid grid-cols-4 sm:w-[600px]">
          <TabsTrigger value="garaje" className="gap-1.5">
            <Car className="w-4 h-4" />
            Mi Garaje EV
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Mis Anuncios ({myListings.length})
          </TabsTrigger>
          <TabsTrigger value="rutas" className="gap-1.5">
            <Compass className="w-4 h-4" />
            Mis Rutas
          </TabsTrigger>
          <TabsTrigger value="perfil" className="gap-1.5">
            <Settings className="w-4 h-4" />
            Perfil
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Mi Garaje EV */}
        <TabsContent value="garaje" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground">
                Vehículos Registrados en Colombia
              </h2>
              <p className="text-xs text-muted-foreground">
                Mantén el registro de salud de batería (SOH %) y especificaciones de carga de tu carro.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((uv) => (
              <Card key={uv.id} className="p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-heading text-foreground">
                        {uv.nickname || `${uv.vehicle.brand} ${uv.vehicle.model}`}
                      </h3>
                      {uv.isPrimary && (
                        <Badge variant="default" className="text-[10px]">
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {uv.vehicle.brand} {uv.vehicle.model} ({uv.vehicle.year}) • Placa: {uv.licensePlate || "Privada"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(uv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono-spec">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Batería Pack</span>
                    <span className="font-bold text-foreground">{uv.vehicle.batteryKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Salud (SOH)</span>
                    <span className="font-bold text-emerald-500">{uv.batteryHealth || 99}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Carga DC Máx</span>
                    <span className="font-bold text-cyan-400">{uv.vehicle.maxDcKw} kW</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Conectores Compatibles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {uv.vehicle.connectorTypes.map((c, i) => (
                      <ConnectorBadge key={i} type={c} />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Mis Anuncios Marketplace */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground">
                Tus Publicaciones en el Marketplace EV
              </h2>
              <p className="text-xs text-muted-foreground">
                Artículos, cargadores o vehículos que tienes publicados y su estado de moderación.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myListings.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.category === "VEHICLE_COMPLETE" ? "default" : "secondary"}>
                      {item.category}
                    </Badge>
                    <Badge variant={item.moderation === "APPROVED" ? "default" : "amber"}>
                      {item.moderation === "APPROVED" ? "Activo / Aprobado" : "En Revisión"}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold font-heading text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono-spec font-bold text-sm text-emerald-500">
                    {formatCOP(item.priceCop)}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.city}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Mis Rutas */}
        <TabsContent value="rutas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ROUTES.slice(0, 2).map((route) => (
              <Card key={route.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500 font-heading">
                    {route.originCity.split(",")[0]} ➔ {route.destinationCity.split(",")[0]}
                  </span>
                  <span className="text-xs font-mono-spec font-bold text-muted-foreground">
                    {route.distanceKm} km
                  </span>
                </div>
                <h4 className="text-sm font-bold font-heading text-foreground">{route.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{route.description}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Desnivel: +{route.elevationGainM}m</span>
                  <Badge variant="default" className="text-[10px]">Aprobada</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Configuración */}
        <TabsContent value="perfil">
          <Card className="max-w-xl p-6 space-y-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold">Datos Personales</CardTitle>
              <CardDescription className="text-xs">
                Información visible para otros miembros de la comunidad VE Colombia.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Nombre Completo
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Correo Electrónico (Google OAuth)
                </label>
                <Input value={user.email} disabled className="mt-1 opacity-70" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Celular / WhatsApp (Para contacto técnico y ventas)
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 312 456 7890"
                  className="mt-1"
                />
              </div>

              <Button variant="electric" onClick={handleUpdateProfile} className="w-full font-semibold">
                Guardar Cambios de Perfil
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vehicle Modal */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogHeader onClose={() => setIsAddVehicleOpen(false)}>
          <DialogTitle>Agregar Carro a Mi Garaje EV</DialogTitle>
          <DialogDescription>
            Selecciona tu modelo para vincular las especificaciones de carga y autonomía.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Select
            label="Modelo del Catálogo"
            value={selectedVehicleCatalogId}
            onChange={(e) => setSelectedVehicleCatalogId(e.target.value)}
          >
            {INITIAL_VEHICLES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.year} • {v.batteryKwh} kWh)
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Apodo / Nombre
              </label>
              <Input
                placeholder="Ej. Mi Delfín Eléctrico"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Placa (Opcional)
              </label>
              <Input
                placeholder="Ej. EVK-123"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Slider
            label="Estado de Salud de la Batería (SOH %)"
            value={batteryHealth}
            min={70}
            max={100}
            step={0.5}
            onChange={setBatteryHealth}
            valueDisplay={`${batteryHealth}%`}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
            Cancelar
          </Button>
          <Button variant="electric" onClick={handleAddVehicle}>
            Guardar en Mi Garaje
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
