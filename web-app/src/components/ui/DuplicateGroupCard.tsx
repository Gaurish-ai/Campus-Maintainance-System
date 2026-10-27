import React from 'react';
import { Incident, Complaint } from '@/lib/types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Layers, Users, MapPin, Clock, ArrowRight, CheckCircle, Split, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface DuplicateGroupCardProps {
  incident: Incident;
  linkedComplaints: Complaint[];
  onUnlink?: (complaintId: string) => void;
  onConfirmCluster?: (incidentId: string) => void;
}

export function DuplicateGroupCard({ 
  incident, 
  linkedComplaints, 
  onUnlink, 
  onConfirmCluster 
}: DuplicateGroupCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md shadow-card transition-all hover:border-slate-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                {incident.incident_id}
              </span>
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} size="sm" />
              <span className="text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-400" />
                {linkedComplaints.length} Probable Duplicate Reports
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-1.5">{incident.title}</h3>
          </div>
        </div>

        <Link
          href={`/incidents/${incident.incident_id}`}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
        >
          <span>Inspect Incident</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Meta context */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs text-slate-400 border-b border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{incident.location_id} {incident.room_or_area || ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{incident.affected_people_total} People Affected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{incident.created_at.substring(0, 16)}</span>
        </div>
        <div className="text-right sm:text-left">
          <span className="text-emerald-400 font-medium">1 Unified Work Order Flow</span>
        </div>
      </div>

      {/* Grouped complaints stream */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <span>Clustered Natural Language Complaints:</span>
          <span className="text-[11px] text-slate-500">Human-in-the-Loop Verified</span>
        </div>

        {linkedComplaints.map((comp) => (
          <div
            key={comp.report_id}
            className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-sky-400 font-semibold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                  {comp.report_id}
                </span>
                <span className="text-[11px] text-slate-400">
                  by <strong className="text-slate-300">{comp.reported_by}</strong> ({comp.reported_at.substring(11, 16)})
                </span>
                {comp.duplicate_confidence && (
                  <span className="text-[10px] text-purple-300 bg-purple-900/40 border border-purple-700/40 px-1.5 py-0.2 rounded font-mono">
                    {Math.round(comp.duplicate_confidence * 100)}% match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate sm:whitespace-normal">{comp.description}</p>
            </div>

            <Link
              href={`/complaints/${comp.report_id}`}
              className="text-[11px] text-brand-400 hover:text-brand-300 shrink-0 font-medium px-2 py-1 rounded bg-brand-950/50 hover:bg-brand-900/40 border border-brand-800/40"
            >
              View Ticket
            </Link>
          </div>
        ))}
      </div>

      {/* Review actions banner */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dispatches a single repair team for {linkedComplaints.length} incoming reports</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Work Order: {incident.work_order_id || 'Not Yet Dispatched'}
        </span>
      </div>
    </div>
  );
}
