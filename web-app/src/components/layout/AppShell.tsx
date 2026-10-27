"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith('/chat');

  if (isChatRoute) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <Topbar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

