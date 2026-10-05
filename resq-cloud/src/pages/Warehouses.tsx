import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Warehouse } from '@/types';
import { cn } from '@/utils';
import { MapPin, Activity, Navigation, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WarehouseDetailPanel } from '@/components/resources/WarehouseDetailPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

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

  const refreshWarehouse = async (id: string) => {
    try {
      const updated = await api.getWarehouseById(id);
      setWarehouses(prev => updated ? prev.map(w => w.id === id ? updated : w) : prev);
    } catch(e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'DEGRADED': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'OFFLINE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRouteStatusColor = (status: string) => {
    switch (status) {
      case 'CLEAR': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'DELAYED': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'BLOCKED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen text-[#E2E8F0] relative overflow-hidden">
      <PageHeader 
        title="Warehouses" 
        description="Monitor warehouse operations and route statuses"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.map(w => {
          const capacityPercent = Math.min((w.usedCapacity / w.capacity) * 100, 100);
          return (
            <motion.div
              key={w.id}
              whileHover={{ y: -2 }}
              className="bg-transparent border border-[rgba(148,163,184,0.12)] rounded-xl p-5 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{w.name}</h2>
                  <div className="flex items-center text-[#94A3B8] text-sm">
                    <MapPin size={14} className="mr-1" /> {w.location}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5", getStatusColor(w.operationalStatus))}>
                    <Activity size={12} />
                    {w.operationalStatus}
                  </span>
                  <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5", getRouteStatusColor(w.routeStatus))}>
                    <Navigation size={12} />
                    {w.routeStatus}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#94A3B8]">Capacity</span>
                  <span className="font-medium">{Math.round(capacityPercent)}%</span>
                </div>
                <div className="h-2 w-full bg-transparent rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", 
                      capacityPercent > 90 ? 'bg-red-500' : capacityPercent > 70 ? 'bg-amber-500' : 'bg-[#38BDF8]'
                    )} 
                    style={{ width: `${capacityPercent}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-[#94A3B8] mt-1.5">
                  <span>{w.usedCapacity.toLocaleString()} used</span>
                  <span>{w.capacity.toLocaleString()} total</span>
                </div>
              </div>

              <div className="mt-auto">
                <h4 className="text-xs font-medium text-[#94A3B8] uppercase mb-2">Key Resources</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {w.resources.slice(0, 5).map(r => (
                    <div key={r.resourceType} className="bg-transparent border border-[rgba(148,163,184,0.12)] px-2 py-1 rounded-md flex items-center gap-1.5 text-sm">
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        r.stockStatus === 'healthy' ? 'bg-green-500' : r.stockStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      )} />
                      {r.resourceType}
                    </div>
                  ))}
                  {w.resources.length > 5 && (
                    <div className="text-xs text-[#94A3B8] px-1 py-1 flex items-center">+{w.resources.length - 5} more</div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedWarehouseId(w.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[rgba(148,163,184,0.12)] hover:bg-transparent hover:border-[#38BDF8] text-[#E2E8F0] transition-colors font-medium text-sm"
                >
                  VIEW DETAILS <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedWarehouseId && (
          <WarehouseDetailPanel 
            warehouseId={selectedWarehouseId} 
            onClose={() => setSelectedWarehouseId(null)} 
            onUpdate={() => refreshWarehouse(selectedWarehouseId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
