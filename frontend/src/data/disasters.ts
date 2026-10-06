import type { Disaster } from '../types';

export const mockDisasters: Disaster[] = [
  {
    id: 'D-2026-001',
    name: 'Chennai Basin Floods',
    type: 'flood',
    location: 'Chennai Region',
    state: 'Tamil Nadu',
    severity: 'critical',
    severityScore: 92,
    affectedPopulation: 250000,
    status: 'active',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    description: 'Severe flooding across the Chennai basin affecting multiple districts following unprecedented rainfall.',
    coordinates: [13.0827, 80.2707]
  },
  {
    id: 'D-2026-002',
    name: 'Cyclone Michaung Impact',
    type: 'cyclone',
    location: 'Coastal Districts',
    state: 'Tamil Nadu',
    severity: 'high',
    severityScore: 78,
    affectedPopulation: 120000,
    status: 'active',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    description: 'Post-cyclone damages, power outages, and infrastructural damage in coastal areas.',
    coordinates: [11.7480, 79.7714] // Cuddalore area
  },
  {
    id: 'D-2026-003',
    name: 'Vellore Seismic Activity',
    type: 'earthquake',
    location: 'Vellore District',
    state: 'Tamil Nadu',
    severity: 'medium',
    severityScore: 45,
    affectedPopulation: 15000,
    status: 'monitoring',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: 'Low intensity tremors detected, structural safety checks ongoing.',
    coordinates: [12.9165, 79.1325]
  }
];
