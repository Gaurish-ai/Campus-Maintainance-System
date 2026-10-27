"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MaintenanceCategory, LocationType } from '@/lib/types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Layers, 
  ArrowRight, 
  PlusCircle,
  Trash2,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ComplaintsListContent() {
  const { complaints, currentUser, deleteComplaint } = useApp();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [myOnly, setMyOnly] = useState<boolean>(currentUser.role === 'student');

  React.useEffect(() => {
    setMyOnly(currentUser.role === 'student');
  }, [currentUser.role]);

  const categories: MaintenanceCategory[] = [
    'Electricity',
    'Plumbing',
    'HVAC/AC',
    'IT/Network',
    'Masonry',
    'Carpentry',
    'Housekeeping',
    'Paint',
    'Fire System',
    'Welder',
    'General Facilities'
  ];

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((comp) => {
        const matchesSearch = 
          !search ||
          comp.description.toLowerCase().includes(search.toLowerCase()) ||
          comp.report_id.toLowerCase().includes(search.toLowerCase()) ||
          comp.location_id.toLowerCase().includes(search.toLowerCase()) ||
          (comp.room_or_area && comp.room_or_area.toLowerCase().includes(search.toLowerCase())) ||
          comp.problem_type.toLowerCase().includes(search.toLowerCase());

        const matchesCat = selectedCategory === 'ALL' || comp.category === selectedCategory;
        const matchesLoc = selectedLocation === 'ALL' || comp.location_type === selectedLocation;
        const matchesStatus = selectedStatus === 'ALL' || comp.status === selectedStatus;
        const matchesMy = !myOnly || currentUser.role !== 'student' || (comp.reported_by?.toLowerCase() === 'student');

        return matchesSearch && matchesCat && matchesLoc && matchesStatus && matchesMy;
      })
      .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  }, [complaints, search, selectedCategory, selectedLocation, selectedStatus, myOnly, currentUser.role]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">Complaints Registry</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">All Student & Staff Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Maintenance Complaints
          </h1>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md shadow-card space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, ticket ID (e.g. R03546), room..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:border-brand-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:border-brand-500 transition"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Location Type */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:border-brand-500 transition"
            >
              <option value="ALL">All Campus Zones</option>
              <option value="Hostel">Hostels</option>
              <option value="Block">Academic Blocks</option>
              <option value="Lecture Theatre">Lecture Theatres</option>
              <option value="CSED">CSED & Labs</option>
              <option value="Library">Library</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:border-brand-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {currentUser.role === 'student' && (
              <button
                type="button"
                onClick={() => setMyOnly(!myOnly)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                  myOnly
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{myOnly ? 'My Complaints' : 'All Complaints'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span>Showing <strong className="text-white">{filteredComplaints.length}</strong> complaints</span>
          <span className="text-[11px]">Click ticket to view full AI structure, edit or delete</span>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
            <Filter className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No complaints matching your filters</p>
            <p className="text-xs text-slate-500">Try adjusting search keywords or category filters.</p>
          </div>
        ) : (
          filteredComplaints.map((comp) => (
            <Link
              key={comp.report_id}
              href={`/complaints/${comp.report_id}`}
              className="block rounded-xl border border-slate-800/90 bg-slate-900/70 hover:bg-slate-850 hover:border-slate-700 p-4 transition-all duration-150 backdrop-blur-sm shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                      {comp.report_id}
                    </span>
                    <PriorityBadge priority={comp.ground_truth_priority} />
                    <StatusBadge status={comp.status} size="sm" />
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {comp.category}
                    </span>
                    {comp.is_duplicate_of && (
                      <span className="text-[10px] text-purple-300 bg-purple-900/40 border border-purple-700/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-400" />
                        Clustered
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-brand-300 transition line-clamp-1">
                    {comp.problem_type}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {comp.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 text-xs text-slate-400 gap-2 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{comp.location_id} {comp.room_or_area || ''}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{comp.reported_at.substring(0, 16)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(currentUser.role === 'student' || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm(`Delete complaint ${comp.report_id}?`)) {
                            deleteComplaint(comp.report_id);
                          }
                        }}
                        title="Delete complaint"
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function ComplaintsListPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading complaints registry...
      </div>
    }>
      <ComplaintsListContent />
    </Suspense>
  );
}
