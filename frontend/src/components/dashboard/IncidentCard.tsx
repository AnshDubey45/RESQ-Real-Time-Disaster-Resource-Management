import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, MapPin, Users, HeartPulse, Navigation } from 'lucide-react';
import { api } from '@/services/api';
import type { AffectedArea } from '@/types';

export const IncidentCard = () => {
  const [area, setArea] = useState<AffectedArea | null>(null);

  useEffect(() => {
    api.getAffectedAreas().then(areas => {
      const critical = areas.find(a => a.severity.toLowerCase() === 'critical');
      if (critical) setArea(critical);
      else if (areas.length > 0) setArea(areas[0]);
    });
  }, []);

  if (!area) return null;

  return (
    <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-8 border-l-4 border-l-[#F87171]">
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-[#F87171]/20 text-[#F87171] px-3 py-1.5 rounded-md text-sm font-bold tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-5 h-5" /> CRITICAL INCIDENT
        </span>
        <span className="text-[#94A3B8] text-base ml-auto font-medium">Priority Score: <strong className="text-[#F87171] text-lg">{area.priorityScore.toFixed(1)}</strong></span>
      </div>

      <h2 className="text-3xl font-bold text-[#E2E8F0] mb-6 flex items-center gap-2">
        <MapPin className="w-8 h-8 text-[#38BDF8]" />
        {area.name}
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-[rgba(148,163,184,0.12)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm text-[#94A3B8] font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Pop
          </div>
          <div className="text-2xl font-bold text-[#E2E8F0]">{area.population.toLocaleString()}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm text-[#94A3B8] font-semibold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            Urgency
          </div>
          <div className="text-2xl font-bold text-[#E2E8F0]">{area.medicalUrgency}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm text-[#94A3B8] font-semibold uppercase tracking-wider">
            <Navigation className="w-4 h-4" />
            Access
          </div>
          <div className="text-2xl font-bold text-[#E2E8F0]">{area.accessibility}</div>
        </div>
      </div>

      {area.warnings && area.warnings.length > 0 && (
        <div className="mb-8 space-y-3">
          {area.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-3 text-[#FBBF24] bg-[#FBBF24]/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-base font-medium">{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/50 hover:bg-[#38BDF8]/20 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
          VIEW INCIDENT
        </button>
        <button className="bg-[#38BDF8] text-[#0B0F19] hover:bg-[#38BDF8]/90 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
          VIEW ALLOCATION
        </button>
      </div>
    </div>
  );
};
