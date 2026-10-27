"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { PriorityLevel } from '@/lib/types';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Wrench, 
  Layers, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function IncidentDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const incidentId = decodeURIComponent(rawId).replace(/\//g, '-');
  const { 
    incidents, 
    complaints, 
    assignTechnician,
    updateIncidentStatus,
    updateIncidentPriority
  } = useApp();

  const incident = incidents.find(i => 
    i.incident_id === incidentId || 
    i.incident_id === rawId ||
    i.incident_id.replace(/\//g, '-') === incidentId
  );
  const linkedComplaints = complaints.filter(c => incident?.complaint_ids.includes(c.report_id));

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>(incident?.priority || 4);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedTech, setSelectedTech] = useState({ id: 'usr-tech-01', name: 'Ramesh Verma (HVAC Master)' });

  if (!incident) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-10 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Incident Not Found</h2>
        <Link href="/incidents" className="text-xs text-blue-400 hover:underline">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignTechnician(incident.incident_id, selectedTech.id, selectedTech.name);
    setIsAssignModalOpen(false);
  };

  const handlePrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIncidentPriority(incident.incident_id, overridePriority, overrideReason);
    setIsPriorityModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <Link href="/incidents" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
              {incident.incident_id}
            </span>
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPriorityModalOpen(true)}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold"
            >
              Change Priority
            </button>

            {!incident.assigned_technician_name ? (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Assign Tech
              </button>
            ) : (
              incident.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => updateIncidentStatus(incident.incident_id, 'RESOLVED')}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              )
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-white pt-1">{incident.title}</h1>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Incident Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Category</span>
              <span className="text-zinc-200 font-medium">{incident.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Location</span>
              <span className="text-zinc-200 font-medium">{incident.location_id} {incident.room_or_area}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Affected People</span>
              <span className="text-zinc-200 font-mono">{incident.affected_people_total}</span>
            </div>
            <div className="py-1">
              <span className="text-zinc-500 block mb-0.5">Priority Explanation:</span>
              <p className="text-zinc-300 leading-relaxed">{incident.priority_reason}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Work Order & Dispatch</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Work Order ID</span>
              <span className="font-mono text-blue-400">{incident.work_order_id || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Technician</span>
              <span className="text-zinc-200 font-medium">{incident.assigned_technician_name || 'None Assigned'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Recurrence Risk</span>
              <span className="font-mono text-amber-400">{incident.predicted_recurrence_risk || 70}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clustered Complaints */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Clustered Duplicate Complaints ({linkedComplaints.length})</span>
        </h3>

        <div className="space-y-2">
          {linkedComplaints.map(c => (
            <div key={c.report_id} className="p-3 rounded-lg bg-zinc-900 border border-zinc-850 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-blue-400 font-bold">{c.report_id}</span>
                <span className="text-[11px] text-zinc-500">{c.reported_by} • {c.reported_at}</span>
              </div>
              <p className="text-xs text-zinc-300">{c.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Technician"
        subtitle={incident.title}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
          <div className="space-y-1.5">
            {[
              { id: 'usr-tech-01', name: 'Ramesh Verma (HVAC Master)', role: 'HVAC Specialist' },
              { id: 'usr-tech-02', name: 'Anil Sharma (Senior Electrician)', role: 'Electrical Substation' },
              { id: 'usr-tech-03', name: 'Mohinder Singh (Plumbing Lead)', role: 'Water Systems' },
              { id: 'usr-tech-05', name: 'Baljit Singh (Master Carpenter)', role: 'Doors & Locks' }
            ].map(tech => (
              <button
                key={tech.id}
                type="button"
                onClick={() => setSelectedTech(tech)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  selectedTech.id === tech.id
                    ? 'bg-blue-950/60 border-blue-600 text-white font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <p>{tech.name}</p>
                <p className="text-[10px] text-zinc-500">{tech.role}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Confirm
            </button>
          </div>
        </form>
      </Modal>

      {/* Priority Override Modal */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Override Incident Priority"
        subtitle={incident.incident_id}
      >
        <form onSubmit={handlePrioritySubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Select Priority</label>
            <div className="grid grid-cols-5 gap-1.5">
              {([5, 4, 3, 2, 1] as PriorityLevel[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOverridePriority(p)}
                  className={`p-2 rounded text-xs font-bold border transition ${
                    overridePriority === p
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Reason <span className="text-red-400">*</span></label>
            <textarea
              required
              rows={2}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Schedule priority elevated."
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsPriorityModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
