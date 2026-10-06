export type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'drought' | 'landslide';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type DisasterStatus = 'active' | 'monitoring' | 'resolved' | 'archived';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'dispatched' | 'delivered';
export type AllocationStatus = 'recommended' | 'pending_approval' | 'approved' | 'dispatched' | 'in_transit' | 'delivered' | 'completed' | 'rejected';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type StockStatus = 'healthy' | 'warning' | 'critical';
export type RouteStatus = 'clear' | 'delayed' | 'blocked';
export type SystemStatus = 'operational' | 'degraded' | 'offline';

export interface Disaster {
  id: string;
  name: string;
  type: DisasterType;
  location: string;
  state: string;
  severity: SeverityLevel;
  severityScore: number;
  affectedPopulation: number;
  status: DisasterStatus;
  startDate: string;
  lastUpdate: string;
  description: string;
  coordinates: [number, number];
}

export interface AffectedArea {
  id: string;
  name: string;
  disasterId: string;
  disasterName: string;
  population: number;
  severity: SeverityLevel;
  severityScore: number;
  medicalUrgency: number; // 0-100
  accessibility: number; // 0-100
  predictedDemand: Record<string, number>;
  currentResources: Record<string, number>;
  shortage: Record<string, number>;
  priorityScore: number;
  priorityFactors: {
    severity: number;
    populationImpact: number;
    medicalUrgency: number;
    resourceShortage: number;
    accessibility: number;
  };
  status: SeverityLevel;
  coordinates: [number, number];
  warnings: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  capacity: number;
  usedCapacity: number;
  operationalStatus: SystemStatus;
  routeStatus: RouteStatus;
  resources: WarehouseResource[];
}

export interface WarehouseResource {
  resourceType: string;
  available: number;
  reserved: number;
  unit: string;
  stockStatus: StockStatus;
}

export interface ResourceType {
  id: string;
  name: string;
  unit: string;
  category: string;
  criticalThreshold: number;
  warningThreshold: number;
}

export interface ResourceRequest {
  id: string;
  areaId: string;
  areaName: string;
  disasterName: string;
  resourceType: string;
  requestedQuantity: number;
  unit: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  requestedAt: string;
  priorityScore: number;
  notes: string;
}

export interface Allocation {
  id: string;
  sourceWarehouse: string;
  sourceWarehouseId: string;
  destinationArea: string;
  destinationAreaId: string;
  resourceType: string;
  quantity: number;
  unit: string;
  priorityScore: number;
  aiRecommendation: boolean;
  aiConfidence: number;
  approvalStatus: AllocationStatus;
  dispatchStatus: string;
  estimatedDelivery: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  explanation: string;
}

export interface PredictionDataPoint {
  timestamp: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface DemandPrediction {
  resourceType: string;
  areaId: string;
  areaName: string;
  currentDemand: number;
  predictedDemand: number;
  unit: string;
  confidence: number;
  horizon: string;
  timeSeries: PredictionDataPoint[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  objectType: string;
  objectId: string;
  result: 'success' | 'warning' | 'error' | 'info';
  details: string;
}

export interface SimulationInput {
  disasterType: DisasterType;
  population: number;
  severity: number;
  duration: number;
  medicalUrgency: number;
  accessibility: number;
  inventoryModifier: number;
}

export interface SimulationResult {
  waterDemand: { current: number; simulated: number };
  foodDemand: { current: number; simulated: number };
  medicineDemand: { current: number; simulated: number };
  shelterDemand: { current: number; simulated: number };
  shortages: Record<string, number>;
  additionalRequired: Record<string, number>;
  priorityRanking: { area: string; score: number }[];
}

export interface SystemHealth {
  api: SystemStatus;
  database: SystemStatus;
  aiEngine: SystemStatus;
}
