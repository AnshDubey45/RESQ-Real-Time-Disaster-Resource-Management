import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DemandTrend = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Mocking some time series data
    const mockData = Array.from({ length: 7 }).map((_, i) => {
      const actual = 10000 + Math.random() * 5000;
      const predicted = actual + (Math.random() - 0.5) * 2000;
      return {
        day: `Day ${i + 1}`,
        actual: i < 5 ? actual : null,
        predicted: predicted,
        lower: predicted * 0.85,
        upper: predicted * 1.15
      };
    });
    setData(mockData);
  }, []);

  return (
    <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6 h-full">
      <h3 className="text-[#E2E8F0] font-semibold mb-4 text-sm">7-Day Water Demand Prediction (Liters)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(148,163,184,0.12)', color: '#E2E8F0' }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            {/* Uncertainty band */}
            <Area type="monotone" dataKey="upper" stroke="none" fill="#FBBF24" fillOpacity={0.1} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#1E293B" fillOpacity={1} />
            
            <Area type="monotone" dataKey="predicted" stroke="#38BDF8" strokeDasharray="5 5" fill="url(#colorPredicted)" strokeWidth={2} />
            <Area type="monotone" dataKey="actual" stroke="#60A5FA" fill="none" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><div className="w-3 h-1 bg-[#60A5FA]"></div>Actual</div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><div className="w-3 h-1 border-b-2 border-dashed border-[#38BDF8]"></div>Predicted</div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><div className="w-3 h-3 bg-[#FBBF24] opacity-20"></div>Confidence Band</div>
      </div>
    </div>
  );
};
