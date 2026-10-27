"use client";

import React from 'react';
import { useApp } from '@/lib/store';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { LocationDistributionChart } from '@/components/charts/LocationDistributionChart';
import { TriageComparisonChart } from '@/components/charts/TriageComparisonChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { Clock, Layers, DollarSign, ShieldAlert } from 'lucide-react';

export default function AnalyticsPage() {
  const { currentUser, getKPIs } = useApp();
  const kpis = getKPIs();
  const isAuthorized = currentUser.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted to Admin</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Executive performance metrics and institutional triage analytics are reserved for administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Performance & Triage Analytics
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Operational metrics and AI vs FIFO triage benchmarking
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <MetricCard
          title="Triage Velocity"
          value="1.1 hrs"
          subtitle="92% faster vs FIFO"
          icon={Clock}
        />
        <MetricCard
          title="De-duplication Rate"
          value={`${Math.round((kpis.duplicatesDetectedCount / (kpis.openComplaints || 1)) * 100)}%`}
          subtitle="Redundancy avoided"
          icon={Layers}
        />
        <MetricCard
          title="Cost Avoided"
          value={`₹${(kpis.costAvoidanceEstimated / 1000).toFixed(0)}k`}
          subtitle="Via predictive model"
          icon={DollarSign}
        />
        <MetricCard
          title="Critical Coverage"
          value="100%"
          subtitle="Zero hazard starvation"
          icon={ShieldAlert}
        />
      </div>

      {/* Triage Efficiency Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-white">FCFS vs AI Priority Wait Times</h3>
          <p className="text-xs text-zinc-400">Hours elapsed before dispatch across priority tiers</p>
        </div>
        <TriageComparisonChart />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Category Distribution</h3>
          <CategoryBarChart />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Campus Location Hotspots</h3>
          <LocationDistributionChart />
        </div>
      </div>
    </div>
  );
}
