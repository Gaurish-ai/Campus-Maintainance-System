"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Layers, Search, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function IncidentsPage() {
  const { incidents, complaints } = useApp();
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      !search || 
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.incident_id.toLowerCase().includes(search.toLowerCase()) ||
      inc.location_id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = filterCategory === 'ALL' || inc.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Incidents & Duplicate Clusters
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Grouped duplicate reports merged into single work orders
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident ID or location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500 outline-none"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Electricity">Electricity</option>
          <option value="Plumbing">Plumbing</option>
          <option value="HVAC/AC">HVAC/AC</option>
          <option value="Masonry">Masonry</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Housekeeping">Housekeeping</option>
          <option value="Fire System">Fire System</option>
          <option value="General Facilities">General Facilities</option>
        </select>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const linked = complaints.filter(c => incident.complaint_ids.includes(c.report_id));
          return (
            <div
              key={incident.incident_id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    {incident.incident_id}
                  </span>
                  <PriorityBadge priority={incident.priority} />
                  <StatusBadge status={incident.status} size="sm" />
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {linked.length} reports ({incident.affected_people_total} people)
                  </span>
                </div>

                <Link
                  href={`/incidents/${incident.incident_id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Manage Incident</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">{incident.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{incident.priority_reason}</p>
              </div>

              {/* Linked reports */}
              <div className="space-y-1.5 pt-1">
                {linked.map(comp => (
                  <div key={comp.report_id} className="p-2 rounded bg-zinc-900 text-xs text-zinc-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-zinc-500 font-semibold">{comp.report_id}:</span>
                      <span className="truncate">{comp.description}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0 ml-2">{comp.reported_by}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
