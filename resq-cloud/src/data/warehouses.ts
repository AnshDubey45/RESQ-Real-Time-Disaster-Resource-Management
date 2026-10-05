import type { Warehouse } from '../types';

export const mockWarehouses: Warehouse[] = [
  {
    id: 'W-001',
    name: 'Chennai Central Depot',
    location: 'Chennai',
    coordinates: [13.0674, 80.2376],
    capacity: 500000,
    usedCapacity: 420000,
    operationalStatus: 'operational',
    routeStatus: 'delayed',
    resources: [
      { resourceType: 'Water', available: 150000, reserved: 50000, unit: 'Liters', stockStatus: 'healthy' },
      { resourceType: 'Food Packets', available: 100000, reserved: 30000, unit: 'Units', stockStatus: 'healthy' },
      { resourceType: 'Medicine', available: 8000, reserved: 2000, unit: 'Kits', stockStatus: 'warning' }
    ]
  },
  {
    id: 'W-002',
    name: 'Kanchipuram Logistics Hub',
    location: 'Kanchipuram',
    coordinates: [12.8385, 79.7025],
    capacity: 300000,
    usedCapacity: 150000,
    operationalStatus: 'operational',
    routeStatus: 'clear',
    resources: [
      { resourceType: 'Water', available: 80000, reserved: 10000, unit: 'Liters', stockStatus: 'healthy' },
      { resourceType: 'Food Packets', available: 60000, reserved: 5000, unit: 'Units', stockStatus: 'healthy' },
      { resourceType: 'Shelter Kits', available: 5000, reserved: 500, unit: 'Units', stockStatus: 'warning' },
      { resourceType: 'Rescue Equipment', available: 200, reserved: 50, unit: 'Sets', stockStatus: 'healthy' }
    ]
  },
  {
    id: 'W-003',
    name: 'Villupuram Reserve',
    location: 'Villupuram',
    coordinates: [11.9401, 79.4861],
    capacity: 250000,
    usedCapacity: 220000,
    operationalStatus: 'degraded',
    routeStatus: 'blocked',
    resources: [
      { resourceType: 'Water', available: 20000, reserved: 15000, unit: 'Liters', stockStatus: 'critical' },
      { resourceType: 'Food Packets', available: 30000, reserved: 10000, unit: 'Units', stockStatus: 'warning' },
      { resourceType: 'Shelter Kits', available: 10000, reserved: 8000, unit: 'Units', stockStatus: 'warning' }
    ]
  },
  {
    id: 'W-004',
    name: 'Vellore Northern Supply',
    location: 'Vellore',
    coordinates: [12.9165, 79.1325],
    capacity: 200000,
    usedCapacity: 100000,
    operationalStatus: 'operational',
    routeStatus: 'clear',
    resources: [
      { resourceType: 'Water', available: 50000, reserved: 0, unit: 'Liters', stockStatus: 'healthy' },
      { resourceType: 'Food Packets', available: 40000, reserved: 0, unit: 'Units', stockStatus: 'healthy' },
      { resourceType: 'Medicine', available: 5000, reserved: 0, unit: 'Kits', stockStatus: 'healthy' },
      { resourceType: 'Rescue Equipment', available: 150, reserved: 0, unit: 'Sets', stockStatus: 'healthy' }
    ]
  }
];
