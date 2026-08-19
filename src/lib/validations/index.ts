import { z } from "zod";

export const ConnectorTypeEnum = z.enum([
  "TYPE_1_J1772",
  "TYPE_2_MENNEKES",
  "CCS1",
  "CCS2",
  "GB_T_AC",
  "GB_T_DC",
  "CHADEMO",
  "TESLA_NACS",
]);

export const StationStatusEnum = z.enum([
  "OPERATIONAL",
  "LIMITED",
  "OUT_OF_SERVICE",
  "MAINTENANCE",
]);

export const StationAccessEnum = z.enum([
  "PUBLIC",
  "HOTEL_GUEST_ONLY",
  "SHOPPING_CUSTOMER",
  "PAID_PARKING",
  "RESTRICTED",
]);

export const ManualCategoryEnum = z.enum([
  "USER_MANUAL",
  "WORKSHOP_REPAIR",
  "WIRING_HIGH_VOLTAGE",
  "CHARGING_INFRASTRUCTURE",
  "SAFETY_FIRST_RESPONDER",
  "BATTERY_DIAGNOSTICS",
]);

export const MarketplaceCategoryEnum = z.enum([
  "VEHICLE_COMPLETE",
  "CHARGER_WALLBOX",
  "ADAPTER_CONNECTOR",
  "BATTERY_CELLS_BMS",
  "HV_PARTS_INVERTER",
  "ACCESSORIES_TIRES",
]);

export const ItemConditionEnum = z.enum([
  "NEW",
  "LIKE_NEW",
  "USED_GOOD",
  "FOR_PARTS",
]);

// Connector specification in station
export const connectorSpecSchema = z.object({
  type: ConnectorTypeEnum,
  powerKw: z.number().min(1, "La potencia debe ser al menos 1 kW").max(400, "Potencia máxima 400 kW"),
  count: z.number().int().min(1, "Debe haber al menos 1 conector"),
  pricePerKwh: z.number().optional(),
  isAvailable: z.boolean().default(true),
});

// 1. Electrolinera Submission Validation
export const stationSubmissionSchema = z.object({
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  operator: z.string().trim().min(2, "Indica el operador (ej. Celsia, Terpel Voltex, Enel X)"),
  address: z.string().trim().min(5, "Dirección requerida"),
  city: z.string().trim().min(2, "Ciudad requerida"),
  department: z.string().trim().min(2, "Departamento requerido"),
  latitude: z.number().min(-4.3).max(13.5, "Coordenada de latitud fuera de Colombia"),
  longitude: z.number().min(-82.0).max(-66.8, "Coordenada de longitud fuera de Colombia"),
  status: StationStatusEnum.default("OPERATIONAL"),
  access: StationAccessEnum.default("PUBLIC"),
  connectors: z.array(connectorSpecSchema).min(1, "Debes agregar al menos 1 conector/tipo de carga"),
  photos: z.array(z.string().url("URL de imagen inválida")).default([]),
  amenities: z.array(z.string()).default([]),
  priceInfo: z.string().max(100).optional(),
});

export type StationSubmissionInput = z.infer<typeof stationSubmissionSchema>;

// 2. Route Submission Validation
export const routeSubmissionSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(120),
  description: z.string().trim().min(5, "Describe brevemente la ruta o recomendaciones"),
  originCity: z.string().trim().min(2, "Ciudad de origen requerida"),
  destinationCity: z.string().trim().min(2, "Ciudad de destino requerida"),
  originAddress: z.string().optional(),
  destinationAddress: z.string().optional(),
  originCoords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destinationCoords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  distanceKm: z.number().positive("Distancia debe ser positiva"),
  durationMinutes: z.number().int().positive("Duración estimada requerida"),
  elevationGainM: z.number().int().optional(),
  startSoc: z.number().min(1).max(100).optional(),
  endSoc: z.number().min(0).max(100).optional(),
  drivingMode: z.string().optional(),
  climateActive: z.boolean().optional(),
  passengersCount: z.number().int().optional(),
  avgSpeedKmh: z.number().optional(),
  actualKwhUsed: z.number().optional(),
  realEfficiency: z.number().optional(),
  chargingTelemetry: z.array(z.any()).optional(),
  waypoints: z.any().optional(),
  elevationProfile: z.array(z.any()).optional(),
  vehicleUsedId: z.string().optional(),
  avgConsumption: z.number().positive().optional(),
  difficulty: z.enum(["EASY", "MODERATE", "CHALLENGING"]).default("MODERATE"),
  roadStatus: z.string().max(100).optional(),
  chargingStops: z.array(z.any()).default([]),
  photos: z.array(z.string()).default([]),
});

export type RouteSubmissionInput = z.infer<typeof routeSubmissionSchema>;

// 3. Workshop Submission Validation
export const workshopSubmissionSchema = z.object({
  name: z.string().trim().min(3, "Nombre del taller requerido").max(100),
  address: z.string().trim().min(5, "Dirección requerida"),
  city: z.string().trim().min(2, "Ciudad requerida"),
  department: z.string().trim().min(2, "Departamento requerido"),
  latitude: z.number().min(-4.3).max(13.5),
  longitude: z.number().min(-82.0).max(-66.8),
  phone: z.string().trim().min(7, "Teléfono de contacto requerido"),
  whatsapp: z.string().trim().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  specialties: z.array(z.string()).min(1, "Selecciona al menos una especialidad técnica EV"),
  certifications: z.array(z.string()).default([]),
  supportedBrands: z.array(z.string()).min(1, "Indica qué marcas atienden"),
  photos: z.array(z.string().url()).default([]),
});

