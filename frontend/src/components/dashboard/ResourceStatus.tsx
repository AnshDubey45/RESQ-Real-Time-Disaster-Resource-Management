import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const ResourceStatus = () => {
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, calculate from warehouses data. Mocking for this view.
    setResources([
      { name: 'Water (Liters)', available: 45000, total: 50000, type: 'Water' },
      { name: 'Rations (Meals)', available: 12000, total: 30000, type: 'Food' },
      { name: 'Medical Kits', available: 450, total: 2000, type: 'Medical' },
      { name: 'Blankets', available: 8000, total: 10000, type: 'Shelter' },
      { name: 'Generators', available: 15, total: 50, type: 'Power' }
    ]);
  }, []);

  return (
    <div className="bg-[#1E293B]/60 backdrop-blur-md border border-[rgba(148,163,184,0.12)] rounded-xl p-5 h-full flex flex-col">
      <div className="text-[11px] font-semibold text-[#94A3B8] tracking-widest uppercase mb-5">
        Regional Resource Coverage
      </div>
      
      <div className="space-y-4 flex-1">
        {resources.map((res, i) => {
          const percent = Math.round((res.available / res.total) * 100);
          let barColor = 'bg-emerald-500';
          if (percent < 30) barColor = 'bg-red-500';
          else if (percent <= 60) barColor = 'bg-amber-500';

          return (
            <div key={res.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#E2E8F0] font-medium">{res.name}</span>
                <span className="text-[#94A3B8]">{percent}%</span>
              </div>
              <div className="w-full bg-[#0B0F19] rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
