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
    areaId: '',
    resourceType: '',
    quantity: '',
    urgency: 'medium',
    notes: ''
  });

  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Mock fetching resource types since we don't have a direct API for it, or use api if it exists
    const fetchTypes = async () => {
      try {
        if(api.getResourceTypes) {
          const types = await api.getResourceTypes();
          setResourceTypes(types);
        } else {
          setResourceTypes(['Water (Bottles)', 'MRE (Meals)', 'Medical Kits', 'Blankets', 'Tents']);
        }
      } catch (error) {
        setResourceTypes(['Water (Bottles)', 'MRE (Meals)', 'Medical Kits', 'Blankets', 'Tents']);
      }
    };
    fetchTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.areaId || !formData.resourceType || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if(api.createResourceRequest) {
        await api.createResourceRequest({
          areaId: formData.areaId,
          areaName: formData.areaId, // Mocking area name
          disasterName: 'Current Disaster',
          resourceType: formData.resourceType,
          requestedQuantity: parseInt(formData.quantity, 10),
          unit: 'Units',
          urgency: formData.urgency as any,
          notes: formData.notes
        });
      }
      toast.success('Resource request created successfully');
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
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Area</label>
              <input
                type="text"
                value={formData.areaId}
                onChange={e => setFormData({ ...formData, areaId: e.target.value })}
                placeholder="e.g., Downtown Sector 4"
                className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Resource Type</label>
              <select
                value={formData.resourceType}
                onChange={e => setFormData({ ...formData, resourceType: e.target.value })}
                className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#38BDF8]"
                required
              >
                <option value="">Select a resource...</option>
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