export type WorkshopSubmissionInput = z.infer<typeof workshopSubmissionSchema>;

// 4. Manual Submission Validation
export const manualSubmissionSchema = z.object({
  title: z.string().trim().min(5, "Título del manual requerido").max(150),
  description: z.string().trim().min(10, "Descripción del contenido requerida"),
  category: ManualCategoryEnum,
  fileUrl: z.string().url("Enlace de archivo de Cloudinary inválido"),
  fileSizeBytes: z.number().int().positive("Tamaño de archivo requerido"),
  fileFormat: z.string().default("PDF"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(2010).max(2030).optional(),
});

export type ManualSubmissionInput = z.infer<typeof manualSubmissionSchema>;

// 5. Charging Review Validation
export const chargingReviewSchema = z.object({
  stationId: z.string().min(1, "ID de estación requerido"),
  rating: z.number().int().min(1).max(5, "Calificación de 1 a 5 estrellas"),
  comment: z.string().trim().min(3, "Escribe un comentario sobre tu experiencia de carga"),
  connectorUsed: ConnectorTypeEnum.optional(),
  powerDeliveredKw: z.number().positive().optional(),
  costTotalCop: z.number().int().positive().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export type ChargingReviewInput = z.infer<typeof chargingReviewSchema>;

// 6. Workshop Review Validation
export const workshopReviewSchema = z.object({
  workshopId: z.string().min(1, "ID de taller requerido"),
  rating: z.number().int().min(1).max(5),
  serviceDone: z.string().trim().min(3, "Servicio realizado"),
  comment: z.string().trim().min(5, "Comentario sobre la calidad del servicio"),
  costScore: z.number().int().min(1).max(3).optional(),
});

export type WorkshopReviewInput = z.infer<typeof workshopReviewSchema>;

// 7. Route Comment Validation
export const routeCommentSchema = z.object({
  routeId: z.string().min(1),
  content: z.string().trim().min(3, "Tu aporte o comentario sobre este trayecto"),
  rating: z.number().int().min(1).max(5).optional(),
  actualKwhUsed: z.number().positive().optional(),
  travelDate: z.string().optional(),
});

export type RouteCommentInput = z.infer<typeof routeCommentSchema>;

// 8. User Profile & Vehicle Validation
export const userProfileSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido"),
  phone: z.string().trim().min(10, "Número de celular válido en Colombia (10 dígitos)").optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
});

export const userVehicleSchema = z.object({
  vehicleId: z.string().min(1, "Selecciona una marca y línea del catálogo"),
  modelYear: z.number().int().min(2010).max(2030).optional(),
  nickname: z.string().max(50).optional(),
  licensePlate: z.string().max(8).optional(),
  batteryHealth: z.number().min(50).max(100).optional(),
  isPrimary: z.boolean().default(true),
});

export const catalogVehicleSchema = z.object({
  brand: z.string().trim().min(2, "Marca requerida (ej. BYD, Tesla, Zeekr)"),
  model: z.string().trim().min(2, "Línea / Modelo requerido (ej. Dolphin, Seal, 001)"),
  year: z.number().int().min(2010).max(2030).default(2024),
  yearStart: z.number().int().min(2010).max(2030).optional(),
  yearEnd: z.number().int().min(2010).max(2030).optional(),
  batteryKwh: z.number().positive("Capacidad de batería en kWh requerida"),
  realRangeKm: z.number().int().positive("Autonomía real requerida"),
  wltpRangeKm: z.number().int().positive().optional(),
  connectorTypes: z.array(ConnectorTypeEnum).min(1, "Selecciona al menos 1 tipo de conector"),
  maxAcKw: z.number().positive("Potencia máxima AC requerida"),
  maxDcKw: z.number().positive("Potencia máxima DC requerida"),
  imageUrl: z.string().url("URL de imagen requerida").optional().or(z.literal("")),
  efficiencyKwh100: z.number().positive().optional(),
  description: z.string().optional(),
});

export type CatalogVehicleInput = z.infer<typeof catalogVehicleSchema>;

// 9. Marketplace Listing Validation
export const marketplaceListingSchema = z.object({
  title: z.string().trim().min(5, "El título debe tener al menos 5 caracteres").max(120),
  description: z.string().trim().min(15, "Por favor incluye una descripción detallada del artículo o vehículo"),
  category: MarketplaceCategoryEnum,
  condition: ItemConditionEnum.default("USED_GOOD"),
  priceCop: z.number().positive("El precio en COP debe ser mayor a 0"),
  isNegotiable: z.boolean().default(true),
  city: z.string().trim().min(2, "Ciudad requerida"),
  department: z.string().trim().min(2, "Departamento requerido"),
  photos: z.array(z.string().url()).min(1, "Debes subir al menos 1 fotografía").default([]),
  contactPhone: z.string().trim().min(10, "Número de contacto o WhatsApp requerido (10 dígitos)"),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),

  // Campos opcionales para vehículos completos
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().min(2010).max(2030).optional(),
  mileageKm: z.number().int().nonnegative().optional(),
  batteryHealthSoh: z.number().min(50).max(100, "SOH % debe ser entre 50 y 100").optional(),
  batteryKwh: z.number().positive().optional(),
  licensePlateMask: z.string().max(10).optional(),
  connectorType: ConnectorTypeEnum.optional(),

  // Campos opcionales para cargadores y repuestos
  chargingPowerKw: z.number().positive().optional(),
  compatibleBrands: z.array(z.string()).default([]),
});

export type MarketplaceListingInput = z.infer<typeof marketplaceListingSchema>;
