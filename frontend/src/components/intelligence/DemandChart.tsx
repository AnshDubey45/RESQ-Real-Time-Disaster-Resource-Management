import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function DemandChart({ data }: { data: any[] }) {
  // Format data if needed
  const formattedData = data.map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#ffffff10', borderRadius: '8px', color: '#E2E8F0' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <ReferenceLine y={8000} stroke="#F87171" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Threshold', fill: '#F87171', fontSize: 12 }} />
          
          <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#colorBand)" />
          <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#1E293B" />
          
          <Area type="monotone" dataKey="actual" stroke="#60A5FA" strokeWidth={2} fill="none" name="Actual Demand" />
          <Area type="monotone" dataKey="predicted" stroke="#38BDF8" strokeWidth={2} fill="url(#colorPredicted)" name="Predicted Demand" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
