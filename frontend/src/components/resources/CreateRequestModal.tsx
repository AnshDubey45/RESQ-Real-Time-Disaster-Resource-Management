import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CreateRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    areaId: 'A-001',
    areaName: 'Chennai Central',
    disasterName: 'Chennai Basin Floods',
    resourceType: 'Water',
    quantity: '10000',
    urgency: 'high',
    notes: ''
  });

  const [resourceTypes, setResourceTypes] = useState<any[]>(['Water', 'Food Packets', 'Medicine', 'Shelter Kits', 'Rescue Equipment']);
  const [areas, setAreas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [types, areaList] = await Promise.all([
          api.getResourceTypes(),
          api.getAffectedAreas()
        ]);
        if (types && types.length > 0) setResourceTypes(types);
        if (areaList && areaList.length > 0) {
          setAreas(areaList);
          setFormData(prev => ({
            ...prev,
            areaId: areaList[0].id,
            areaName: areaList[0].name,
            disasterName: areaList[0].disasterName
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch modal dependencies', error);
      }
    };
    fetchFormData();
  }, []);

  const handleAreaChange = (selectedId: string) => {
    const matched = areas.find(a => a.id === selectedId);
    setFormData(prev => ({
      ...prev,
      areaId: selectedId,
      areaName: matched ? matched.name : selectedId,
      disasterName: matched ? matched.disasterName : 'Active Disaster'
    }));
  };

  const getUnitForResource = (type: string) => {
    if (type.includes('Water')) return 'Liters';
    if (type.includes('Medicine')) return 'Kits';
    if (type.includes('Rescue')) return 'Sets';
    return 'Units';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.areaId || !formData.resourceType || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.createResourceRequest({
        areaId: formData.areaId,
        areaName: formData.areaName,
        disasterName: formData.disasterName,
        resourceType: formData.resourceType,
        requestedQuantity: parseInt(formData.quantity, 10),
        unit: getUnitForResource(formData.resourceType),
        urgency: formData.urgency as any,
        notes: formData.notes
      });
      toast.success('Resource request & allocation route created successfully');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-[rgba(148,163,184,0.12)] flex items-center justify-between bg-[#0B0F19]">
            <h2 className="text-lg font-semibold text-white">New Resource Request</h2>
            <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-white rounded-md hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Affected Disaster Sector</label>
              {areas.length > 0 ? (
                <select
                  value={formData.areaId}
                  onChange={e => handleAreaChange(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  required
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.disasterName})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.areaName}
                  onChange={e => setFormData({ ...formData, areaId: e.target.value, areaName: e.target.value })}
                  placeholder="e.g., Chennai Central"
                  className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Resource Type</label>
              <select
                value={formData.resourceType}
                onChange={e => setFormData({ ...formData, resourceType: e.target.value })}
                className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                required
              >
                {resourceTypes.map(t => {
                  const val = typeof t === 'string' ? t : t.name;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional details..."
                className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8] resize-none"
              />
            </div>
            
            <div className="pt-4 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-[#94A3B8] hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-medium bg-[#38BDF8] text-[#0B0F19] hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
