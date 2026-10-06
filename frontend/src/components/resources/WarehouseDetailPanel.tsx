import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Warehouse } from '@/types';
import { cn, formatNumber } from '@/utils';
import { X, RefreshCw, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface WarehouseDetailPanelProps {
  warehouseId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const WarehouseDetailPanel: React.FC<WarehouseDetailPanelProps> = ({ warehouseId, onClose, onUpdate }) => {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Inventory update state
  const [selectedResource, setSelectedResource] = useState('');
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchWarehouse = async () => {
      setLoading(true);
      try {
        const data = await api.getWarehouseById(warehouseId);
        setWarehouse(data || null);
      } catch (error) {
        toast.error('Failed to load warehouse details');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [warehouseId]);

  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !updateQuantity) {
      toast.error('Select a resource and valid quantity');
      return;
    }
    
    setIsUpdating(true);
    try {
      if(api.updateInventory) {
        await api.updateInventory(warehouseId, selectedResource, parseInt(updateQuantity, 10));
      }
      toast.success('Inventory updated successfully');
      setUpdateQuantity('');
      // Optimistic or fresh fetch
      const data = await api.getWarehouseById(warehouseId);
      setWarehouse(data || null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update inventory');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!warehouse && !loading) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0B0F19] border-l border-[rgba(148,163,184,0.12)] shadow-2xl flex flex-col"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="animate-spin text-[#38BDF8]" />
          </div>
        ) : warehouse ? (
          <>
            <div className="p-5 border-b border-[rgba(148,163,184,0.12)] flex items-center justify-between bg-[#1E293B]">
              <div>
                <h2 className="text-xl font-bold text-white">{warehouse.name}</h2>
                <p className="text-sm text-[#94A3B8]">{warehouse.location}</p>
              </div>
              <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[#E2E8F0]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] p-4 rounded-xl">
                  <p className="text-xs text-[#94A3B8] mb-1 uppercase tracking-wider">Operational Status</p>
                  <p className="font-semibold text-white">{warehouse.operationalStatus}</p>
                </div>
                <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] p-4 rounded-xl">
                  <p className="text-xs text-[#94A3B8] mb-1 uppercase tracking-wider">Route Status</p>
                  <p className="font-semibold text-white">{warehouse.routeStatus}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#94A3B8] uppercase mb-3">Capacity Overview</h3>
                <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] p-4 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">{formatNumber(warehouse.usedCapacity)} <span className="text-[#94A3B8]">used</span></span>
                    <span className="text-[#94A3B8]">{formatNumber(warehouse.capacity)} total</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#0B0F19] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#38BDF8] transition-all"
                      style={{ width: `${(warehouse.usedCapacity / warehouse.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#94A3B8] uppercase mb-3">Resources in Stock</h3>
                <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl overflow-hidden divide-y divide-[rgba(148,163,184,0.12)]">
                  {warehouse.resources.map(r => {
                    const total = r.available + r.reserved;
                    const coverage = total > 0 ? (r.available / total) * 100 : 0;
                    return (
                      <div key={r.resourceType} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-white">{r.resourceType}</span>
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase",
                            r.stockStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
                            r.stockStatus === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          )}>{r.stockStatus}</span>
                        </div>
                        <div className="flex items-end justify-between text-sm mb-2">
                          <div>
                            <span className="text-2xl font-bold">{formatNumber(r.available)}</span>
                            <span className="text-[#94A3B8] text-xs ml-1">{r.unit} available</span>
                          </div>
                          <div className="text-right text-[#94A3B8] text-xs">
                            {formatNumber(r.reserved)} reserved
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-[#0B0F19] rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", coverage > 50 ? 'bg-green-500' : coverage > 25 ? 'bg-amber-500' : 'bg-red-500')}
                            style={{ width: `${coverage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#94A3B8] uppercase mb-3">Update Inventory</h3>
                <form onSubmit={handleUpdateInventory} className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] p-4 rounded-xl space-y-4">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5">Resource</label>
                    <select 
                      value={selectedResource}
                      onChange={e => setSelectedResource(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                    >
                      <option value="">Select resource...</option>
                      {warehouse.resources.map(r => (
                        <option key={r.resourceType} value={r.resourceType}>{r.resourceType}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5">New Quantity (+/-)</label>
                    <input 
                      type="number"
                      value={updateQuantity}
                      onChange={e => setUpdateQuantity(e.target.value)}
                      placeholder="e.g. 500 or -100"
                      className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 bg-[#38BDF8] text-[#0B0F19] py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isUpdating ? 'Updating...' : 'Update Stock'}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : null}
      </motion.div>
    </>
  );
};
