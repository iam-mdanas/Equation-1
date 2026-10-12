/**
 * EQUATION 1 — Analytical Results & Real-Time Telemetry
 * Clear distinction between fixed analytical quantities and instantaneous simulation states.
 */

import React from 'react';
import {
  AnalyticalResults,
  ProjectileState,
} from '../physics/types';
import { BarChart2, Activity } from 'lucide-react';

interface ResultsPanelProps {
  analytical: AnalyticalResults;
  currentState: ProjectileState;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  analytical,
  currentState,
}) => {
  return (
    <div className="bg-[#0b101b] border border-slate-800/90 rounded-lg p-4 select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Measurements & Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>LIVE ENGINE</span>
        </div>
      </div>

      {/* Grid of primary measurements */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Metric 1: Range */}
        <div className="bg-[#07090e] border border-slate-800/80 rounded p-2.5 space-y-1">
          <div className="text-[11px] font-medium text-slate-400">
            Horizontal Range <span className="font-mono text-slate-400">(R)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {analytical.range.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">m</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            x(T) at impact
          </div>
        </div>

        {/* Metric 2: Max Height */}
        <div className="bg-[#07090e] border border-slate-800/80 rounded p-2.5 space-y-1">
          <div className="text-[11px] font-medium text-slate-400">
            Maximum Height <span className="font-mono text-slate-400">(H)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {analytical.maxHeight.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">m</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            t_apex = {analytical.timeToApex.toFixed(2)}s
          </div>
        </div>

        {/* Metric 3: Time of Flight */}
        <div className="bg-[#07090e] border border-slate-800/80 rounded p-2.5 space-y-1">
          <div className="text-[11px] font-medium text-slate-400">
            Time of Flight <span className="font-mono text-slate-400">(T)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {analytical.timeOfFlight.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">s</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Total flight duration
          </div>
        </div>

        {/* Metric 4: Impact Speed */}
        <div className="bg-[#07090e] border border-slate-800/80 rounded p-2.5 space-y-1">
          <div className="text-[11px] font-medium text-slate-400">
            Impact Speed <span className="font-mono text-slate-400">(v_land)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {analytical.impactSpeed.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">m/s</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            at {analytical.impactAngleDeg.toFixed(1)}° to ground
          </div>
        </div>
      </div>

      {/* Instantaneous Simulation Telemetry Row */}
      <div className="bg-[#07090e] border border-slate-800/90 rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span>Instantaneous Dynamic State</span>
          <span className="font-mono text-cyan-400">
            t = {currentState.time.toFixed(2)}s
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">x position</div>
            <div className="text-white font-semibold tabular-nums">
              {currentState.x.toFixed(2)} <span className="text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">y position</div>
            <div className="text-white font-semibold tabular-nums">
              {currentState.y.toFixed(2)} <span className="text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">vx velocity</div>
            <div className="text-cyan-400 font-semibold tabular-nums">
              {currentState.vx.toFixed(2)} <span className="text-[10px] text-slate-400">m/s</span>
            </div>
          </div>

          <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">vy velocity</div>
            <div className="text-cyan-400 font-semibold tabular-nums">
              {currentState.vy.toFixed(2)} <span className="text-[10px] text-slate-400">m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
