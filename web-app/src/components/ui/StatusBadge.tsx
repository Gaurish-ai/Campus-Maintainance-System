import React from 'react';
import { ComplaintStatus, IncidentStatus, WorkOrderStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ComplaintStatus | IncidentStatus | WorkOrderStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let config = {
    label: norm.replace('_', ' '),
    bg: 'bg-zinc-900 text-zinc-300 border-zinc-700',
  };

  switch (norm) {
    case 'REGISTERED':
    case 'OPEN':
      config = {
        label: norm === 'REGISTERED' ? 'Registered' : 'Open',
        bg: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
      };
      break;
    case 'REVIEWED':
    case 'TRIAGED':
      config = {
        label: norm === 'REVIEWED' ? 'Reviewed' : 'Triaged',
        bg: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
      };
      break;
    case 'ASSIGNED':
      config = {
        label: 'Assigned',
        bg: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
      };
      break;
    case 'IN_PROGRESS':
      config = {
        label: 'In Progress',
        bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60',
      };
      break;
    case 'COMPLETED':
    case 'RESOLVED':
      config = {
        label: norm === 'RESOLVED' ? 'Resolved' : 'Completed',
        bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
      };
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center rounded border font-medium ${config.bg} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
