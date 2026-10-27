"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useApp } from '@/lib/store';
import { MaintenanceCategory } from '@/lib/types';

export function CategoryBarChart() {
  const { complaints, incidents } = useApp();

  const categories: MaintenanceCategory[] = [
    'Electricity',
    'Plumbing',
    'HVAC/AC',
    'Masonry',
    'Carpentry',
    'Housekeeping',
    'Paint',
    'Fire System',
    'Welder',
    'General Facilities'
  ];

  const colors = [
    '#3b82f6', // Electricity
    '#06b6d4', // Plumbing
    '#0284c7', // HVAC
    '#eab308', // Mason
    '#f97316', // Carpentry
    '#10b981', // Housekeeping
    '#8b5cf6', // Paint
    '#ef4444', // Fire
    '#ec4899', // Welder
    '#64748b'  // General
  ];

  const data = categories.map((cat, idx) => {
    const compCount = complaints.filter(c => c.category === cat).length;
    const incCount = incidents.filter(i => i.category === cat).length;
    return {
      category: cat.length > 10 ? `${cat.substring(0, 8)}..` : cat,
      fullName: cat,
      complaints: compCount,
      incidents: incCount,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <XAxis 
            dataKey="category" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-white mb-1">{item.fullName}</p>
                    <p className="text-sky-400">Complaints: <span className="font-mono font-bold">{item.complaints}</span></p>
                    <p className="text-purple-400">Active Incidents: <span className="font-mono font-bold">{item.incidents}</span></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="complaints" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
