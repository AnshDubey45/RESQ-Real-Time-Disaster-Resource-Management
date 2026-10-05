import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PriorityRadarProps {
  factors: {
    severity: number;
    populationImpact: number;
    medicalUrgency: number;
    resourceShortage: number;
    accessibility: number;
  };
}

export function PriorityRadar({ factors }: PriorityRadarProps) {
  const data = [
    { subject: 'Severity', A: factors.severity, fullMark: 100 },
    { subject: 'Population', A: factors.populationImpact, fullMark: 100 },
    { subject: 'Medical', A: factors.medicalUrgency, fullMark: 100 },
    { subject: 'Resources', A: factors.resourceShortage, fullMark: 100 },
    { subject: 'Access', A: factors.accessibility, fullMark: 100 },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B' }} />
            <Radar name="Priority" dataKey="A" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div>Severity: {factors.severity} (30% weight) = +{(factors.severity * 0.3).toFixed(1)}</div>
        <div>Population: {factors.populationImpact} (25% weight) = +{(factors.populationImpact * 0.25).toFixed(1)}</div>
        <div>Medical: {factors.medicalUrgency} (20% weight) = +{(factors.medicalUrgency * 0.2).toFixed(1)}</div>
        <div>Resources: {factors.resourceShortage} (15% weight) = +{(factors.resourceShortage * 0.15).toFixed(1)}</div>
        <div>Access: {factors.accessibility} (10% weight) = +{(factors.accessibility * 0.1).toFixed(1)}</div>
      </div>
    </div>
  );
}
