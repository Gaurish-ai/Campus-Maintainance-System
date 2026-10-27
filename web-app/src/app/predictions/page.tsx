"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Asset } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { MapPin, History, Zap, ShieldAlert } from 'lucide-react';

export default function PredictionsPage() {
  const { currentUser, assets, triggerAssetInspection } = useApp();
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<Asset | null>(null);
  const [selectedAssetForInspect, setSelectedAssetForInspect] = useState<Asset | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState('');

  const isAuthorized = currentUser.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted to Admin</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Predictive failure modeling, MTBF statistics, and asset degradation scores are restricted to administrators only.
        </p>
      </div>
    );
  }

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForInspect) return;
    triggerAssetInspection(selectedAssetForInspect.asset_id, inspectionNotes);
    setSelectedAssetForInspect(null);
    setInspectionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Predictive Maintenance & Asset Health
            </h1>
            <span className="text-[10px] font-mono font-bold bg-zinc-800 text-amber-400 px-2 py-0.5 rounded border border-zinc-700">
              DEMO MODEL
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Component risk scoring and mean-time-between-failures (MTBF) tracking
          </p>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => {
          const isHighRisk = asset.risk_probability >= 80;
          return (
            <div
              key={asset.asset_id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-400">{asset.asset_id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isHighRisk 
                        ? 'bg-red-950 text-red-400 border-red-800' 
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {asset.risk_probability}% Risk
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{asset.component_name}</h3>
                </div>

                <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {asset.system_id}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${asset.risk_probability}%` }}
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-900 pt-2">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Location</span>
                  <span className="text-zinc-200 font-medium">{asset.building_id}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Days Since Last Repair</span>
                  <span className="text-zinc-200 font-mono">{asset.days_since_last_repair} days</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Past Failures</span>
                  <span className="text-zinc-200 font-mono">{asset.previous_failures_count}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Avg Repair Cost</span>
                  <span className="text-emerald-400 font-mono">₹{asset.average_repair_cost.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForHistory(asset)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  <span>History</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAssetForInspect(asset)}
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold transition flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Recommend Inspection</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedAssetForHistory && (
        <Modal
          isOpen={!!selectedAssetForHistory}
          onClose={() => setSelectedAssetForHistory(null)}
          title={`Log: ${selectedAssetForHistory.component_name}`}
          subtitle={`${selectedAssetForHistory.asset_id} • MTBF ${selectedAssetForHistory.mtbf_days} days`}
        >
          <div className="space-y-2 text-xs">
            {selectedAssetForHistory.maintenance_history.map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-zinc-200">{log.action}</p>
                  <p className="text-[11px] text-zinc-500">{log.date} • {log.technician}</p>
                </div>
                <span className="font-mono text-emerald-400 font-bold">₹{log.cost.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Inspect Modal */}
      {selectedAssetForInspect && (
        <Modal
          isOpen={!!selectedAssetForInspect}
          onClose={() => setSelectedAssetForInspect(null)}
          title="Dispatch Inspection Work Order"
          subtitle={selectedAssetForInspect.component_name}
        >
          <form onSubmit={handleInspectSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Diagnostic Notes</label>
              <textarea
                rows={2}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Notes for inspection..."
                className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedAssetForInspect(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold"
              >
                Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
