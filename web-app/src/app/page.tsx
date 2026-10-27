"use client";

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  Building2, 
  ArrowRight, 
  PlusCircle, 
  Layers, 
  Sparkles,
  BarChart3,
  Wrench
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser, setCurrentUserRole, getKPIs } = useApp();
  const kpis = getKPIs();
  const isAdmin = currentUser.role === 'admin';
  const isTechnician = currentUser.role === 'technician';

  const roleProfiles: { role: UserRole; title: string; desc: string; link: string; icon: any }[] = [
    {
      role: 'student',
      title: 'Student / Resident',
      desc: 'Submit maintenance complaints in natural language, chat with AI, and track personal tickets.',
      link: '/report',
      icon: PlusCircle,
    },
    {
      role: 'technician',
      title: 'Field Technician',
      desc: 'Focused workspace: view assigned work orders, update job status, and execute P5/P4 priority repairs.',
      link: '/incidents',
      icon: Wrench,
    },
    {
      role: 'admin',
      title: 'Campus Admin',
      desc: 'Full command center: operational dashboard, predictive asset health, priority queue, and analytics.',
      link: '/dashboard',
      icon: BarChart3,
    }
  ];

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 sm:p-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Campus Maintenance Intelligence Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Campus Facilities & Incident Intelligence
        </h1>

        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Structures free-text maintenance complaints, groups probable duplicates into unified work orders, and assigns contextual priority over First-Come-First-Served ordering.
        </p>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          {isTechnician ? (
            <>
              <Link
                href="/incidents"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <span>My Assigned Work Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/priority"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>Priority Tasks</span>
              </Link>
              <Link
                href="/complaints"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>All Complaints</span>
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <span>Open Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/priority"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>Priority Queue</span>
              </Link>
              <Link
                href="/complaints"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>All Complaints</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/report"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <span>Report a Problem</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/complaints"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>My Complaints</span>
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <span>AI Assistant</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500">Active Complaints</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">{kpis.openComplaints}</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500">Active Incidents</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">{kpis.openIncidents}</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <p className="text-xs font-medium text-red-400">P5 Critical</p>
          <p className="text-2xl font-bold text-red-400 font-mono mt-1">{kpis.p5CriticalCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500">Avg Resolution</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{kpis.avgResolutionTimeHours}h</p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Select Experience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roleProfiles.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.role}
                type="button"
                onClick={() => {
                  setCurrentUserRole(p.role);
                  window.location.href = p.link;
                }}
                className="text-left p-5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-900 text-xs font-semibold text-blue-400 flex items-center justify-between">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
