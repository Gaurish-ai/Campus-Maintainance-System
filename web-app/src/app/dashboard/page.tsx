"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MetricCard } from '@/components/ui/MetricCard';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AIvsFCFSToggle } from '@/components/ui/AIvsFCFSToggle';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { LocationDistributionChart } from '@/components/charts/LocationDistributionChart';
import { Modal } from '@/components/ui/Modal';
import { 
  AlertOctagon, 
  Flame, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Users,
  Wrench,
  ShieldAlert,
  Lock,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { 
    currentUser,
    incidents, 
    complaints, 
    getKPIs, 
    triageMode, 
    setTriageMode,
    assignTechnician
  } = useApp();

  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<{ id: string; name: string }>({
    id: 'usr-tech-01',
    name: 'Ramesh Verma (HVAC Master)'
  });

  const isAuthorized = currentUser.role === 'admin';

  if (!isAuthorized) {
    const isTech = currentUser.role === 'technician';
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Current Role: {currentUser.name} ({currentUser.role.toUpperCase()})</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Access Restricted to Admin
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
              {isTech
                ? 'The Facilities Admin Dashboard is reserved for administrative planning and budget controls. As a field technician, your active work is managed in the Assigned Work Orders and Priority Tasks queues.'
                : 'The Facilities Operations Dashboard contains technician dispatch schedules, SLA response metrics, and emergency P5 queue management. This interface is restricted to System Administrators.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-left space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
              {isTech ? 'Technician Workspace' : 'Available User Actions'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {isTech ? (
                <>
                  <Link
                    href="/incidents"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Assigned Work Orders</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </Link>

                  <Link
                    href="/priority"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Priority Tasks</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/report"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white transition group"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-blue-400" />
                      <span>Report Maintenance Problem</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </Link>

                  <Link
                    href="/complaints"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Track My Complaints</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <p className="text-[11px] text-zinc-500">
            Need administrative access for demonstration? Switch to <span className="text-zinc-300 font-medium">Admin</span> using the role switcher at the top right.
          </p>
        </div>
      </div>
    );
  }

  const kpis = getKPIs();

  // Sort preview incidents based on triage mode
  const sortedIncidents = [...incidents].sort((a, b) => {
    if (triageMode === 'AI_PRIORITY') {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.affected_people_total !== a.affected_people_total) return b.affected_people_total - a.affected_people_total;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });

  const activeTechnicians = [
    { id: 'usr-tech-01', name: 'Ramesh Verma (HVAC Master)', role: 'HVAC Specialist' },
    { id: 'usr-tech-02', name: 'Anil Sharma (Senior Electrician)', role: 'High Voltage & Panels' },
    { id: 'usr-tech-03', name: 'Mohinder Singh (Plumbing Lead)', role: 'Piping & Pumps' },
    { id: 'usr-tech-05', name: 'Baljit Singh (Master Carpenter)', role: 'Doors & Locks' }
  ];

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForAssign) return;
    assignTechnician(selectedIncidentForAssign, selectedTech.id, selectedTech.name);
    setSelectedIncidentForAssign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Facilities Overview Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operational triage queue, active incidents, and distribution
          </p>
        </div>

        <AIvsFCFSToggle mode={triageMode} onChange={setTriageMode} />
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Open Complaints"
          value={kpis.openComplaints}
          subtitle={`${kpis.duplicatesDetectedCount} de-duplicated`}
          icon={Layers}
        />
        <MetricCard
          title="Active Incidents"
          value={kpis.openIncidents}
          subtitle="Work orders"
          icon={Wrench}
        />
        <MetricCard
          title="Critical (P5)"
          value={kpis.p5CriticalCount}
          subtitle="Immediate hazard"
          icon={Flame}
          badge="Urgent"
        />
        <MetricCard
          title="High (P4)"
          value={kpis.p4HighCount}
          subtitle="Disruption risk"
          icon={AlertOctagon}
        />
        <MetricCard
          title="Avg Resolution"
          value={`${kpis.avgResolutionTimeHours}h`}
          subtitle="92% faster vs FIFO"
          icon={Clock}
        />
      </div>

      {/* Priority Queue Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Active Priority Queue</h2>
            <span className="text-[11px] text-zinc-400 font-mono">
              ({triageMode === 'AI_PRIORITY' ? 'Sorted by Context Priority' : 'Sorted by Arrival Time'})
            </span>
          </div>

          <Link
            href="/priority"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3.5 w-12">#</th>
                <th className="py-2.5 px-3.5">Priority</th>
                <th className="py-2.5 px-3.5">Problem / Title</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Location</th>
                <th className="py-2.5 px-3.5">Reports</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {sortedIncidents.slice(0, 6).map((inc, index) => (
                <tr key={inc.incident_id} className="hover:bg-zinc-900/50 transition">
                  <td className="py-2.5 px-3.5 font-mono text-zinc-500">#{index + 1}</td>
                  <td className="py-2.5 px-3.5">
                    <PriorityBadge priority={inc.priority} />
                  </td>
                  <td className="py-2.5 px-3.5 max-w-xs">
                    <Link href={`/incidents/${inc.incident_id}`} className="font-semibold text-zinc-100 hover:text-blue-400 block truncate">
                      {inc.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3.5 text-zinc-400">{inc.category}</td>
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      <span>{inc.location_id} {inc.room_or_area || ''}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="font-mono text-zinc-400">
                      {inc.complaints_count} ({inc.affected_people_total}p)
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    {inc.assigned_technician_name ? (
                      <span className="text-zinc-400 font-medium text-[11px]">
                        {inc.assigned_technician_name.split(' ')[0]}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedIncidentForAssign(inc.incident_id)}
                        className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Registered Complaints Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white">Live Registered Complaints</h2>
            <span className="text-[11px] text-zinc-400">
              (Latest Submissions from Students & Campus in Real-Time)
            </span>
          </div>

          <Link
            href="/complaints"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3.5">Ticket ID</th>
                <th className="py-2.5 px-3.5">Priority</th>
                <th className="py-2.5 px-3.5">Problem / Title</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Location</th>
                <th className="py-2.5 px-3.5">Reported By</th>
                <th className="py-2.5 px-3.5">Time</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {[...complaints]
                .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
                .slice(0, 6)
                .map((comp) => (
                  <tr key={comp.report_id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-400">
                      {comp.report_id}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <PriorityBadge priority={comp.ground_truth_priority} />
                    </td>
                    <td className="py-2.5 px-3.5 max-w-xs">
                      <Link href={`/complaints/${comp.report_id}`} className="font-semibold text-zinc-100 hover:text-blue-400 block truncate">
                        {comp.problem_type}
                      </Link>
                      <p className="text-[11px] text-zinc-500 truncate">{comp.description}</p>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {comp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{comp.location_id} {comp.room_or_area || ''}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-400">
                      {comp.reported_by}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-500 font-mono text-[11px]">
                      {comp.reported_at?.substring(0, 16) || 'Just now'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <StatusBadge status={comp.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <Link
                        href={`/complaints/${comp.report_id}`}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-blue-400 text-[11px] font-semibold transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Category Distribution</h3>
          <CategoryBarChart />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Location Distribution</h3>
          <LocationDistributionChart />
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={!!selectedIncidentForAssign}
        onClose={() => setSelectedIncidentForAssign(null)}
        title="Assign Technician"
        subtitle={`Incident: ${selectedIncidentForAssign}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
          <div className="space-y-1.5">
            {activeTechnicians.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => setSelectedTech({ id: tech.id, name: tech.name })}
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
              onClick={() => setSelectedIncidentForAssign(null)}
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
    </div>
  );
}
