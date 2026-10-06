import type { DemandPrediction } from '../types';

const generateTimeSeries = (startValue: number, days: number, trend: 'up' | 'down' | 'stable') => {
  const series = [];
  let currentVal = startValue;
  for (let i = 0; i < days; i++) {
    const variance = currentVal * 0.1 * (Math.random() - 0.5);
    const dayTrend = trend === 'up' ? currentVal * 0.05 : trend === 'down' ? -currentVal * 0.05 : 0;
    currentVal = currentVal + variance + dayTrend;
    
    series.push({
      timestamp: new Date(Date.now() + i * 24 * 3600000).toISOString(),
      predicted: Math.round(currentVal),
      lowerBound: Math.round(currentVal * 0.85),
      upperBound: Math.round(currentVal * 1.15),
      actual: i < 2 ? Math.round(currentVal * (1 + 0.05 * (Math.random() - 0.5))) : undefined
    });
  }
  return series;
};

export const mockPredictions: DemandPrediction[] = [
  {
    resourceType: 'Water',
    areaId: 'A-001',
    areaName: 'Chennai Central',
    currentDemand: 170000,
    predictedDemand: 195000,
    unit: 'Liters',
    confidence: 0.88,
    horizon: '7 Days',
    timeSeries: generateTimeSeries(170000, 7, 'up')
  },
  {
    resourceType: 'Food Packets',
    areaId: 'A-001',
    areaName: 'Chennai Central',
    currentDemand: 255000,
    predictedDemand: 220000,
    unit: 'Units',
    confidence: 0.92,
    horizon: '7 Days',
    timeSeries: generateTimeSeries(255000, 7, 'down')
  },
  {
    resourceType: 'Water',
    areaId: 'A-004',
    areaName: 'Cuddalore Coastal',
    currentDemand: 100000,
    predictedDemand: 105000,
    unit: 'Liters',
    confidence: 0.85,
    horizon: '7 Days',
    timeSeries: generateTimeSeries(100000, 7, 'stable')
  }
];
