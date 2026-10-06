import React from 'react';
import { api } from '@/services/api';
import type { DemandPrediction } from '@/types';
import { DemandChart } from '@/components/intelligence/DemandChart';
import { Activity, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';

export default function DemandPredictionPage() {
  const [prediction, setPrediction] = React.useState<DemandPrediction | null>(null);

  React.useEffect(() => {
    async function load() {
      const data = await api.getPredictions();
      if (data && data.length > 0) setPrediction(data[0]);
    }
    load();
  }, []);

  if (!prediction) return null;

  return (
    <div className="space-y-6 md:space-y-8 bg-transparent">
      <PageHeader 
        title="Demand Prediction" 
        description="AI-driven forecasting for resource requirements across affected regions."
        action={
          <div className="flex gap-4">
            <select className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-md px-3 py-2 text-sm text-[#E2E8F0]">
              <option>All Areas</option>
              <option>Downtown</option>
            </select>
            <select className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-md px-3 py-2 text-sm text-[#E2E8F0]">
              <option>Water</option>
              <option>Food</option>
              <option>Medicine</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Current Demand" 
          value={`${prediction.currentDemand} ${prediction.unit}`} 
          icon={Activity} 
          variant="default" 
        />
        <StatCard 
          title="Predicted Demand" 
          value={`${prediction.predictedDemand} ${prediction.unit}`} 
          icon={TrendingUp} 
          variant="critical" 
          className="border-t-2 border-t-[#F87171]"
        />
        <StatCard 
          title="AI Confidence" 
          value={`${prediction.confidence}%`} 
          icon={ShieldCheck} 
          variant="accent" 
        />
        <StatCard 
          title="Forecast Horizon" 
          value={prediction.horizon} 
          icon={Clock} 
          variant="default" 
        />
      </div>

      <div className="bg-[#1E293B] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Prediction Model: {prediction.resourceType} in {prediction.areaName}</h2>
        <DemandChart data={prediction.timeSeries} />
      </div>
    </div>
  );
}
