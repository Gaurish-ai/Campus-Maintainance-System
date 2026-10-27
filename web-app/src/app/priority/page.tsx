"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { AIvsFCFSToggle } from '@/components/ui/AIvsFCFSToggle';
import { Search, MapPin, ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PriorityQueuePage() {
  const { triageMode, setTriageMode, getTriageComparison } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const comparisonData = getTriageComparison();

  const filteredItems = comparisonData.filter(item => {
    const matchesSearch = 
      !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesPri = priorityFilter === 'ALL' || item.priority_code === priorityFilter;

    return matchesSearch && matchesCat && matchesPri;
  });

  const displayedItems = [...filteredItems].sort((a, b) => {
    if (triageMode === 'AI_PRIORITY') {
      return a.ai_priority_rank - b.ai_priority_rank;
    } else {
      return a.fcfs_rank - b.fcfs_rank;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Priority Queue & Triage Comparator
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare AI Context Priority against First-Come-First-Served (FCFS)
          </p>
        </div>

        <AIvsFCFSToggle mode={triageMode} onChange={setTriageMode} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problem or location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P5">P5 Critical</option>
            <option value="P4">P4 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P2">P2 Low</option>
            <option value="P1">P1 Routine</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-3.5 w-12">#</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Problem / Incident Title</th>
                <th className="py-3 px-3.5">Location</th>
                <th className="py-3 px-3.5">Time</th>
                <th className="py-3 px-3.5 text-center">FCFS Rank</th>
                <th className="py-3 px-3.5 text-center">AI Rank</th>
                <th className="py-3 px-3.5 text-center">Delta</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {displayedItems.map((item) => {
                const currentRank = triageMode === 'AI_PRIORITY' ? item.ai_priority_rank : item.fcfs_rank;
                const isBoosted = item.rank_delta > 0;
                const isDeescalated = item.rank_delta < 0;

                return (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3 px-3.5 font-mono text-zinc-400 font-semibold">
                      #{currentRank}
                    </td>

                    <td className="py-3 px-3.5">
                      <PriorityBadge priority={item.priority_level} />
                    </td>

                    <td className="py-3 px-3.5 max-w-sm">
                      <Link href={`/incidents/${item.id}`} className="font-semibold text-zinc-100 hover:text-blue-400 block truncate">
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-zinc-500 block truncate">
                        {item.boost_reason}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-zinc-400">
                      {item.reported_at.substring(11, 16)}
                    </td>

                    <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                      #{item.fcfs_rank}
                    </td>

                    <td className="py-3 px-3.5 text-center font-mono font-bold text-blue-400">
                      #{item.ai_priority_rank}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      {isBoosted ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-bold">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>+{item.rank_delta}</span>
                        </span>
                      ) : isDeescalated ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[11px] font-mono">
                          <ArrowDownRight className="w-3 h-3" />
                          <span>{item.rank_delta}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-zinc-600 text-[11px] font-mono">
                          <Minus className="w-3 h-3" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <Link
                        href={`/incidents/${item.id}`}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
