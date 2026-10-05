import React from 'react';
import { SimulationPanel } from '@/components/intelligence/SimulationPanel';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function WhatIfSimulator() {
  return (
    <div className="space-y-6 md:space-y-8 bg-transparent">
      {/* Banner */}
      <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-xl p-4 flex items-center gap-3 text-[#FBBF24]">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold text-sm tracking-wide">SIMULATION MODE — LIVE DATA NOT MODIFIED</span>
      </div>

      <PageHeader 
        title="What-If Simulator"
        description="Model disaster scenarios and predict resource strain"
      />

      <SimulationPanel />
    </div>
  );
}
