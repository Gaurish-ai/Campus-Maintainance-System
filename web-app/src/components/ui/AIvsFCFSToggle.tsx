import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

interface AIvsFCFSToggleProps {
  mode: 'AI_PRIORITY' | 'FCFS';
  onChange: (mode: 'AI_PRIORITY' | 'FCFS') => void;
}

export function AIvsFCFSToggle({ mode, onChange }: AIvsFCFSToggleProps) {
  return (
    <div className="inline-flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
      <button
        type="button"
        onClick={() => onChange('AI_PRIORITY')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
          mode === 'AI_PRIORITY'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI Priority (P5→P1)</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('FCFS')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
          mode === 'FCFS'
            ? 'bg-zinc-800 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>First-Come-First-Served</span>
      </button>
    </div>
  );
}
