"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Search, ChevronDown, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const router = useRouter();
  const { currentUser, setCurrentUserRole, getKPIs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const kpis = getKPIs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const roles: { role: UserRole; title: string }[] = [
    { role: 'student', title: 'Student' },
    { role: 'technician', title: 'Technician' },
    { role: 'admin', title: 'Admin' }
  ];

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-black px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-sm w-full">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, rooms (e.g. 'Hostel H 214')..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-xs text-zinc-100 placeholder-zinc-500 transition outline-none"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-zinc-300 font-medium">{kpis.p5CriticalCount} Critical P5</span>
        </div>

        {/* Role Switcher dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs transition"
          >
            <span className="font-semibold text-zinc-200">{currentUser.name}</span>
            <span className="text-[10px] text-blue-400 uppercase font-mono">({currentUser.role})</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl p-1 z-50">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-500">
                Switch Role
              </div>
              {roles.map((r) => {
                const isSelected = currentUser.role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setCurrentUserRole(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{r.title}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
