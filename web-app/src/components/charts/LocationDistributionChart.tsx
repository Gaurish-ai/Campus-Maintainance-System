"use client";

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useApp } from '@/lib/store';
import { LocationType } from '@/lib/types';

export function LocationDistributionChart() {
  const { complaints } = useApp();

  const locationTypes: LocationType[] = [
    'Hostel',
    'Block',
    'Lecture Theatre',
    'CSED',
    'Library'
  ];

  const colors: Record<LocationType, string> = {
    'Hostel': '#3b82f6',
    'Block': '#10b981',
    'Lecture Theatre': '#f97316',
    'CSED': '#8b5cf6',
    'Library': '#06b6d4'
  };

  const data = locationTypes.map(loc => {
    const count = complaints.filter(c => c.location_type === loc).length;
    return {
      name: loc,
      value: count,
      color: colors[loc]
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-white mb-0.5">{item.name}</p>
                    <p className="text-slate-300">Complaints: <span className="font-mono font-bold text-brand-400">{item.value}</span></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-xs text-slate-300 font-medium px-1">
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
