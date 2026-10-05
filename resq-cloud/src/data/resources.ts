import type { ResourceType } from '../types';

export const mockResources: ResourceType[] = [
  { id: 'R-001', name: 'Water', unit: 'Liters', category: 'Consumables', criticalThreshold: 20000, warningThreshold: 50000 },
  { id: 'R-002', name: 'Food Packets', unit: 'Units', category: 'Consumables', criticalThreshold: 10000, warningThreshold: 30000 },
  { id: 'R-003', name: 'Medicine', unit: 'Kits', category: 'Medical', criticalThreshold: 1000, warningThreshold: 3000 },
  { id: 'R-004', name: 'Shelter Kits', unit: 'Units', category: 'Infrastructure', criticalThreshold: 500, warningThreshold: 2000 },
  { id: 'R-005', name: 'Rescue Equipment', unit: 'Sets', category: 'Tools', criticalThreshold: 50, warningThreshold: 150 }
];
