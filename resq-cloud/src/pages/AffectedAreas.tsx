import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { api } from '@/services/api';
import type { AffectedArea } from '@/types';
import { formatNumber, getSeverityBg, getSeverityColor, getStatusBg, getStatusColor } from '@/utils';
import { AreaDetailPanel } from '@/components/disaster/AreaDetailPanel';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AffectedAreas() {
  const [areas, setAreas] = useState<AffectedArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedArea, setSelectedArea] = useState<AffectedArea | null>(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const data = await api.getAffectedAreas();
      // Sort by priority desc by default
      const sortedData = [...data].sort((a, b) => b.priorityScore - a.priorityScore);
      setAreas(sortedData);
    } catch (error) {
      console.error('Failed to fetch affected areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = areas.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getUrgencyColor = (val: number) => {
    if (val >= 80) return 'text-red-400';
    if (val >= 60) return 'text-amber-400';
    return 'text-sky-400';
  };

  const getPriorityColor = (val: number) => {
    if (val >= 80) return 'text-red-400';
    if (val >= 60) return 'text-amber-400';
    return 'text-sky-400';
  };

  return (
    <div className="space-y-6 md:space-y-8 bg-transparent max-w-7xl mx-auto">
      <PageHeader 
        title="Affected Areas" 
        description="Monitor and prioritize specific impacted regions."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search areas by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 appearance-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F19]/50 border-b border-[rgba(148,163,184,0.12)] text-[#94A3B8] text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-5">Area Name</th>
                <th className="py-4 px-5">Disaster</th>
                <th className="py-4 px-5">Population</th>
                <th className="py-4 px-5">Severity</th>
                <th className="py-4 px-5">Med. Urgency</th>
                <th className="py-4 px-5">Access</th>
                <th className="py-4 px-5 cursor-pointer hover:text-[#E2E8F0] transition-colors group">
                  <div className="flex items-center gap-1.5">
                    Priority Score
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </div>
                </th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">Loading areas...</td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">No areas found.</td>
                </tr>
              ) : (
                filteredAreas.map(area => (
                  <tr key={area.id} className="hover:bg-[#263548] transition-colors group">
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#E2E8F0]">{area.name}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm text-[#38BDF8] hover:underline cursor-pointer">{area.disasterId}</div>
                    </td>
                    <td className="py-4 px-5 text-[#94A3B8] text-sm font-medium">
                      {formatNumber(area.population)}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={area.severity.toLowerCase()} label={area.severity} />
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-sm font-medium ${getUrgencyColor(area.medicalUrgency)}`}>
                        {area.medicalUrgency}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm font-medium text-[#94A3B8]">
                        {area.accessibility}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-lg font-bold ${getPriorityColor(area.priorityScore)}`}>
                        {area.priorityScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={area.status.toLowerCase()} label={area.status.replace('_', ' ')} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => setSelectedArea(area)}
                        className="text-sm text-[#38BDF8] hover:text-[#bae6fd] font-medium px-4 py-2 rounded-lg bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedArea && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedArea(null)}
          />
          <AreaDetailPanel area={selectedArea} onClose={() => setSelectedArea(null)} />
        </>
      )}
    </div>
  );
}
