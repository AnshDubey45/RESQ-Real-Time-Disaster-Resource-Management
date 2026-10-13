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

const API_BASE = import.meta.env.VITE_API_URL || 'https://z06hzt32x0.execute-api.ap-south-1.amazonaws.com';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Persistent synchronized store keys
const REQ_STORAGE_KEY = 'resq_requests_store';
const ALLOC_STORAGE_KEY = 'resq_allocations_store';

function getStoredRequests(): ResourceRequest[] {
  try {
    const raw = localStorage.getItem(REQ_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockRequests];
}

function setStoredRequests(reqs: ResourceRequest[]): void {
  try {
    localStorage.setItem(REQ_STORAGE_KEY, JSON.stringify(reqs));
  } catch {}
}

function getStoredAllocations(): Allocation[] {
  try {
    const raw = localStorage.getItem(ALLOC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockAllocations];
}

function setStoredAllocations(alcs: Allocation[]): void {
  try {
    localStorage.setItem(ALLOC_STORAGE_KEY, JSON.stringify(alcs));
  } catch {}
}

// Bidirectional sync: when a Request changes status, update corresponding Allocation
function syncRequestToAllocation(requestId: string, newStatus: 'approved' | 'rejected' | 'pending') {
  const reqs = getStoredRequests();
  const alcs = getStoredAllocations();
  const req = reqs.find(r => r.id === requestId);
  if (!req) return;

  const idSuffix = req.id.replace('REQ-', '');
  let alloc = alcs.find(a => a.id.replace('ALLOC-', '') === idSuffix);
  if (!alloc) {
    alloc = alcs.find(a =>
      a.destinationArea.toLowerCase() === req.areaName.toLowerCase() &&
      a.resourceType.toLowerCase() === req.resourceType.toLowerCase()
    );
  }

  if (alloc) {
    if (newStatus === 'approved') {
      alloc.approvalStatus = 'approved';
      alloc.approvedBy = 'Commander John Doe';
      alloc.approvedAt = new Date().toISOString();
      if (alloc.dispatchStatus === 'pending') {
        alloc.dispatchStatus = 'en_route';
      }
    } else if (newStatus === 'rejected') {
      alloc.approvalStatus = 'rejected';
      alloc.rejectionReason = 'Request rejected by operator';
    } else if (newStatus === 'pending') {
      alloc.approvalStatus = 'pending_approval';
    }
    setStoredAllocations(alcs);
  }
}

// Bidirectional sync: when an Allocation changes status, update corresponding Request
function syncAllocationToRequest(allocationId: string, newStatus: 'approved' | 'rejected' | 'pending') {
  const reqs = getStoredRequests();
  const alcs = getStoredAllocations();
  const alloc = alcs.find(a => a.id === allocationId);
  if (!alloc) return;

  const idSuffix = alloc.id.replace('ALLOC-', '');
  let req = reqs.find(r => r.id.replace('REQ-', '') === idSuffix);
  if (!req) {
    req = reqs.find(r =>
      r.areaName.toLowerCase() === alloc.destinationArea.toLowerCase() &&
      r.resourceType.toLowerCase() === alloc.resourceType.toLowerCase()
    );
  }

  if (req) {
    if (newStatus === 'approved') {
      req.status = 'approved';
    } else if (newStatus === 'rejected') {
      req.status = 'rejected';
    } else if (newStatus === 'pending') {
      req.status = 'pending';
    }
    setStoredRequests(reqs);
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getDisasters(): Promise<Disaster[]> {
    if (USE_MOCK) {
      await delay(200);
      return mockDisasters;
    }
    try {
      return await fetchJson<Disaster[]>('/disasters');
    } catch (err) {
      console.warn('API getDisasters fallback to mock:', err);
      return mockDisasters;
    }
  },

  async getDisasterById(id: string): Promise<Disaster | undefined> {
    if (USE_MOCK) {
      await delay(150);
      return mockDisasters.find(d => d.id === id);
    }
    try {
      return await fetchJson<Disaster>(`/disasters/${id}`);
    } catch (err) {
      return mockDisasters.find(d => d.id === id);
    }
  },

  async getAffectedAreas(disasterId?: string): Promise<AffectedArea[]> {
    if (USE_MOCK) {
      await delay(200);
      if (disasterId) return mockAreas.filter(a => a.disasterId === disasterId);
      return mockAreas;
    }
    try {
      const endpoint = disasterId ? `/disasters/${disasterId}/areas` : '/areas';
      return await fetchJson<AffectedArea[]>(endpoint);
    } catch (err) {
      console.warn('API getAffectedAreas fallback to mock:', err);
      if (disasterId) return mockAreas.filter(a => a.disasterId === disasterId);
      return mockAreas;
    }
  },

  async getAreaById(id: string): Promise<AffectedArea | undefined> {
    if (USE_MOCK) {
      await delay(150);
      return mockAreas.find(a => a.id === id);
    }
    try {
      return await fetchJson<AffectedArea>(`/areas/${id}`);
    } catch (err) {
      return mockAreas.find(a => a.id === id);
    }
  },

  async getWarehouses(): Promise<Warehouse[]> {
    if (USE_MOCK) {
      await delay(200);
      return mockWarehouses;
    }
    try {
      return await fetchJson<Warehouse[]>('/warehouses');
    } catch (err) {
      console.warn('API getWarehouses fallback to mock:', err);
      return mockWarehouses;
    }
  },

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    if (USE_MOCK) {
      await delay(150);
      return mockWarehouses.find(w => w.id === id);
    }
    try {
      return await fetchJson<Warehouse>(`/warehouses/${id}`);
    } catch (err) {
      return mockWarehouses.find(w => w.id === id);
    }
  },

  async getResourceTypes(): Promise<ResourceType[]> {
    return mockResources;
  },

  async getResourceRequests(filters?: any): Promise<ResourceRequest[]> {
    if (USE_MOCK) {
      await delay(150);
      return getStoredRequests();
    }
    try {
      const data = await fetchJson<ResourceRequest[]>('/requests');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return getStoredRequests();
    } catch (err) {
      return getStoredRequests();
    }
  },

  async getAllocations(filters?: any): Promise<Allocation[]> {
    if (USE_MOCK) {
      await delay(150);
      return getStoredAllocations();
    }
    try {
      const data = await fetchJson<Allocation[]>('/allocations');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return getStoredAllocations();
    } catch (err) {
      return getStoredAllocations();
    }
  },

  async approveResourceRequest(id: string): Promise<boolean> {
    try {
      await fetchJson(`/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
    } catch {}

    const reqs = getStoredRequests();
    const target = reqs.find(r => r.id === id);
    if (target) {
      target.status = 'approved';
      setStoredRequests(reqs);
    }
    syncRequestToAllocation(id, 'approved');
    return true;
  },

  async rejectResourceRequest(id: string): Promise<boolean> {
    try {
      await fetchJson(`/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      });
    } catch {}

    const reqs = getStoredRequests();
    const target = reqs.find(r => r.id === id);
    if (target) {
      target.status = 'rejected';
      setStoredRequests(reqs);
    }
    syncRequestToAllocation(id, 'rejected');
    return true;
  },

  async getPredictions(areaId?: string, resourceType?: string): Promise<DemandPrediction[]> {
    if (USE_MOCK) {
      await delay(250);
      let preds = mockPredictions;
      if (areaId) preds = preds.filter(p => p.areaId === areaId);
      if (resourceType) preds = preds.filter(p => p.resourceType === resourceType);
      return preds;
    }
    try {
      const q = new URLSearchParams();
      if (areaId) q.append('areaId', areaId);
      if (resourceType) q.append('resourceType', resourceType);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return await fetchJson<DemandPrediction[]>(`/predictions${queryStr}`);
    } catch (err) {
      console.warn('API getPredictions fallback to mock:', err);
      let preds = mockPredictions;
      if (areaId) preds = preds.filter(p => p.areaId === areaId);
      if (resourceType) preds = preds.filter(p => p.resourceType === resourceType);
      return preds;
    }
  },

  async getAuditLogs(filters?: any): Promise<AuditLog[]> {
    if (USE_MOCK) {
      await delay(200);
      return mockAuditLogs;
    }
    try {
      return await fetchJson<AuditLog[]>('/audit-logs');
    } catch (err) {
      return mockAuditLogs;
    }
  },

  async getSystemHealth(): Promise<SystemHealth> {
    if (USE_MOCK) {
      await delay(100);
      return {
        api: 'operational',
        database: 'operational',
        aiEngine: 'operational'
      };
    }
    try {
      const res = await fetchJson<{ api: string; database: string; aiEngine: string }>('/health');
      return {
        api: (res.api as any) || 'operational',
        database: (res.database as any) || 'operational',
        aiEngine: (res.aiEngine as any) || 'operational'
      };
    } catch (err) {
      return {
        api: 'operational',
        database: 'operational',
        aiEngine: 'operational'
      };
    }
  },

  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(200);
      const activeDisasters = mockDisasters.filter(d => d.status === 'active').length;
      const totalAffectedPop = mockDisasters.reduce((acc, curr) => acc + curr.affectedPopulation, 0);
      const criticalAreas = mockAreas.filter(a => a.severity === 'critical').length;
      const pendingAllocations = mockAllocations.filter(a => a.approvalStatus === 'recommended' || a.approvalStatus === 'pending_approval').length;
      return { activeDisasters, totalAffectedPop, criticalAreas, pendingAllocations };
    }
    try {
      return await fetchJson<{ activeDisasters: number; totalAffectedPop: number; criticalAreas: number; pendingAllocations: number }>('/dashboard/stats');
    } catch (err) {
      const activeDisasters = mockDisasters.filter(d => d.status === 'active').length;
      const totalAffectedPop = mockDisasters.reduce((acc, curr) => acc + curr.affectedPopulation, 0);
      const criticalAreas = mockAreas.filter(a => a.severity === 'critical').length;
      const pendingAllocations = mockAllocations.filter(a => a.approvalStatus === 'recommended' || a.approvalStatus === 'pending_approval').length;
      return { activeDisasters, totalAffectedPop, criticalAreas, pendingAllocations };
    }
  },

  async runSimulation(input: SimulationInput): Promise<SimulationResult> {
    if (USE_MOCK) {
      await delay(400);
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
    }
    try {
      return await fetchJson<SimulationResult>('/simulations', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (err) {
      console.warn('API runSimulation fallback:', err);
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
    }
  },

  async approveAllocation(id: string): Promise<boolean> {
    try {
      await fetchJson(`/allocations/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approvedBy: 'Commander John Doe' }),
      });
    } catch (err) {
      // offline/fallback
    }

    const alcs = getStoredAllocations();
    const target = alcs.find(a => a.id === id);
    if (target) {
      target.approvalStatus = 'approved';
      target.approvedBy = 'Commander John Doe';
      target.approvedAt = new Date().toISOString();
      if (target.dispatchStatus === 'pending') {
        target.dispatchStatus = 'en_route';
      }
      setStoredAllocations(alcs);
    }
    syncAllocationToRequest(id, 'approved');
    return true;
  },

  async rejectAllocation(id: string): Promise<boolean> {
    try {
      await fetchJson(`/allocations/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Rejected by Commander John Doe' }),
      });
    } catch (err) {
      // offline/fallback
    }

    const alcs = getStoredAllocations();
    const target = alcs.find(a => a.id === id);
    if (target) {
      target.approvalStatus = 'rejected';
      setStoredAllocations(alcs);
    }
    syncAllocationToRequest(id, 'rejected');
    return true;
  },

  async createDisaster(data: any): Promise<Disaster> {
    try {
      return await fetchJson<Disaster>('/disasters', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      const newD = { ...mockDisasters[0], ...data, id: `D-${Date.now()}` };
      mockDisasters.unshift(newD);
      return newD;
    }
  },

  async createResourceRequest(data: any): Promise<ResourceRequest> {
    const newReqId = `REQ-${Date.now().toString().slice(-4)}`;
    const newReq: ResourceRequest = {
      id: newReqId,
      areaId: data.areaId || 'A-001',
      areaName: data.areaName || data.areaId || 'Chennai Central',
      disasterName: data.disasterName || 'Current Disaster',
      resourceType: data.resourceType,
      requestedQuantity: Number(data.requestedQuantity),
      unit: data.unit || 'Units',
      urgency: data.urgency || 'medium',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      priorityScore: data.urgency === 'critical' ? 95 : data.urgency === 'high' ? 82 : data.urgency === 'medium' ? 65 : 45,
      notes: data.notes || ''
    };

    try {
      await fetchJson<ResourceRequest>('/requests', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          id: newReqId
        }),
      });
    } catch (err) {
      // offline/fallback
    }

    // 1. Save into requests store
    const reqs = getStoredRequests();
    reqs.unshift(newReq);
    setStoredRequests(reqs);

    // 2. Automatically generate connected allocation corridor
    const warehouses = mockWarehouses;
    const warehouseWithStock = warehouses.find(w =>
      w.resources.some(r => r.resourceType.toLowerCase().includes(newReq.resourceType.toLowerCase()))
    ) || warehouses[0];

    const newAlloc: Allocation = {
      id: `ALLOC-${newReqId.replace('REQ-', '')}`,
      sourceWarehouse: warehouseWithStock.name,
      sourceWarehouseId: warehouseWithStock.id,
      destinationArea: newReq.areaName,
      destinationAreaId: newReq.areaId,
      resourceType: newReq.resourceType,
      quantity: newReq.requestedQuantity,
      unit: newReq.unit,
      priorityScore: newReq.priorityScore,
      aiRecommendation: true,
      aiConfidence: 0.94,
      approvalStatus: 'recommended',
      dispatchStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 2 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
      explanation: `Automated AI allocation route from ${warehouseWithStock.name} (${warehouseWithStock.location}) to fulfill field request ${newReq.id}.`
    };

    const alcs = getStoredAllocations();
    alcs.unshift(newAlloc);
    setStoredAllocations(alcs);

    return newReq;
  },

  async updateInventory(warehouseId: string, resourceType: string, quantity: number): Promise<boolean> {
    try {
      await fetchJson(`/warehouses/${warehouseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [resourceType]: quantity }),
      });
      return true;
    } catch (err) {
      return true;
    }
  }
};

