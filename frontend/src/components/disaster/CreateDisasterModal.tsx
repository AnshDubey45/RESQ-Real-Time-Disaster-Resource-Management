import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface CreateDisasterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDisasterModal({ onClose, onSuccess }: CreateDisasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'FLOOD',
    location: '',
    state: '',
    severity: 'HIGH',
    description: '',
    affectedPopulation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createDisaster({
        ...formData,
        affectedPopulation: parseInt(formData.affectedPopulation, 10),
        status: 'ACTIVE',
        severityScore: 85, // Default for now
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
      toast.success('Disaster created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create disaster');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-semibold text-white">Create New Disaster</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="create-disaster-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Disaster Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. Cyclone Amphan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type *</label>
                <select 
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="FLOOD">Flood</option>
                  <option value="CYCLONE">Cyclone</option>
                  <option value="EARTHQUAKE">Earthquake</option>
                  <option value="WILDFIRE">Wildfire</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Severity *</label>
                <select 
                  required
                  value={formData.severity}
                  onChange={e => setFormData({...formData, severity: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Location (City/Region) *</label>
                <input 
                  required
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. Coastal Areas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">State/Province *</label>
                <input 
                  required
                  type="text" 
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. West Bengal"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Affected Population (Estimate) *</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.affectedPopulation}
                  onChange={e => setFormData({...formData, affectedPopulation: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. 50000"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
                  placeholder="Provide a detailed description of the disaster situation..."
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-disaster-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Disaster'}
          </button>
        </div>
      </div>
    </div>
  );
}
