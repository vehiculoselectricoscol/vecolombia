"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  MapPin,
  Navigation,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { VehicleItem, ChargingTelemetryStop, UserVehicleItem } from "@/types";
import { toast } from "sonner";

interface TripLoggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTripLogged?: () => void;
}

// Coordenadas conocidas de ciudades colombianas para geocodificación rápida
const COLOMBIA_CITY_COORDS: Record<string, { lat: number; lng: number; altM: number }> = {
  "Bogotá": { lat: 4.6097, lng: -74.0817, altM: 2640 },
  "Bogotá, D.C.": { lat: 4.6097, lng: -74.0817, altM: 2640 },
  "Tunja": { lat: 5.5353, lng: -73.3678, altM: 2820 },
  "Villa de Leyva": { lat: 5.6322, lng: -73.5244, altM: 2140 },
  "Medellín": { lat: 6.2442, lng: -75.5812, altM: 1495 },
  "Cali": { lat: 3.4516, lng: -76.532, altM: 995 },
  "Pereira": { lat: 4.8133, lng: -75.6961, altM: 1411 },
  "Manizales": { lat: 5.0689, lng: -75.5174, altM: 2160 },
  "Armenia": { lat: 4.5339, lng: -75.6811, altM: 1480 },
  "Ibagué": { lat: 4.4389, lng: -75.2322, altM: 1285 },
  "Girardot": { lat: 4.305, lng: -74.8017, altM: 289 },
  "Bucaramanga": { lat: 7.1193, lng: -73.1227, altM: 959 },
  "Barranquilla": { lat: 10.9685, lng: -74.7813, altM: 18 },
  "Cartagena": { lat: 10.391, lng: -75.4794, altM: 2 },
  "Santa Marta": { lat: 11.2408, lng: -74.199, altM: 6 },
  "Villavicencio": { lat: 4.142, lng: -73.6266, altM: 467 },
  "Pasto": { lat: 1.2136, lng: -77.2811, altM: 2527 },
  "Cúcuta": { lat: 7.8939, lng: -72.5078, altM: 320 },
};

