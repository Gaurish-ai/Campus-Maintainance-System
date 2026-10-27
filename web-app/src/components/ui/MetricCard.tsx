import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: LucideIcon;
  colorScheme?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{value}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900 pt-2">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {trend.value} {trend.label && <span className="text-zinc-500 font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
