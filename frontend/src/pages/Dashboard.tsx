import React, { useState, useEffect } from 'react';
import { StatsBento } from '@/components/dashboard/StatsBento';
import { DisasterMap } from '@/components/dashboard/DisasterMap';
import { ResourceStatus } from '@/components/dashboard/ResourceStatus';
import { IncidentCard } from '@/components/dashboard/IncidentCard';
import { AllocationRecommendations } from '@/components/dashboard/AllocationRecommendations';
import { DemandTrend } from '@/components/dashboard/DemandTrend';
import { AIPipeline } from '@/components/dashboard/AIPipeline';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Simulating an interval update
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-transparent text-[#E2E8F0] font-sans flex flex-col space-y-6 md:space-y-8 w-full">
      {/* ROW 1: Header */}
      <PageHeader 
        title="Command Center" 
        description="Real-time disaster response intelligence platform" 
        action={
          <div className="flex items-center gap-2 text-sm text-[#94A3B8] bg-[#1E293B] px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.12)]">
            <RefreshCw className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        }
      />

      {/* ROW 2: KPI Cards */}
      <StatsBento />

      {/* ROW 3: Map & Resource Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] gap-6 lg:gap-8 w-full">
        <div className="min-w-0">
          <DisasterMap />
        </div>
        <div className="min-w-0 flex flex-col">
          <ResourceStatus />
        </div>
      </div>

      {/* ROW 4: Critical Incident + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
        <div className="min-w-0 flex flex-col">
          <IncidentCard />
        </div>
        <div className="min-w-0 flex flex-col">
          <AllocationRecommendations />
        </div>
      </div>

      {/* ROW 5: Demand prediction */}
      <div className="w-full min-w-0 flex flex-col">
        <DemandTrend />
      </div>

    </div>
  );
}
