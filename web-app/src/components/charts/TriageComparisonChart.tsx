"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export function TriageComparisonChart() {
  const data = [
    {
      priorityTier: "P5 Critical Safety",
      fcfsWaitHours: 14.2,
      aiWaitHours: 1.1,
      impactReduction: "92% Faster"
    },
    {
      priorityTier: "P4 High Disruption",
      fcfsWaitHours: 18.5,
      aiWaitHours: 3.4,
      impactReduction: "81% Faster"
    },
    {
      priorityTier: "P3 Medium Impact",
      fcfsWaitHours: 22.0,
      aiWaitHours: 16.5,
      impactReduction: "25% Faster"
    },
    {
      priorityTier: "P2 Low Routine",
      fcfsWaitHours: 24.5,
      aiWaitHours: 28.0,
      impactReduction: "Deprioritized"
    },
    {
      priorityTier: "P1 Cosmetic",
      fcfsWaitHours: 26.0,
      aiWaitHours: 36.0,
      impactReduction: "Deprioritized"
    }
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
          <XAxis 
            dataKey="priorityTier" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false}
            unit="h"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                    <p className="font-bold text-white border-b border-slate-800 pb-1">{item.priorityTier}</p>
                    <p className="text-amber-400">FCFS FIFO Wait: <span className="font-mono font-bold">{item.fcfsWaitHours} hrs</span></p>
                    <p className="text-sky-400">AI Context Triage: <span className="font-mono font-bold">{item.aiWaitHours} hrs</span></p>
                    <p className="text-emerald-400 font-semibold pt-1">Efficiency Delta: {item.impactReduction}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar name="Legacy First-Come-First-Served (Hours)" dataKey="fcfsWaitHours" fill="#64748b" radius={[4, 4, 0, 0]} />
          <Bar name="CampusMI AI Priority Queue (Hours)" dataKey="aiWaitHours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
