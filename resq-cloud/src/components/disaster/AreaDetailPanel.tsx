import React from 'react';
import { X, ExternalLink, Map, Users, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { AffectedArea } from '@/types';
import { formatNumber, getSeverityColor, getSeverityBg } from '@/utils';
import { PriorityRadar } from '../intelligence/PriorityRadar';
import { AIExplanation } from '../intelligence/AIExplanation';

interface AreaDetailPanelProps {
  area: AffectedArea;
  onClose: () => void;
}

export function AreaDetailPanel({ area, onClose }: AreaDetailPanelProps) {
  // Use area's priorityFactors if available, otherwise fallback
  const factors = area.priorityFactors || {
    severity: 85,
    populationImpact: 70,
    medicalUrgency: 90,
    resourceShortage: 65,
    accessibility: 40
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900">
        <div>
          <h2 className="text-xl font-bold text-white">{area.name}</h2>
          <p className="text-slate-400 text-sm mt-0.5">Disaster Area Profile</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Priority Score Header */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 flex justify-between items-center">
          <div>
            <div className="text-slate-400 text-sm mb-1 font-medium">Priority Score</div>
            <div className={`text-4xl font-bold ${area.priorityScore > 80 ? 'text-red-400' : area.priorityScore > 60 ? 'text-amber-400' : 'text-sky-400'}`}>
              {area.priorityScore.toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getSeverityBg(area.severity)} ${getSeverityColor(area.severity)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {area.severity}
            </span>
            <span className="text-slate-400 text-xs">Status: <span className="text-slate-200">{area.status}</span></span>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Population</div>
              <div className="text-slate-200 font-medium">{formatNumber(area.population)}</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Medical Urgency</div>
              <div className="text-slate-200 font-medium">{area.medicalUrgency}%</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Accessibility</div>
              <div className="text-slate-200 font-medium">{area.accessibility}%</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Coverage</div>
              <div className="text-slate-200 font-medium">Partial</div>
            </div>
          </div>
        </div>

        {/* AI Intelligence */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Intelligence Profile</h3>
          <AIExplanation priorityFactors={factors} priorityScore={area.priorityScore} areaName={area.name} />
        </div>

        {/* Priority Radar */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-slate-200 font-medium mb-4">Factor Analysis</h3>
          <PriorityRadar factors={factors} />
        </div>

        {/* Resource Shortages (Mock) */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Critical Shortages</h3>
          <div className="space-y-3">
            <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/30">
              <span className="text-slate-300">Medical Supplies</span>
              <span className="text-red-400 text-sm font-medium">Critical (85% deficit)</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/30">
              <span className="text-slate-300">Clean Water</span>
              <span className="text-amber-400 text-sm font-medium">High (60% deficit)</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/30">
              <span className="text-slate-300">Shelter</span>
              <span className="text-sky-400 text-sm font-medium">Moderate (30% deficit)</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-2 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Active Warnings
          </div>
          <ul className="list-disc list-inside text-sm text-amber-200/80 space-y-1 ml-1">
            <li>Main access road heavily flooded</li>
            <li>Power outage reported in sector 4</li>
            <li>Expected heavy rainfall in next 12 hours</li>
          </ul>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-3">
        <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2">
          View Allocation
        </button>
        <button className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          Create Request
        </button>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
