export type Role = "USER" | "MODERATOR" | "ADMIN";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ConnectorType =
  | "TYPE_1_J1772"
  | "TYPE_2_MENNEKES"
  | "CCS1"
  | "CCS2"
  | "GB_T_AC"
  | "GB_T_DC"
  | "CHADEMO"
  | "TESLA_NACS";

export type StationStatus = "OPERATIONAL" | "LIMITED" | "OUT_OF_SERVICE" | "MAINTENANCE";
export type StationAccess = "PUBLIC" | "HOTEL_GUEST_ONLY" | "SHOPPING_CUSTOMER" | "PAID_PARKING" | "RESTRICTED";

export type ManualCategory =
  | "USER_MANUAL"
  | "WORKSHOP_REPAIR"
  | "WIRING_HIGH_VOLTAGE"
  | "CHARGING_INFRASTRUCTURE"
  | "SAFETY_FIRST_RESPONDER"
  | "BATTERY_DIAGNOSTICS";

export type MarketplaceCategory =
  | "VEHICLE_COMPLETE"
  | "CHARGER_WALLBOX"
  | "ADAPTER_CONNECTOR"
  | "BATTERY_CELLS_BMS"
  | "HV_PARTS_INVERTER"
  | "ACCESSORIES_TIRES";

export type ItemCondition = "NEW" | "LIKE_NEW" | "USED_GOOD" | "FOR_PARTS";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: Role;
  createdAt: string;
  vehicles?: UserVehicleItem[];
}

export interface UserVehicleItem {
  id: string;
  userId: string;
  vehicleId: string;
  modelYear?: number;
  nickname?: string;
  licensePlate?: string;
  batteryHealth?: number; // e.g. 98.5%
  isPrimary: boolean;
  vehicle: VehicleItem;
}

export interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  yearStart?: number;
  yearEnd?: number;
  batteryKwh: number;
  realRangeKm: number;
  wltpRangeKm?: number;
  connectorTypes: ConnectorType[];
  maxAcKw: number;
  maxDcKw: number;
  imageUrl?: string;
  efficiencyKwh100?: number;
  description?: string;
}

export interface ConnectorSpec {
  type: ConnectorType;
  powerKw: number;
  count: number;
  pricePerKwh?: number;
  isAvailable?: boolean;
}

export interface ChargingStationItem {
  id: string;
  name: string;
  operator: string;
  address: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  status: StationStatus;
  access: StationAccess;
  connectors: ConnectorSpec[];
  photos: string[];
  amenities: string[];
  priceInfo?: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  moderation: ModerationStatus;
  submittedById?: string;
  submittedByName?: string;
  createdAt: string;
  updatedAt?: string;
  reviews?: ChargingReviewItem[];
}

export interface ChargingReviewItem {
  id: string;
  stationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  connectorUsed?: ConnectorType;
  powerDeliveredKw?: number;
  costTotalCop?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface RouteWaypoint {
  name: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  isChargingStop?: boolean;
  chargingStationId?: string;
  recommendedChargeMins?: number;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
  locationName?: string;
  batterySocPercent?: number;
}

export interface ChargingTelemetryStop {
  stationName: string;
  startSoc: number;
  endSoc: number;
  kwhCharged: number;
  powerKw?: number;
  costCop?: number;
  durationMinutes?: number;
  connectorType?: ConnectorType;
}

export interface RouteItem {
  id: string;
  title: string;
  description: string;
  originCity: string;
  destinationCity: string;
  originAddress?: string;
  destinationAddress?: string;
  originCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
  elevationGainM?: number;
  startSoc?: number;
  endSoc?: number;
  drivingMode?: "ECO" | "NORMAL" | "SPORT" | string;
  climateActive?: boolean;
  passengersCount?: number;
  avgSpeedKmh?: number;
  actualKwhUsed?: number;
  realEfficiency?: number;
  chargingTelemetry?: ChargingTelemetryStop[];
  waypoints?: RouteWaypoint[];
  elevationProfile?: ElevationPoint[];
  chargingStops: ChargingStationItem[];
  vehicleUsedId?: string;
  vehicleUsedName?: string;
  vehicleUsedBrand?: string;
  vehicleUsedModel?: string;
  vehicleUsedBatteryKwh?: number;
  vehicleUsed?: {
    id: string;
    brand: string;
    model: string;
    batteryKwh: number;
    realRangeKm: number;
    imageUrl?: string;
  };
  avgConsumption?: number;
  difficulty: "EASY" | "MODERATE" | "CHALLENGING";
  roadStatus?: string;
  photos: string[];
  moderation: ModerationStatus;
  createdById: string;
  createdByName?: string;
  createdByAvatar?: string;
  createdBy?: {
    name: string | null;
    image: string | null;
  };
  createdAt: string;
  comments?: RouteCommentItem[];
}

export interface RouteCommentItem {
  id: string;
  routeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  actualKwhUsed?: number;
  travelDate?: string;
  createdAt: string;
}

export interface WorkshopItem {
  id: string;
  name: string;
  address: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  specialties: string[];
  certifications: string[];
  supportedBrands: string[];
  photos: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  moderation: ModerationStatus;
  submittedById?: string;
  createdAt: string;
  reviews?: WorkshopReviewItem[];
}

export interface WorkshopReviewItem {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  serviceDone: string;
  comment: string;
  costScore?: number; // 1 to 3
  verifiedVisit: boolean;
  createdAt: string;
}

export interface ManualItem {
  id: string;
  title: string;
  description: string;
  category: ManualCategory;
  fileUrl: string;
  fileSizeBytes: number;
  fileFormat: string;
  brand?: string;
  model?: string;
  year?: number;
  downloadCount: number;
  moderation: ModerationStatus;
  uploadedById?: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface MarketplaceListingItem {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  condition: ItemCondition;
  priceCop: number;
  isNegotiable: boolean;
  city: string;
  department: string;
  photos: string[];
  contactPhone: string;
  contactEmail?: string;
  
  // Specific vehicle fields
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  mileageKm?: number;
  batteryHealthSoh?: number;
  batteryKwh?: number;
  licensePlateMask?: string;
  connectorType?: ConnectorType;
  
  // Specific charger/part fields
  chargingPowerKw?: number;
  compatibleBrands?: string[];
  
  // Status & Moderation
  isSold: boolean;
  featured: boolean;
  viewsCount: number;
  moderation: ModerationStatus;
  rejectionReason?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export interface ModerationQueueItem {
  id: string;
  entityType: "STATION" | "ROUTE" | "WORKSHOP" | "MANUAL" | "MARKETPLACE" | "REVIEW";
  entityId: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: ModerationStatus;
  details: Record<string, unknown>;
}
