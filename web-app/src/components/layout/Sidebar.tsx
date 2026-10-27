"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  PieChart, 
  Sparkles, 
  Building2, 
  Layers,
  Activity,
  Cpu,
  Wrench
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  critical?: boolean;
  demoBadge?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, getKPIs } = useApp();
  const kpis = getKPIs();

  const isAdmin = currentUser.role === 'admin';
  const isTechnician = currentUser.role === 'technician';

  const userNavItems: NavItem[] = [
    { name: 'Report Problem', href: '/report', icon: PlusCircle },
    { name: 'My Complaints', href: '/complaints', icon: ListFilter, count: kpis.openComplaints },
    { name: 'AI Chatbot (Gemini)', href: '/chat', icon: Sparkles },
  ];

  const technicianNavItems: NavItem[] = [
    { name: 'Assigned Work Orders', href: '/incidents', icon: Layers, count: kpis.openIncidents },
    { name: 'Priority Tasks', href: '/priority', icon: Wrench, count: kpis.p5CriticalCount, critical: true },
    { name: 'All Complaints', href: '/complaints', icon: ListFilter },
  ];

  const adminNavItems: NavItem[] = [
    { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Priority Queue', href: '/priority', icon: Sparkles, count: kpis.p5CriticalCount, critical: true },
    { name: 'Incidents', href: '/incidents', icon: Layers, count: kpis.openIncidents },
    { name: 'All Complaints', href: '/complaints', icon: ListFilter },
    { name: 'Predictive Health', href: '/predictions', icon: Activity, demoBadge: true },
    { name: 'Optimizer', href: '/optimization', icon: Cpu, demoBadge: true },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
    { name: 'AI Chatbot (Gemini)', href: '/chat', icon: Sparkles },
  ];

  let navItems = userNavItems;
  if (isAdmin) {
    navItems = adminNavItems;
  } else if (isTechnician) {
    navItems = technicianNavItems;
  }

  return (
    <aside className="w-60 bg-black border-r border-zinc-800/80 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-zinc-800/80 px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">CampusMI</span>
            <p className="text-[10px] text-zinc-400">Facilities Intel</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.critical && (item.count || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                    {item.count} P5
                  </span>
                )}
                {!item.critical && item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                    {item.count}
                  </span>
                )}
                {item.demoBadge && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-zinc-800 text-amber-400 border border-zinc-700">
                    DEMO
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Submit button - hidden for technicians */}
      {!isTechnician && (
        <div className="p-3 border-t border-zinc-800">
          <Link
            href="/report"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Problem</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
