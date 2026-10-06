import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { api } from '@/services/api';
import type { Disaster } from '@/types';
import { DisasterCard } from '@/components/disaster/DisasterCard';
import { CreateDisasterModal } from '@/components/disaster/CreateDisasterModal';
import { DisasterDetailModal } from '@/components/disaster/DisasterDetailModal';
import { formatNumber } from '@/utils';
import { PageHeader } from '@/components/ui/PageHeader';

export default function Disasters() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    setLoading(true);
    try {
      const data = await api.getDisasters();
      setDisasters(data);
    } catch (error) {
      console.error('Failed to fetch disasters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisasters = disasters.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const stats = {
    total: disasters.length,
    active: disasters.filter(d => d.status === 'active').length,
    monitoring: disasters.filter(d => d.status === 'monitoring').length,
    affectedPop: disasters.reduce((acc, d) => acc + d.affectedPopulation, 0)
  };
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-transparent text-slate-200">
      <PageHeader 
        title="Disasters" 
        description="Manage and track active disaster zones." 
        action={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Disaster
          </button>
        } 
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Disasters</div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{stats.total}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Active</div>
          <div className="text-4xl font-extrabold text-sky-400 tracking-tight">{stats.active}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Monitoring</div>
          <div className="text-4xl font-extrabold text-amber-400 tracking-tight">{stats.monitoring}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Affected Population</div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{formatNumber(stats.affectedPop)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search disasters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 focus:outline-none focus:border-sky-500 appearance-none font-medium transition-colors"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading disasters...</div>
      ) : filteredDisasters.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-800/30 rounded-xl border border-slate-700/50">
          No disasters found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisasters.map(disaster => (
            <DisasterCard 
              key={disaster.id} 
              disaster={disaster} 
              onClick={() => setSelectedDisaster(disaster)}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateDisasterModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchDisasters();
          }}
        />
      )}

      {selectedDisaster && (
        <DisasterDetailModal 
          disaster={selectedDisaster}
          onClose={() => setSelectedDisaster(null)}
        />
      )}
    </div>
  );
}
