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
    <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6 border-l-4 border-l-[#F87171]">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-[#F87171]/20 text-[#F87171] px-2 py-1 rounded text-xs font-bold tracking-wider flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" /> CRITICAL INCIDENT
        </span>
        <span className="text-[#94A3B8] text-sm ml-auto">Priority Score: <strong className="text-[#F87171]">{area.priorityScore.toFixed(1)}</strong></span>
      </div>

      <h2 className="text-2xl font-bold text-[#E2E8F0] mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-[#38BDF8]" />
        {area.name}
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-[rgba(148,163,184,0.12)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Pop
          </div>
          <div className="text-lg font-semibold text-[#E2E8F0]">{area.population.toLocaleString()}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5" />
            Urgency
          </div>
          <div className="text-lg font-semibold text-[#E2E8F0]">{area.medicalUrgency}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" />
            Access
          </div>
          <div className="text-lg font-semibold text-[#E2E8F0]">{area.accessibility}</div>
        </div>
      </div>

      {area.warnings && area.warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {area.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 text-[#FBBF24] bg-[#FBBF24]/10 p-2 rounded">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/50 hover:bg-[#38BDF8]/20 px-4 py-2 rounded font-medium text-sm transition-colors">
          VIEW INCIDENT
        </button>
        <button className="bg-[#38BDF8] text-[#0B0F19] hover:bg-[#38BDF8]/90 px-4 py-2 rounded font-medium text-sm transition-colors">
          VIEW ALLOCATION
        </button>
      </div>
    </div>
  );
};
