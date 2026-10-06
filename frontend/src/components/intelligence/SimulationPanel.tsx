import React from 'react';
import { api } from '@/services/api';
import type { SimulationInput, SimulationResult } from '@/types';
import { Activity, ArrowRight, TrendingUp, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils';

export function SimulationPanel() {
  const [input, setInput] = React.useState<SimulationInput>({
    disasterType: 'cyclone',
    population: 50000,
    severity: 7,
    duration: 5,
    medicalUrgency: 60,
    accessibility: 40,
    inventoryModifier: 100
  });

  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<SimulationResult | null>(null);

  const handleRun = async () => {
    setLoading(true);
    const res = await api.runSimulation(input);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Input Form */}
      <div className="lg:col-span-4 bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6 space-y-6 h-fit shadow-lg shadow-black/20">
        <h3 className="text-lg font-semibold text-[#E2E8F0] border-b border-[rgba(148,163,184,0.12)] pb-4">Scenario Parameters</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Disaster Type</label>
            <select 
              value={input.disasterType}
              onChange={e => setInput({...input, disasterType: e.target.value as any})}
              className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-md px-3 py-2 text-[#E2E8F0] text-sm focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="cyclone">Cyclone</option>
              <option value="earthquake">Earthquake</option>
              <option value="flood">Flood</option>
              <option value="landslide">Landslide</option>
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm text-[#94A3B8]">Severity</label>
              <span className="text-sm font-medium text-[#38BDF8]">{input.severity}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              value={input.severity}
              onChange={e => setInput({...input, severity: Number(e.target.value)})}
              className="w-full accent-[#38BDF8]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Population Affected</label>
            <input 
              type="number" 
              value={input.population}
              onChange={e => setInput({...input, population: Number(e.target.value)})}
              className="w-full bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-md px-3 py-2 text-[#E2E8F0] text-sm focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm text-[#94A3B8]">Medical Urgency</label>
              <span className="text-sm font-medium text-[#F87171]">{input.medicalUrgency}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={input.medicalUrgency}
              onChange={e => setInput({...input, medicalUrgency: Number(e.target.value)})}
              className="w-full accent-[#F87171]"
            />
          </div>
        </div>

        <button 
          onClick={handleRun}
          disabled={loading}
          className="w-full py-2.5 mt-2 bg-[#38BDF8] text-[#0B0F19] font-semibold rounded-lg hover:bg-[#38BDF8]/90 transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? 'Simulating...' : (
            <>
              <Activity className="w-4 h-4" />
              RUN SIMULATION
            </>
          )}
        </button>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-8">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] border border-dashed border-[rgba(148,163,184,0.2)] rounded-xl p-12 text-center bg-[#1E293B]/30 min-h-[400px]">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Configure parameters and run simulation to predict outcomes.</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex items-center justify-center text-[#38BDF8] min-h-[400px] border border-[rgba(148,163,184,0.05)] rounded-xl bg-[#1E293B]/10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Water Demand', data: result.waterDemand, unit: 'L' },
                { label: 'Food Demand', data: result.foodDemand, unit: 'kg' },
                { label: 'Medicine Demand', data: result.medicineDemand, unit: 'units' },
                { label: 'Shelter Demand', data: result.shelterDemand, unit: 'beds' }
              ].map(r => {
                const increase = r.data.simulated > r.data.current;
                return (
                  <div key={r.label} className={cn("bg-[#1E293B] border rounded-xl p-5 shadow-sm", increase ? "border-[#F87171]/30 bg-[#F87171]/5" : "border-[rgba(148,163,184,0.12)]")}>
                    <h4 className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider mb-3">{r.label}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-[#E2E8F0]">{r.data.current.toLocaleString()} <span className="text-sm font-normal text-slate-500">{r.unit}</span></p>
                        <p className="text-[10px] uppercase text-[#94A3B8] mt-0.5">Current</p>
                      </div>
                      <ArrowRight className={cn("w-4 h-4 mx-2", increase ? "text-[#F87171]" : "text-[#94A3B8]")} />
                      <div className="text-right">
                        <p className={cn("text-lg font-bold", increase ? "text-[#F87171]" : "text-[#38BDF8]")}>{r.data.simulated.toLocaleString()} <span className="text-sm font-normal opacity-70">{r.unit}</span></p>
                        <p className="text-[10px] uppercase text-[#94A3B8] mt-0.5">Simulated</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(result.shortages).length > 0 && (
              <div className="bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl p-5">
                <h4 className="text-[#F87171] font-semibold text-sm flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-4 h-4" /> Critical Shortages Detected
                </h4>
                <ul className="list-disc pl-5 text-sm text-[#E2E8F0] space-y-1.5 marker:text-[#F87171]/50">
                  {Object.entries(result.shortages).map(([k, v], i) => <li key={i}>{k}: {v} shortage</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
