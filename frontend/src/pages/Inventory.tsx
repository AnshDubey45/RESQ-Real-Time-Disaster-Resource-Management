import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Warehouse } from '@/types';
import { cn, formatNumber } from '@/utils';
import { Search, Filter, Box, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';

export default function Inventory() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await api.getWarehouses();
        setWarehouses(data);
      } catch (error) {
        console.error('Failed to fetch warehouses', error);
      }
    };
    fetchWarehouses();
  }, []);

  const allResources = warehouses.flatMap(w => 
    w.resources.map(r => ({ ...r, warehouseName: w.name, warehouseId: w.id }))
  );

  const filteredResources = allResources.filter(r => {
    const matchesSearch = r.resourceType.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'All' || r.warehouseId === warehouseFilter;
    const matchesStatus = statusFilter === 'All' || r.stockStatus === statusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  const totalTracked = allResources.length;
  const healthyCount = allResources.filter(r => r.stockStatus === 'healthy').length;
  const warningCount = allResources.filter(r => r.stockStatus === 'warning').length;
  const criticalCount = allResources.filter(r => r.stockStatus === 'critical').length;

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen text-[#E2E8F0]">
      <PageHeader 
        title="Inventory" 
        description="Track and manage resources across all facilities"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Resources Tracked', value: totalTracked, color: 'text-white', icon: <Box size={24} className="text-[#38BDF8] opacity-50" /> },
          { label: 'Healthy Items', value: healthyCount, color: 'text-green-400', icon: <CheckCircle size={24} className="text-green-400 opacity-50" /> },
          { label: 'Warning Items', value: warningCount, color: 'text-amber-400', icon: <AlertTriangle size={24} className="text-amber-400 opacity-50" /> },
          { label: 'Critical Items', value: criticalCount, color: 'text-red-400', icon: <AlertCircle size={24} className="text-red-400 opacity-50" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-transparent border border-[rgba(148,163,184,0.12)] p-5 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[#94A3B8] mb-1">{stat.label}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      <div className="bg-transparent border border-[rgba(148,163,184,0.12)] rounded-xl overflow-hidden shadow-lg shadow-black/10">
        <div className="p-5 border-b border-[rgba(148,163,184,0.12)] flex flex-wrap gap-4 items-center bg-[#1E293B]/50">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search resource type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 focus:outline-none focus:border-sky-500 max-w-[200px] truncate font-medium transition-colors appearance-none"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 focus:outline-none focus:border-sky-500 font-medium transition-colors appearance-none"
            >
              <option value="All">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-transparent text-[#94A3B8]">
              <tr>
                <th className="px-8 py-5 font-medium">Warehouse</th>
                <th className="px-8 py-5 font-medium">Resource Type</th>
                <th className="px-8 py-5 font-medium text-right">Available</th>
                <th className="px-8 py-5 font-medium text-right">Reserved</th>
                <th className="px-8 py-5 font-medium text-right">Total</th>
                <th className="px-8 py-5 font-medium w-48">Coverage</th>
                <th className="px-8 py-5 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.12)]">
              {filteredResources.map((r, idx) => {
                const total = r.available + r.reserved;
                const coverage = total > 0 ? (r.available / total) * 100 : 0;
                
                let barColor = 'bg-red-500';
                if (coverage > 60) barColor = 'bg-green-500';
                else if (coverage >= 30) barColor = 'bg-amber-500';

                return (
                  <motion.tr
                    key={`${r.warehouseId}-${r.resourceType}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-transparent/50 transition-colors"
                  >
                    <td className="px-8 py-5 text-[#94A3B8] truncate max-w-[150px]" title={r.warehouseName}>{r.warehouseName}</td>
                    <td className="px-8 py-5 font-medium text-[#E2E8F0]">{r.resourceType}</td>
                    <td className="px-8 py-5 text-right">
                      {formatNumber(r.available)} <span className="text-[#94A3B8] text-xs ml-1">{r.unit}</span>
                    </td>
                    <td className="px-8 py-5 text-right text-[#94A3B8]">
                      {formatNumber(r.reserved)}
                    </td>
                    <td className="px-8 py-5 text-right font-medium">
                      {formatNumber(total)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${coverage}%` }} />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-8 text-right">{Math.round(coverage)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full inline-block",
                        r.stockStatus === 'healthy' && "bg-green-500/10 text-green-400 border border-green-500/20",
                        r.stockStatus === 'warning' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        r.stockStatus === 'critical' && "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {r.stockStatus}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredResources.length === 0 && (
            <div className="p-8 text-center text-[#94A3B8]">No inventory records found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
