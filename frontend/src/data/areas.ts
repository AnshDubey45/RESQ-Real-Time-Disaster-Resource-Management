import type { AffectedArea } from '../types';

export const mockAreas: AffectedArea[] = [
  {
    id: 'A-001',
    name: 'Chennai Central',
    disasterId: 'D-2026-001',
    disasterName: 'Chennai Basin Floods',
    population: 85000,
    severity: 'critical',
    severityScore: 95,
    medicalUrgency: 88,
    accessibility: 20,
    predictedDemand: {
      'Water': 170000,
      'Food Packets': 255000,
      'Medicine': 15000
    },
    currentResources: {
      'Water': 40000,
      'Food Packets': 60000,
      'Medicine': 5000
    },
    shortage: {
      'Water': 130000,
      'Food Packets': 195000,
      'Medicine': 10000
    },
    priorityScore: 89.2,
    priorityFactors: { severity: 95, populationImpact: 90, medicalUrgency: 88, resourceShortage: 85, accessibility: 80 },
    status: 'critical',
    coordinates: [13.0827, 80.2707],
    warnings: ['Main routes submerged', 'Power grid failure']
  },
  {
    id: 'A-002',
    name: 'Chengalpattu',
    disasterId: 'D-2026-001',
    disasterName: 'Chennai Basin Floods',
    population: 45000,
    severity: 'high',
    severityScore: 82,
    medicalUrgency: 70,
    accessibility: 40,
    predictedDemand: {
      'Water': 90000,
      'Food Packets': 135000
    },
    currentResources: {
      'Water': 30000,
      'Food Packets': 40000
    },
    shortage: {
      'Water': 60000,
      'Food Packets': 95000
    },
    priorityScore: 76.5,
    priorityFactors: { severity: 82, populationImpact: 60, medicalUrgency: 70, resourceShortage: 75, accessibility: 60 },
    status: 'high',
    coordinates: [12.6939, 79.9757],
    warnings: ['Partial flooding', 'Communication patchy']
  },
  {
    id: 'A-003',
    name: 'Kanchipuram',
    disasterId: 'D-2026-001',
    disasterName: 'Chennai Basin Floods',
    population: 30000,
    severity: 'high',
    severityScore: 75,
    medicalUrgency: 60,
    accessibility: 50,
    predictedDemand: {
      'Water': 60000,
      'Shelter Kits': 5000
    },
    currentResources: {
      'Water': 20000,
      'Shelter Kits': 1000
    },
    shortage: {
      'Water': 40000,
      'Shelter Kits': 4000
    },
    priorityScore: 68.0,
    priorityFactors: { severity: 75, populationImpact: 50, medicalUrgency: 60, resourceShortage: 70, accessibility: 50 },
    status: 'high',
    coordinates: [12.8342, 79.7036],
    warnings: ['Water logging in low lying areas']
  },
  {
    id: 'A-004',
    name: 'Cuddalore Coastal',
    disasterId: 'D-2026-002',
    disasterName: 'Cyclone Michaung Impact',
    population: 50000,
    severity: 'critical',
    severityScore: 88,
    medicalUrgency: 75,
    accessibility: 30,
    predictedDemand: {
      'Water': 100000,
      'Shelter Kits': 15000
    },
    currentResources: {
      'Water': 20000,
      'Shelter Kits': 3000
    },
    shortage: {
      'Water': 80000,
      'Shelter Kits': 12000
    },
    priorityScore: 81.4,
    priorityFactors: { severity: 88, populationImpact: 65, medicalUrgency: 75, resourceShortage: 80, accessibility: 70 },
    status: 'critical',
    coordinates: [11.7480, 79.7714],
    warnings: ['High wind warnings', 'Coastal erosion']
  },
  {
    id: 'A-005',
    name: 'Villupuram',
    disasterId: 'D-2026-002',
    disasterName: 'Cyclone Michaung Impact',
    population: 35000,
    severity: 'medium',
    severityScore: 60,
    medicalUrgency: 40,
    accessibility: 60,
    predictedDemand: {
      'Water': 70000,
      'Food Packets': 70000
    },
    currentResources: {
      'Water': 40000,
      'Food Packets': 50000
    },
    shortage: {
      'Water': 30000,
      'Food Packets': 20000
    },
    priorityScore: 55.0,
    priorityFactors: { severity: 60, populationImpact: 50, medicalUrgency: 40, resourceShortage: 40, accessibility: 40 },
    status: 'medium',
    coordinates: [11.9401, 79.4861],
    warnings: ['Fallen trees blocking some roads']
  },
  {
    id: 'A-006',
    name: 'Tiruvannamalai Rural',
    disasterId: 'D-2026-001',
    disasterName: 'Chennai Basin Floods',
    population: 20000,
    severity: 'medium',
    severityScore: 55,
    medicalUrgency: 35,
    accessibility: 70,
    predictedDemand: {
      'Food Packets': 40000
    },
    currentResources: {
      'Food Packets': 20000
    },
    shortage: {
      'Food Packets': 20000
    },
    priorityScore: 48.0,
    priorityFactors: { severity: 55, populationImpact: 35, medicalUrgency: 35, resourceShortage: 30, accessibility: 30 },
    status: 'medium',
    coordinates: [12.2253, 79.0747],
    warnings: []
  },
  {
    id: 'A-007',
    name: 'Vellore City',
    disasterId: 'D-2026-003',
    disasterName: 'Vellore Seismic Activity',
    population: 15000,
    severity: 'low',
    severityScore: 30,
    medicalUrgency: 10,
    accessibility: 90,
    predictedDemand: {
      'Shelter Kits': 1000
    },
    currentResources: {
      'Shelter Kits': 800
    },
    shortage: {
      'Shelter Kits': 200
    },
    priorityScore: 25.0,
    priorityFactors: { severity: 30, populationImpact: 20, medicalUrgency: 10, resourceShortage: 10, accessibility: 10 },
    status: 'low',
    coordinates: [12.9165, 79.1325],
    warnings: ['Minor structural cracks reported']
  },
  {
    id: 'A-008',
    name: 'Ranipet',
    disasterId: 'D-2026-003',
    disasterName: 'Vellore Seismic Activity',
    population: 5000,
    severity: 'low',
    severityScore: 20,
    medicalUrgency: 5,
    accessibility: 95,
    predictedDemand: {
      'Water': 10000
    },
    currentResources: {
      'Water': 9500
    },
    shortage: {
      'Water': 500
    },
    priorityScore: 18.0,
    priorityFactors: { severity: 20, populationImpact: 10, medicalUrgency: 5, resourceShortage: 5, accessibility: 5 },
    status: 'low',
    coordinates: [12.9272, 79.3242],
    warnings: []
  }
];
