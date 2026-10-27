import React from 'react';
import { ComplaintStatus } from '@/lib/types';
import { Check, Clock, Wrench, Eye, CheckCircle2 } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
  history?: {
    status: ComplaintStatus;
    timestamp?: string;
    note?: string;
  }[];
  compact?: boolean;
}

const STAGES: { status: ComplaintStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'REGISTERED', label: 'Registered', icon: Clock },
  { status: 'REVIEWED', label: 'Reviewed', icon: Eye },
  { status: 'ASSIGNED', label: 'Assigned', icon: Wrench },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle2 }
];

export function StatusTimeline({ currentStatus, history = [], compact = false }: StatusTimelineProps) {
  const currentIdx = STAGES.findIndex(s => s.status === currentStatus);
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STAGES.map((stage, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <React.Fragment key={stage.status}>
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-brand-400 ring-2 ring-brand-400/30'
                    : isDone
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
                title={`${stage.label} ${isDone ? '(Completed)' : '(Pending)'}`}
              />
              {idx < STAGES.length - 1 && (
                <div
                  className={`w-3 h-0.5 ${
                    idx < activeIndex ? 'bg-emerald-500/60' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-brand-500 transition-all duration-500 -z-0"
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-600 border-brand-400 text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/20 animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <span
                className={`text-xs mt-2 font-medium tracking-wide ${
                  isCurrent ? 'text-brand-300 font-semibold' : isDone ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
