import React from 'react';
import { PriorityLevel } from '@/lib/types';

interface PriorityBadgeProps {
  priority: PriorityLevel | number;
  showExplanation?: boolean;
  explanationText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ 
  priority, 
  size = 'md' 
}: PriorityBadgeProps) {
  const pLevel = Math.max(1, Math.min(5, Number(priority))) as PriorityLevel;

  const config = {
    5: { code: 'P5', label: 'Critical', bg: 'bg-red-950/80 border-red-800 text-red-400' },
    4: { code: 'P4', label: 'High', bg: 'bg-orange-950/80 border-orange-800 text-orange-400' },
    3: { code: 'P3', label: 'Medium', bg: 'bg-yellow-950/80 border-yellow-800 text-yellow-400' },
    2: { code: 'P2', label: 'Low', bg: 'bg-blue-950/80 border-blue-800 text-blue-400' },
    1: { code: 'P1', label: 'Routine', bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-400' }
  }[pLevel];

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-mono font-medium ${config.bg} ${sizeClasses}`}>
      <span className="font-bold">{config.code}</span>
      <span className="font-sans text-[11px]">{config.label}</span>
    </span>
  );
}
