import React from 'react';
import { X, MapPin, Activity, Droplets, Wind, Calendar, AlertTriangle } from 'lucide-react';
import type { Disaster } from '@/types';
import { formatDate, formatNumber } from '@/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DisasterDetailModalProps {
  disaster: Disaster;
  onClose: () => void;
}

export function DisasterDetailModal({ disaster, onClose }: DisasterDetailModalProps) {
  const getIcon = () => {
    switch (disaster.type) {
      case 'flood': return <Droplets className="w-6 h-6 text-sky-400" />;
      case 'cyclone': return <Wind className="w-6 h-6 text-sky-400" />;
      case 'earthquake': return <Activity className="w-6 h-6 text-sky-400" />;
      default: return <AlertTriangle className="w-6 h-6 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[rgba(148,163,184,0.12)] flex justify-between items-start bg-[#0F172A]/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700/50">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{disaster.name}</h2>
              <div className="flex items-center text-[#94A3B8] text-sm mt-1 gap-2">
                <MapPin className="w-4 h-4" />
                <span>{disaster.location}, {disaster.state}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex gap-3">
            <StatusBadge status={disaster.severity} label={`Severity: ${disaster.severity.toUpperCase()}`} />
            <StatusBadge status={disaster.status} label={`Status: ${disaster.status.toUpperCase()}`} />
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-200 leading-relaxed">{disaster.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Affected Population</div>
              <div className="text-2xl font-bold text-white">{formatNumber(disaster.affectedPopulation)}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Severity Score</div>
              <div className="text-2xl font-bold text-rose-400">{disaster.severityScore.toFixed(1)} / 10</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Started
              </div>
              <div className="text-lg font-medium text-slate-200">{formatDate(disaster.startDate)}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Last Updated
              </div>
              <div className="text-lg font-medium text-slate-200">{formatDate(disaster.lastUpdate)}</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[rgba(148,163,184,0.12)] bg-[#0F172A]/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
