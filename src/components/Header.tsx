/**
 * EQUATION 1 — Top Navigation Bar
 * Follows strict 3-zone contract: Brand wordmark — Nav links — Primary action.
 */

import React from 'react';
import { Atom, RotateCcw, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  onResetAll: () => void;
  onOpenAssumptions: () => void;
  onOpenPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetAll,
  onOpenAssumptions,
  onOpenPresets,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090d16] border-b border-slate-800/80 sticky top-0 z-30 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Atom className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-wider text-white">
            EQUATION <span className="text-cyan-400">1</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Physics Laboratory
          </span>
        </div>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-400">
        <span className="text-cyan-400 font-semibold cursor-default">
          Projectile Motion
        </span>
        <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
          Mechanics
        </span>
        <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
          Vector Fields
        </span>
        <button
          onClick={onOpenAssumptions}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Model Assumptions</span>
        </button>
      </nav>

      {/* Zone 3: Primary action cluster */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Browse preset physics scenarios"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Presets</span>
        </button>

        <button
          onClick={onResetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Reset all parameters and simulation to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Lab</span>
        </button>
      </div>
    </header>
  );
};
