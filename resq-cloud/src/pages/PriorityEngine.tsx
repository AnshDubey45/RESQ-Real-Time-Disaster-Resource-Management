import React from 'react';
import { api } from '@/services/api';
import type { AffectedArea } from '@/types';
import { getPriorityLevel, getSeverityColor } from '@/utils';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

import { PageHeader } from '@/components/ui/PageHeader';

export default function PriorityEngine() {
  const [areas, setAreas] = React.useState<AffectedArea[]>([]);
  const [selectedArea, setSelectedArea] = React.useState<AffectedArea | null>(null);

  React.useEffect(() => {
    async function load() {
      const data = await api.getAffectedAreas();
      setAreas(data.sort((a, b) => b.priorityScore - a.priorityScore));
      if (data.length > 0) setSelectedArea(data[0]);
    }
    load();
  }, []);

  const radarData = selectedArea ? [
    { subject: 'Severity', A: selectedArea.priorityFactors.severity, fullMark: 100 },
    { subject: 'Population', A: selectedArea.priorityFactors.populationImpact, fullMark: 100 },
    { subject: 'Medical', A: selectedArea.priorityFactors.medicalUrgency, fullMark: 100 },
    { subject: 'Shortage', A: selectedArea.priorityFactors.resourceShortage, fullMark: 100 },
    { subject: 'Access', A: selectedArea.priorityFactors.accessibility, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6 md:space-y-8 bg-transparent">
      <PageHeader 
        title="Priority Engine" 
        description="Multi-factor ranking to identify the most critical areas needing assistance."
      />

      {/* Formula Explanation */}
      <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Scoring Algorithm Weighting</h2>
        <div className="flex h-6 rounded-full overflow-hidden text-xs font-bold text-[#0B0F19] text-center">
          <div className="bg-[#F87171] w-[30%] flex items-center justify-center">Severity 30%</div>
          <div className="bg-[#FBBF24] w-[25%] flex items-center justify-center">Population 25%</div>
          <div className="bg-[#38BDF8] w-[20%] flex items-center justify-center">Medical 20%</div>
          <div className="bg-[#A78BFA] w-[15%] flex items-center justify-center">Shortage 15%</div>
          <div className="bg-[#34D399] w-[10%] flex items-center justify-center">Access 10%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Selected Area Detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedArea && (
            <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#E2E8F0]">{selectedArea.name}</h3>
                <div className="mt-4">
                  <p className="text-sm text-[#94A3B8] mb-1">Priority Score</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-[#F87171]">{selectedArea.priorityScore.toFixed(1)}</span>
                    <span className="px-2 py-1 bg-[#F87171]/20 text-[#F87171] rounded text-sm font-bold">
                      {getPriorityLevel(selectedArea.priorityScore).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Severity</span>
                    <span className="text-[#E2E8F0] font-medium">{selectedArea.severity}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Medical Urgency</span>
                    <span className="text-[#E2E8F0] font-medium">{selectedArea.medicalUrgency}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Population</span>
                    <span className="text-[#E2E8F0] font-medium">{selectedArea.population}</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Area" dataKey="A" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* All Areas List */}
        <div className="lg:col-span-1 bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-auto">
          <div className="p-4 border-b border-[rgba(148,163,184,0.12)]">
            <h3 className="font-semibold text-[#E2E8F0]">Ranked Areas</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {areas.map((area, idx) => (
              <div 
                key={area.id} 
                onClick={() => setSelectedArea(area)}
                className={`p-4 border-b border-[rgba(148,163,184,0.05)] cursor-pointer hover:bg-[#263548] transition-colors ${selectedArea?.id === area.id ? 'bg-[#263548] border-l-2 border-l-[#38BDF8]' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#E2E8F0]"><span className="text-[#94A3B8] mr-2">#{idx + 1}</span>{area.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(area.severity)} bg-opacity-20`}>
                    {area.priorityScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-transparent rounded-full h-1.5">
                  <div className="bg-[#38BDF8] h-1.5 rounded-full" style={{ width: `${area.priorityScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
