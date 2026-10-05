import React from 'react';
import { Droplets, Wind, Activity, MapPin } from 'lucide-react';
import type { Disaster } from '@/types';
import { formatNumber, formatDate } from '@/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DisasterCardProps {
  disaster: Disaster;
  onClick?: (id: string) => void;
}

export function DisasterCard({ disaster, onClick }: DisasterCardProps) {
  const getIcon = () => {
    switch (disaster.type) {
      case 'flood': return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'cyclone': return <Wind className="w-5 h-5 text-sky-400" />;
      case 'earthquake': return <Activity className="w-5 h-5 text-sky-400" />;
      default: return <Activity className="w-5 h-5 text-sky-400" />;
    }
  };

  const severityBorderColors = {
    CRITICAL: 'border-l-red-400',
    HIGH: 'border-l-amber-400',
    MEDIUM: 'border-l-sky-400',
    LOW: 'border-l-blue-400',
  };

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700/50 ${severityBorderColors[(disaster.severity as string).toUpperCase() as keyof typeof severityBorderColors] || ''} border-l-4 p-4 hover:scale-[1.02] transition-transform hover:shadow-lg hover:shadow-slate-900/50 flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">{disaster.name}</h3>
            <div className="flex items-center text-slate-400 text-xs gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{disaster.location}, {disaster.state}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <StatusBadge status={disaster.severity} label={disaster.severity} size="sm" />
        <StatusBadge status={disaster.status} label={disaster.status} size="sm" />
      </div>
      
      <div className="flex-grow grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-slate-500 text-xs mb-1">Affected Population</div>
          <div className="text-slate-200 text-sm font-medium">{formatNumber(disaster.affectedPopulation)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Last Updated</div>
          <div className="text-slate-200 text-sm">{formatDate(disaster.lastUpdate)}</div>
        </div>
      </div>
      
      <button 
        onClick={() => onClick && onClick(disaster.id)}
        className="w-full text-center text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors pt-2 border-t border-slate-700/50"
      >
        View Details
      </button>
    </div>
  );
}