export function TripLoggerModal({
  open,
  onOpenChange,
  onTripLogged,
}: TripLoggerModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // User Garage & Catalog
  const [userGarage, setUserGarage] = useState<UserVehicleItem[]>([]);
  const [catalogVehicles, setCatalogVehicles] = useState<VehicleItem[]>([]);
  const [selectedUserVehicleId, setSelectedUserVehicleId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [useCatalogFallback, setUseCatalogFallback] = useState(false);

  // Step 1: Drive Settings
  const [drivingMode, setDrivingMode] = useState<"ECO" | "NORMAL" | "SPORT">("NORMAL");
  const [climateActive, setClimateActive] = useState(true);
  const [passengersCount, setPassengersCount] = useState(2);

  // Step 2: Origin & Start State
  const [originCity, setOriginCity] = useState("Bogotá");
  const [originAddress, setOriginAddress] = useState("Calle 100 #15-20, Chicó");
  const [startSoc, setStartSoc] = useState(95);

  // Step 3: Mid-route Charging Stops
  const [didCharge, setDidCharge] = useState(false);
  const [chargingStops, setChargingStops] = useState<ChargingTelemetryStop[]>([]);
  const [newStopStation, setNewStopStation] = useState("Terpel Voltex Briceño");
  const [newStopStartSoc, setNewStopStartSoc] = useState(35);
  const [newStopEndSoc, setNewStopEndSoc] = useState(80);
  const [newStopKwh, setNewStopKwh] = useState("22.5");
  const [newStopKw, setNewStopKw] = useState("60.0");
  const [newStopCost, setNewStopCost] = useState("38000");
  const [newStopDuration, setNewStopDuration] = useState("28");

  // Step 4: Destination & Arrival State
  const [destinationCity, setDestinationCity] = useState("Tunja");
  const [destinationAddress, setDestinationAddress] = useState("Plaza de Bolívar, Centro");
  const [endSoc, setEndSoc] = useState(42);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(72);
  const [roadNotes, setRoadNotes] = useState("Vía en excelente estado, doble calzada fluida con buen clima.");

  // Calculated Telemetry
  const [distanceKm, setDistanceKm] = useState(138.5);
  const [durationMinutes, setDurationMinutes] = useState(135);
  const [elevationGainM, setElevationGainM] = useState(1150);
  const [actualKwhUsed, setActualKwhUsed] = useState(24.5);
  const [realEfficiency, setRealEfficiency] = useState(17.6);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [elevationProfile, setElevationProfile] = useState<any[]>([]);

  // Fetch User Garage & Dynamic Catalog when opening modal
  useEffect(() => {
    async function loadUserDataAndVehicles() {
      try {
        const [profileRes, catalogRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/vehicles"),
        ]);

        const profileData = await profileRes.json();
        const catalogData = await catalogRes.json();

        if (catalogData.success && catalogData.data) {
          setCatalogVehicles(catalogData.data);
        }

        if (profileData.success && profileData.data?.vehicles?.length > 0) {
          const garage: UserVehicleItem[] = profileData.data.vehicles;
          setUserGarage(garage);

          // Find primary vehicle or first vehicle in garage
          const primary = garage.find((v) => v.isPrimary) || garage[0];
          setSelectedUserVehicleId(primary.id);
          setSelectedVehicleId(primary.vehicle?.id || primary.vehicleId || "");
          setUseCatalogFallback(false);
        } else {
          // No garage yet, fallback to catalog
          setUseCatalogFallback(true);
          if (catalogData.success && catalogData.data?.length > 0) {
            setSelectedVehicleId(catalogData.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading user garage and vehicles", err);
      }
    }

    if (open) {
      loadUserDataAndVehicles();
    }
  }, [open]);

  // Determine current active vehicle specs
  const selectedGarageEntry = userGarage.find((v) => v.id === selectedUserVehicleId);
  const selectedCar =
    (!useCatalogFallback && selectedGarageEntry?.vehicle)
      ? selectedGarageEntry.vehicle
      : catalogVehicles.find((v) => v.id === selectedVehicleId) || catalogVehicles[0];

  // Add a charging stop
  const handleAddStop = () => {
    const stop: ChargingTelemetryStop = {
      stationName: newStopStation,
      startSoc: newStopStartSoc,
      endSoc: newStopEndSoc,
      kwhCharged: parseFloat(newStopKwh) || 0,
      powerKw: parseFloat(newStopKw) || 50,
      costCop: parseInt(newStopCost) || 0,
      durationMinutes: parseInt(newStopDuration) || 25,
      connectorType: "CCS2",
    };
    setChargingStops([...chargingStops, stop]);
    toast.success(`Parada en ${newStopStation} registrada`);
  };

  const handleRemoveStop = (idx: number) => {
    setChargingStops(chargingStops.filter((_, i) => i !== idx));
  };

  // Run calculation via OpenRoute API
  const handleCalculateTelemetry = async () => {
    setCalculating(true);
    try {
      const orig = COLOMBIA_CITY_COORDS[originCity] || { lat: 4.6097, lng: -74.0817, altM: 2640 };
      const dest = COLOMBIA_CITY_COORDS[destinationCity] || { lat: 5.5353, lng: -73.3678, altM: 2820 };

      const res = await fetch("/api/routing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: orig.lat, lng: orig.lng, name: `${originCity} - ${originAddress}` },
          destination: { lat: dest.lat, lng: dest.lng, name: `${destinationCity} - ${destinationAddress}` },
          vehicleSpecs: {
            batteryCapacityKwh: selectedCar?.batteryKwh || 60,
            efficiencyKwh100: selectedCar?.efficiencyKwh100 || 15.2,
            maxDcKw: selectedCar?.maxDcKw || 80,
          },
          initialSocPercent: startSoc,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const routeData = data.data;
        const dist = Math.round(routeData.distanceKm * 10) / 10;
        setDistanceKm(dist);
        setDurationMinutes(routeData.durationMinutes);
        setElevationGainM(routeData.elevationGainM || Math.abs(dest.altM - orig.altM));
        setRoutePolyline(routeData.coordinates || null);
        setElevationProfile(routeData.elevationProfile || []);

        const batterySize = selectedCar?.batteryKwh || 60;
        const batteryDeltaKwh = ((startSoc - endSoc) / 100) * batterySize;
        const totalChargedKwh = chargingStops.reduce((acc, s) => acc + (s.kwhCharged || 0), 0);
        const netKwh = Math.max(1, Math.round((batteryDeltaKwh + totalChargedKwh) * 10) / 10);
        setActualKwhUsed(netKwh);

        const eff = dist > 0 ? Math.round((netKwh / dist) * 100 * 10) / 10 : 15.0;
        setRealEfficiency(eff);
      }
    } catch (err) {
      console.error("Error calculating telemetry", err);
    } finally {
      setCalculating(false);
      setStep(5);
    }
  };

  // Submit Community Trip Log to Database
  const handleSubmitTrip = async () => {
    setLoading(true);
    try {
      const orig = COLOMBIA_CITY_COORDS[originCity] || { lat: 4.6097, lng: -74.0817 };
      const dest = COLOMBIA_CITY_COORDS[destinationCity] || { lat: 5.5353, lng: -73.3678 };

      const title = `${originCity} a ${destinationCity} en ${selectedCar?.brand} ${selectedCar?.model}`;
      const payload = {
        title,
        description: roadNotes || `Viaje real registrado con ${startSoc}% de salida y ${endSoc}% de llegada.`,
        originCity,
        destinationCity,
        originAddress,
        destinationAddress,
        originCoords: { lat: orig.lat, lng: orig.lng },
        destinationCoords: { lat: dest.lat, lng: dest.lng },
        distanceKm,
        durationMinutes,
        elevationGainM,
        startSoc,
        endSoc,
        drivingMode,
        climateActive,
        passengersCount,
        avgSpeedKmh,
        actualKwhUsed,
        realEfficiency,
        chargingTelemetry: chargingStops,
        waypoints: routePolyline,
        elevationProfile,
        vehicleUsedId: selectedCar?.id,
        avgConsumption: realEfficiency,
        difficulty: elevationGainM > 2000 ? "CHALLENGING" : elevationGainM > 1000 ? "MODERATE" : "EASY",
        roadStatus: roadNotes,
        chargingStops: chargingStops.map((s) => ({
          name: s.stationName,
          operator: "Red Comunitaria",
          city: destinationCity,
          powerKw: s.powerKw || 60,
          costCop: s.costCop,
        })),
        photos: selectedCar?.imageUrl ? [selectedCar.imageUrl] : [],
      };

      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("¡Registro de viaje comunitario guardado con éxito!");
      onOpenChange(false);
      if (onTripLogged) onTripLogged();
      setStep(1);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el viaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="xl">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>Bitácora de Viaje Real EV en Colombia</DialogTitle>
            <DialogDescription>
              Registra la telemetría auténtica de tu trayecto para construir la base de consumos reales de la comunidad.
            </DialogDescription>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between pt-4 px-2">
          {[
            { num: 1, label: "Vehículo & Garaje" },
            { num: 2, label: "Salida" },
            { num: 3, label: "Cargas" },
            { num: 4, label: "Llegada" },
            { num: 5, label: "Telemetría" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 text-xs font-semibold">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                    : step > s.num
                    ? "bg-emerald-600/30 text-emerald-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`hidden sm:inline ${step === s.num ? "text-emerald-400" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </DialogHeader>

      <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
        {/* STEP 1: USER GARAGE VEHICLE & DRIVE SETTINGS */}
        {step === 1 && (
          <div className="space-y-4">
            {/* User Garage Card if available */}
            {userGarage.length > 0 && !useCatalogFallback ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/50 space-y-3 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading">
                    <Car className="w-4 h-4" />
                    <span>Vehículo Registrado en tu Garaje</span>
                  </div>
                  <Badge variant="default" className="text-[10px] bg-emerald-500 text-slate-950 font-bold">
                    Cargado Automáticamente
                  </Badge>
                </div>

                {userGarage.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground block">
                      Selecciona cuál de tus carros usaste en este viaje:
                    </label>
                    <Select
                      value={selectedUserVehicleId}
                      onChange={(e) => {
                        setSelectedUserVehicleId(e.target.value);
                        const match = userGarage.find((v) => v.id === e.target.value);
                        if (match?.vehicle) {
                          setSelectedVehicleId(match.vehicle.id);
                        }
                      }}
                    >
                      {userGarage.map((uv) => (
                        <option key={uv.id} value={uv.id}>
                          {uv.vehicle?.brand} {uv.vehicle?.model} ({uv.licensePlate || "Sin placa"} • {uv.modelYear || uv.vehicle?.year})
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {selectedCar && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white font-heading">
                          {selectedCar.brand} {selectedCar.model}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono-spec">
                          Placa: <strong>{selectedGarageEntry?.licensePlate || "EVK-***"}</strong> • Año: <strong>{selectedGarageEntry?.modelYear || selectedCar.year}</strong> • Salud Batería (SOH): <strong>{selectedGarageEntry?.batteryHealth || 99.4}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono-spec">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Capacidad Pack</span>
                        <span className="font-bold text-white">{selectedCar.batteryKwh} kWh</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Autonomía Real</span>
                        <span className="font-bold text-emerald-400">{selectedCar.realRangeKm} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Carga Rápida DC</span>
                        <span className="font-bold text-cyan-400">{selectedCar.maxDcKw} kW</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setUseCatalogFallback(true)}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 underline underline-offset-2"
                >
                  ¿Viajaste en otro vehículo diferente a tu garaje? Cambiar aquí
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block font-heading">
                    1. Selecciona el Vehículo del Catálogo
                  </label>
                  {userGarage.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseCatalogFallback(false)}
                      className="text-xs text-emerald-400 font-semibold"
                    >
                      Volver a mi Garaje
                    </button>
                  )}
                </div>

                <Select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                  {catalogVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.batteryKwh} kWh • {v.realRangeKm} km autonomía)
                    </option>
                  ))}
                </Select>

                {selectedCar && (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono-spec">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Batería Pack</span>
                      <span className="font-bold text-white">{selectedCar.batteryKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Autonomía</span>
                      <span className="font-bold text-emerald-400">{selectedCar.realRangeKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Carga DC</span>
                      <span className="font-bold text-cyan-400">{selectedCar.maxDcKw} kW</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Driving Mode & Cabin Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block">
                  Modo de Manejo
                </label>
                <Select
                  value={drivingMode}
                  onChange={(e) => setDrivingMode(e.target.value as any)}
                  className="mt-1"
                >
                  <option value="ECO">Modo ECO (Ahorro)</option>
                  <option value="NORMAL">Modo Normal / Confort</option>
                  <option value="SPORT">Modo SPORT (Potencia)</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block">
                  Climatización
                </label>
                <Select
                  value={climateActive ? "YES" : "NO"}
                  onChange={(e) => setClimateActive(e.target.value === "YES")}
                  className="mt-1"
                >
                  <option value="YES">A/C o Calefacción Encendido</option>
                  <option value="NO">Apagado / Ventilación natural</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block">
                  Ocupantes
                </label>
                <Select
                  value={passengersCount.toString()}
                  onChange={(e) => setPassengersCount(Number(e.target.value))}
                  className="mt-1"
                >
                  <option value="1">1 Persona (Solo conductor)</option>
                  <option value="2">2 Personas + Equipaje ligero</option>
                  <option value="3">3 Personas + Equipaje</option>
                  <option value="4">4 Personas + Baúl lleno</option>
                  <option value="5">5 Personas (Carga máxima)</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ORIGIN & START SOC */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading">
                <MapPin className="w-4 h-4" />
                Punto de Salida & Estado Inicial
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Ciudad de Salida"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                >
                  {Object.keys(COLOMBIA_CITY_COORDS).map((c) => (
                    <option key={c} value={c}>
                      {c} ({COLOMBIA_CITY_COORDS[c].altM} msnm)
                    </option>
                  ))}
                </Select>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block">
                    Dirección / Punto Exacto
                  </label>
                  <Input
                    placeholder="Ej. Calle 100 con 15 / Portal Norte"
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-heading">
                  <span className="text-muted-foreground">Batería al Salir (% SoC Inicial):</span>
                  <span className="text-emerald-400 font-mono-spec text-base">{startSoc}%</span>
                </div>
                <Slider
                  value={startSoc}
                  min={10}
                  max={100}
                  step={1}
                  onChange={setStartSoc}
                  valueDisplay={`${startSoc}%`}
                />
                <p className="text-[11px] text-slate-400">
                  Energía disponible en tu <strong>{selectedCar?.brand} {selectedCar?.model}</strong>:{" "}
                  <strong>{(((selectedCar?.batteryKwh || 60) * startSoc) / 100).toFixed(1)} kWh</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MID-ROUTE CHARGING STOPS */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-foreground font-heading">
                  ¿Hiciste recargas de batería en el camino?
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registra si paraste en una electrolinera (Celsia, Terpel Voltex, Enel X, EPM).
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDidCharge(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !didCharge ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Ruta Directa
                </button>
                <button
                  type="button"
                  onClick={() => setDidCharge(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    didCharge ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Con Parada de Carga
                </button>
              </div>
            </div>

            {didCharge && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
                    Agregar Parada de Carga
                  </span>
                  <Badge variant="default" className="text-[10px]">
                    {chargingStops.length} registradas
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block">
                      Nombre de la Electrolinera
                    </label>
                    <Input
                      placeholder="Ej. Terpel Voltex Briceño"
                      value={newStopStation}
                      onChange={(e) => setNewStopStation(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground block">SoC Conexión %</label>
                      <Input
                        type="number"
                        value={newStopStartSoc}
                        onChange={(e) => setNewStopStartSoc(Number(e.target.value))}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground block">SoC Desconexión %</label>
                      <Input
                        type="number"
                        value={newStopEndSoc}
                        onChange={(e) => setNewStopEndSoc(Number(e.target.value))}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block">Energía (kWh)</label>
                    <Input
                      type="number"
                      value={newStopKwh}
                      onChange={(e) => setNewStopKwh(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block">Potencia (kW)</label>
                    <Input
                      type="number"
                      value={newStopKw}
                      onChange={(e) => setNewStopKw(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block">Minutos</label>
                    <Input
                      type="number"
                      value={newStopDuration}
                      onChange={(e) => setNewStopDuration(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block">Costo (COP)</label>
                    <Input
                      type="number"
                      value={newStopCost}
                      onChange={(e) => setNewStopCost(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="electric"
                  onClick={handleAddStop}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Agregar Esta Parada a la Bitácora
                </Button>

                {/* List of stops */}
                {chargingStops.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {chargingStops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white font-heading">{stop.stationName}</p>
                          <p className="text-[11px] text-slate-400 font-mono-spec">
                            {stop.startSoc}% ➔ {stop.endSoc}% (+{stop.kwhCharged} kWh a {stop.powerKw} kW en {stop.durationMinutes} min) • ${stop.costCop?.toLocaleString("es-CO")} COP
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DESTINATION & ARRIVAL SOC */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-heading">
                <MapPin className="w-4 h-4" />
                Punto de Llegada & Estado Final
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Ciudad de Destino"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                >
                  {Object.keys(COLOMBIA_CITY_COORDS).map((c) => (
                    <option key={c} value={c}>
                      {c} ({COLOMBIA_CITY_COORDS[c].altM} msnm)
                    </option>
                  ))}
                </Select>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block">
                    Dirección / Punto de Llegada
                  </label>
                  <Input
                    placeholder="Ej. Plaza de Bolívar / Centro"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-heading">
                  <span className="text-muted-foreground">Batería al Llegar (% SoC Final):</span>
                  <span className="text-cyan-400 font-mono-spec text-base">{endSoc}%</span>
                </div>
                <Slider
                  value={endSoc}
                  min={1}
                  max={startSoc + (chargingStops.length > 0 ? 50 : 0)}
                  step={1}
                  onChange={setEndSoc}
                  valueDisplay={`${endSoc}%`}
                />
                <p className="text-[11px] text-slate-400">
                  Energía restante al destino: <strong>{(((selectedCar?.batteryKwh || 60) * endSoc) / 100).toFixed(1)} kWh</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block">
                  Velocidad Promedio Aproximada (km/h)
                </label>
                <Input
                  type="number"
                  value={avgSpeedKmh}
                  onChange={(e) => setAvgSpeedKmh(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block">
                  Comentarios, Estado de la Vía y Clima
                </label>
                <Textarea
                  value={roadNotes}
                  onChange={(e) => setRoadNotes(e.target.value)}
                  rows={2}
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SUMMARY & TELEMETRY RESULT */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-slate-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-heading">
                    Telemetría Calculada con OpenRoute
                  </span>
                  <h3 className="text-base font-bold font-heading text-white">
                    {originCity} ➔ {destinationCity}
                  </h3>
                </div>
                <Badge variant="default" className="text-xs">
                  {selectedCar?.brand} {selectedCar?.model}
                </Badge>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono-spec">
                  <span className="text-[10px] text-slate-400 block">Distancia</span>
                  <span className="text-lg font-black text-white">{distanceKm} km</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono-spec">
                  <span className="text-[10px] text-slate-400 block">Batería Salida/Llegada</span>
                  <span className="text-lg font-black text-emerald-400">
                    {startSoc}% ➔ {endSoc}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono-spec">
                  <span className="text-[10px] text-slate-400 block">Consumo Real Neto</span>
                  <span className="text-lg font-black text-cyan-400">{actualKwhUsed} kWh</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono-spec">
                  <span className="text-[10px] text-slate-400 block">Eficiencia Media</span>
                  <span className="text-lg font-black text-amber-400">{realEfficiency} kWh/100km</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>
                  <strong>Vehículo:</strong> {selectedCar?.brand} {selectedCar?.model} {selectedGarageEntry?.licensePlate ? `(${selectedGarageEntry.licensePlate})` : ""} • <strong>Modo:</strong> {drivingMode} • <strong>Climatización:</strong> {climateActive ? "Encendida" : "Apagada"}
                </p>
                {chargingStops.length > 0 && (
                  <p className="text-emerald-400">
                    <strong>Paradas de Carga ({chargingStops.length}):</strong> {chargingStops.map((s) => `${s.stationName} (+${s.kwhCharged} kWh)`).join(", ")}
                  </p>
                )}
                <p className="text-slate-400 italic pt-1">&quot;{roadNotes}&quot;</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex flex-row items-center justify-between gap-2 border-t border-slate-800 pt-3">
        {step > 1 && step < 5 && (
          <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
            Anterior
          </Button>
        )}

        {step === 1 && (
          <Button variant="electric" size="sm" onClick={() => setStep(2)} className="ml-auto gap-1">
            Siguiente: Salida <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {step === 2 && (
          <Button variant="electric" size="sm" onClick={() => setStep(3)} className="ml-auto gap-1">
            Siguiente: Paradas <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {step === 3 && (
          <Button variant="electric" size="sm" onClick={() => setStep(4)} className="ml-auto gap-1">
            Siguiente: Destino <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {step === 4 && (
          <Button
            variant="electric"
            size="sm"
            onClick={handleCalculateTelemetry}
            disabled={calculating}
            className="ml-auto gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {calculating ? "Calculando con OpenRoute..." : "Generar Telemetría"}
          </Button>
        )}

        {step === 5 && (
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setStep(4)}>
              Modificar
            </Button>
            <Button
              variant="electric"
              size="sm"
              onClick={handleSubmitTrip}
              disabled={loading}
              className="gap-1 font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {loading ? "Publicando..." : "Publicar Registro en la Comunidad"}
            </Button>
          </div>
        )}
      </DialogFooter>
    </Dialog>
  );
}
