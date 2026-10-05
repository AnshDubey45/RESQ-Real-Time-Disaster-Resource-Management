import { mockDisasters } from '../data/disasters';
import { mockAreas } from '../data/areas';
import { mockWarehouses } from '../data/warehouses';
import { mockResources } from '../data/resources';
import { mockRequests } from '../data/requests';
import { mockAllocations } from '../data/allocations';
import { mockPredictions } from '../data/predictions';
import { mockAuditLogs } from '../data/auditLogs';
import type { 
  Disaster, AffectedArea, Warehouse, ResourceType, 
  ResourceRequest, Allocation, DemandPrediction, 
  AuditLog, SystemHealth, SimulationInput, SimulationResult 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getDisasters(): Promise<Disaster[]> {
    await delay(300);
    return mockDisasters;
  },

  async getDisasterById(id: string): Promise<Disaster | undefined> {
    await delay(200);
    return mockDisasters.find(d => d.id === id);
  },

  async getAffectedAreas(disasterId?: string): Promise<AffectedArea[]> {
    await delay(350);
    if (disasterId) {
      return mockAreas.filter(a => a.disasterId === disasterId);
    }
    return mockAreas;
  },

  async getAreaById(id: string): Promise<AffectedArea | undefined> {
    await delay(200);
    return mockAreas.find(a => a.id === id);
  },

  async getWarehouses(): Promise<Warehouse[]> {
    await delay(250);
    return mockWarehouses;
  },

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    await delay(200);
    return mockWarehouses.find(w => w.id === id);
  },

  async getResourceTypes(): Promise<ResourceType[]> {
    await delay(200);
    return mockResources;
  },

  async getResourceRequests(filters?: any): Promise<ResourceRequest[]> {
    await delay(400);
    return mockRequests;
  },

  async getAllocations(filters?: any): Promise<Allocation[]> {
    await delay(450);
    return mockAllocations;
  },

  async getPredictions(areaId?: string, resourceType?: string): Promise<DemandPrediction[]> {
    await delay(500);
    let preds = mockPredictions;
    if (areaId) preds = preds.filter(p => p.areaId === areaId);
    if (resourceType) preds = preds.filter(p => p.resourceType === resourceType);
    return preds;
  },

  async getAuditLogs(filters?: any): Promise<AuditLog[]> {
    await delay(300);
    return mockAuditLogs;
  },

  async getSystemHealth(): Promise<SystemHealth> {
    await delay(150);
    return {
      api: 'operational',
      database: 'operational',
      aiEngine: 'operational'
    };
  },

  async getDashboardStats() {
    await delay(400);
    const activeDisasters = mockDisasters.filter(d => d.status === 'active').length;
    const totalAffectedPop = mockDisasters.reduce((acc, curr) => acc + curr.affectedPopulation, 0);
    const criticalAreas = mockAreas.filter(a => a.severity === 'critical').length;
    const pendingAllocations = mockAllocations.filter(a => a.approvalStatus === 'recommended' || a.approvalStatus === 'pending_approval').length;
    
    return {
      activeDisasters,
      totalAffectedPop,
      criticalAreas,
      pendingAllocations
    };
  },

  async runSimulation(input: SimulationInput): Promise<SimulationResult> {
    await delay(800);
    const baseDemand = input.population * (input.severity / 100);
    
    return {
      waterDemand: { current: baseDemand * 2, simulated: baseDemand * 2.5 * (1 + input.duration/10) },
      foodDemand: { current: baseDemand * 1.5, simulated: baseDemand * 1.8 * (1 + input.duration/10) },
      medicineDemand: { current: baseDemand * 0.1, simulated: baseDemand * 0.15 * (1 + input.medicalUrgency/100) },
      shelterDemand: { current: baseDemand * 0.05, simulated: baseDemand * 0.08 * (1 + input.severity/100) },
      shortages: { 'Water': 25000, 'Food Packets': 15000 },
      additionalRequired: { 'Water': 10000, 'Medicine': 500 },
      priorityRanking: [
        { area: 'Simulated Area A', score: 92 },
        { area: 'Simulated Area B', score: 85 }
      ]
    };
  },

  async approveAllocation(id: string): Promise<boolean> {
    await delay(300);
    return true;
  },

  async rejectAllocation(id: string): Promise<boolean> {
    await delay(300);
    return true;
  },

  async createDisaster(data: any): Promise<Disaster> {
    await delay(500);
    return { ...mockDisasters[0], ...data, id: `D-${Date.now()}` };
  },

  async createResourceRequest(data: any): Promise<ResourceRequest> {
    await delay(400);
    const newReq = { ...mockRequests[0], ...data, id: `REQ-${Date.now()}`, status: 'pending' };
    mockRequests.unshift(newReq);
    return newReq;
  },

  async updateInventory(warehouseId: string, resourceType: string, quantity: number): Promise<boolean> {
    await delay(300);
    return true;
  }
};
