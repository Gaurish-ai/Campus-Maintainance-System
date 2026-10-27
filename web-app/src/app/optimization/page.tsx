"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Sparkles, Sliders, ShieldAlert } from 'lucide-react';

export default function OptimizationPage() {
  const { 
    currentUser,
    optimizationItems, 
    constraints, 
    updateOptimizationConstraints, 
    toggleOptimizationPlanItem, 
    generateOptimizationPlan 
  } = useApp();

  const isAuthorized = currentUser.role === 'admin';

  const [budgetSlider, setBudgetSlider] = useState(constraints.total_budget);
  const [hoursSlider, setHoursSlider] = useState(constraints.available_labor_hours);
  const [techsSlider, setTechsSlider] = useState(constraints.available_technicians);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted to Admin</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The Preventive Budget & Resource Optimization simulator is reserved for administrators only.
        </p>
      </div>
    );
  }

  const selectedItems = optimizationItems.filter(i => i.selected_for_plan);
  const totalAllocatedCost = selectedItems.reduce((acc, i) => acc + i.estimated_cost, 0);
  const totalCostAvoidance = selectedItems.reduce((acc, i) => acc + i.expected_cost_avoidance, 0);

  const handleApplyConstraints = (e: React.FormEvent) => {
    e.preventDefault();
    updateOptimizationConstraints({
      total_budget: budgetSlider,
      available_labor_hours: hoursSlider,
      available_technicians: techsSlider
    });
    generateOptimizationPlan();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Resource & Budget Optimizer
            </h1>
            <span className="text-[10px] font-mono font-bold bg-zinc-800 text-emerald-400 px-2 py-0.5 rounded border border-zinc-700">
              DECISION SUPPORT
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optimize preventive maintenance schedules under budget & technician limits
          </p>
        </div>

        <button
          type="button"
          onClick={() => generateOptimizationPlan()}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Plan</span>
        </button>
      </div>

      {/* Constraints & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Constraints */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Constraints</span>
          </h3>

          <form onSubmit={handleApplyConstraints} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Budget:</span>
                <span className="font-mono font-bold text-emerald-400">₹{budgetSlider.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={150000}
                step={5000}
                value={budgetSlider}
                onChange={(e) => setBudgetSlider(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Labor Hours:</span>
                <span className="font-mono font-bold text-blue-400">{hoursSlider}h</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={hoursSlider}
                onChange={(e) => setHoursSlider(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Technicians:</span>
                <span className="font-mono font-bold text-purple-400">{techsSlider}</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={techsSlider}
                onChange={(e) => setTechsSlider(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded accent-purple-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-800 transition"
            >
              Apply & Re-Calculate
            </button>
          </form>

          {/* Allocation summary */}
          <div className="p-3 rounded-lg bg-zinc-900 text-xs space-y-1 text-zinc-400">
            <div className="flex justify-between">
              <span>Allocated:</span>
              <span className="font-mono text-white font-bold">₹{totalAllocatedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost Avoidance:</span>
              <span className="font-mono text-emerald-400 font-bold">₹{totalCostAvoidance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Plan Items */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 text-xs font-bold text-zinc-300">
              Recommended Interventions
            </div>

            <div className="divide-y divide-zinc-900">
              {optimizationItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-center justify-between gap-3 text-xs ${
                    item.selected_for_plan ? 'bg-zinc-900/40' : 'opacity-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{item.asset_name}</span>
                      <span className="text-zinc-500 text-[11px]">({item.location})</span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                        ROI: {item.roi_ratio}x
                      </span>
                    </div>
                    <p className="text-zinc-400 truncate">{item.recommended_action}</p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                      <span>₹{item.estimated_cost.toLocaleString()}</span>
                      <span>{item.required_hours}h</span>
                      <span>Risk: {item.risk_score}%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleOptimizationPlanItem(item.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition shrink-0 ${
                      item.selected_for_plan
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.selected_for_plan ? 'Included' : 'Exclude'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
