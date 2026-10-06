import React from 'react';

interface AIExplanationProps {
  priorityFactors: {
    severity: number;
    populationImpact: number;
    medicalUrgency: number;
    resourceShortage: number;
    accessibility: number;
  };
  priorityScore: number;
  areaName: string;
}

export function AIExplanation({ priorityFactors, priorityScore, areaName }: AIExplanationProps) {
  const scores = [
    { label: 'Severity', value: priorityFactors.severity * 0.3, color: 'bg-red-500' },
    { label: 'Population', value: priorityFactors.populationImpact * 0.25, color: 'bg-orange-500' },
    { label: 'Medical Urgency', value: priorityFactors.medicalUrgency * 0.2, color: 'bg-yellow-500' },
    { label: 'Resource Shortage', value: priorityFactors.resourceShortage * 0.15, color: 'bg-cyan-500' },
    { label: 'Accessibility', value: priorityFactors.accessibility * 0.1, color: 'bg-blue-500' }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-5 border-l-4 border-l-sky-400">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sky-400 text-sm font-bold">✦ RESQ INTELLIGENCE</span>
      </div>
      <h3 className="text-white font-medium mb-4">Why {areaName} was prioritized</h3>
      
      <div className="space-y-3 mb-4">
        {scores.map((score, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{score.label}</span>
              <span className="text-slate-100 font-medium">+{score.value.toFixed(1)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${score.color}`} 
                style={{ width: `${(score.value / 30) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
        <span className="text-slate-400 font-medium">Total Priority Score</span>
        <span className="text-2xl font-bold text-white">{priorityScore.toFixed(1)}</span>
      </div>
    </div>
  );
}
