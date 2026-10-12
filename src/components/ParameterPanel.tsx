/**
 * EQUATION 1 — Physical Parameter Panel
 * High-precision sliders and numeric inputs with scientific boundary checking.
 */

import React from 'react';
import {
  GRAVITY_PRESETS,
} from '../physics/projectileModel';
import {
  ProjectileParameters,
  VectorDisplayOptions,
  ComparisonTrail,
} from '../physics/types';
import { Sliders, Eye, BookmarkPlus, Trash2 } from 'lucide-react';

interface ParameterPanelProps {
  parameters: ProjectileParameters;
  onChangeParameters: (newParams: ProjectileParameters) => void;
  vectorOptions: VectorDisplayOptions;
  onChangeVectorOptions: (newOpts: VectorDisplayOptions) => void;
  onSaveCurrentTrail: () => void;
  comparisonTrails: ComparisonTrail[];
  onClearComparisonTrails: () => void;
  onResetParameters: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  parameters,
  onChangeParameters,
  vectorOptions,
  onChangeVectorOptions,
  onSaveCurrentTrail,
  comparisonTrails,
  onClearComparisonTrails,
  onResetParameters,
}) => {
  const updateParam = (key: keyof ProjectileParameters, rawValue: number) => {
    let val = isNaN(rawValue) ? 0 : rawValue;
    if (key === 'initialSpeed') val = Math.max(0, Math.min(250, val));
    if (key === 'launchAngleDeg') val = Math.max(-30, Math.min(90, val));
    if (key === 'initialHeight') val = Math.max(0, Math.min(500, val));
    if (key === 'gravity') val = Math.max(0.1, Math.min(100, val));

    onChangeParameters({
      ...parameters,
      [key]: val,
    });
  };

  const toggleVectorOpt = (key: keyof VectorDisplayOptions) => {
    onChangeVectorOptions({
      ...vectorOptions,
      [key]: !vectorOptions[key],
    });
  };

  return (
    <div className="bg-[#0b101b] border border-slate-800/90 rounded-lg p-4 select-none space-y-5">
      {/* Panel header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Input Parameters
          </h2>
        </div>
        <button
          onClick={onResetParameters}
          className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          Reset Values
        </button>
      </div>

      {/* Control 1: Initial Speed */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="param-speed" className="text-slate-300 font-medium">
            Initial Velocity <span className="text-slate-400 font-mono">(u)</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              id="param-speed"
              type="number"
              min={0}
              max={150}
              step={0.5}
              value={parameters.initialSpeed}
              onChange={(e) => updateParam('initialSpeed', parseFloat(e.target.value))}
              className="w-16 px-2 py-0.5 bg-[#07090e] border border-slate-700 rounded text-right font-mono text-xs text-white focus:outline-none focus:border-cyan-400 tabular-nums"
            />
            <span className="text-[11px] font-mono text-slate-400 w-7">m/s</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={parameters.initialSpeed}
          onChange={(e) => updateParam('initialSpeed', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0</span>
          <span>50</span>
          <span>100 m/s</span>
        </div>
      </div>

      {/* Control 2: Launch Angle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="param-angle" className="text-slate-300 font-medium">
            Launch Angle <span className="text-slate-400 font-mono">(θ)</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              id="param-angle"
              type="number"
              min={0}
              max={90}
              step={1}
              value={parameters.launchAngleDeg}
              onChange={(e) => updateParam('launchAngleDeg', parseFloat(e.target.value))}
              className="w-16 px-2 py-0.5 bg-[#07090e] border border-slate-700 rounded text-right font-mono text-xs text-white focus:outline-none focus:border-cyan-400 tabular-nums"
            />
            <span className="text-[11px] font-mono text-slate-400 w-7">°</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={1}
          value={parameters.launchAngleDeg}
          onChange={(e) => updateParam('launchAngleDeg', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0°</span>
          <span>45° (optimal)</span>
          <span>90°</span>
        </div>
      </div>

      {/* Control 3: Initial Height */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="param-height" className="text-slate-300 font-medium">
            Initial Height <span className="text-slate-400 font-mono">(h₀)</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              id="param-height"
              type="number"
              min={0}
              max={200}
              step={1}
              value={parameters.initialHeight}
              onChange={(e) => updateParam('initialHeight', parseFloat(e.target.value))}
              className="w-16 px-2 py-0.5 bg-[#07090e] border border-slate-700 rounded text-right font-mono text-xs text-white focus:outline-none focus:border-cyan-400 tabular-nums"
            />
            <span className="text-[11px] font-mono text-slate-400 w-7">m</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={parameters.initialHeight}
          onChange={(e) => updateParam('initialHeight', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0 m (Ground)</span>
          <span>50 m</span>
          <span>100 m</span>
        </div>
      </div>

      {/* Control 4: Gravity */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="param-gravity" className="text-slate-300 font-medium">
            Gravitational Acceleration <span className="text-slate-400 font-mono">(g)</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              id="param-gravity"
              type="number"
              min={0.1}
              max={50}
              step={0.01}
              value={parameters.gravity}
              onChange={(e) => updateParam('gravity', parseFloat(e.target.value))}
              className="w-16 px-2 py-0.5 bg-[#07090e] border border-slate-700 rounded text-right font-mono text-xs text-white focus:outline-none focus:border-cyan-400 tabular-nums"
            />
            <span className="text-[11px] font-mono text-slate-400 w-7">m/s²</span>
          </div>
        </div>
        <input
          type="range"
          min={0.5}
          max={25}
          step={0.1}
          value={parameters.gravity}
          onChange={(e) => updateParam('gravity', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />

        {/* Planet Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          {GRAVITY_PRESETS.map((planet) => {
            const isSelected = Math.abs(parameters.gravity - planet.value) < 0.05;
            return (
              <button
                key={planet.name}
                onClick={() => updateParam('gravity', planet.value)}
                className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                    : 'bg-[#07090e] text-slate-400 hover:text-white border-slate-800'
                }`}
                title={`Set gravity to ${planet.name} (${planet.value} m/s²)`}
              >
                {planet.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vector & Visualization Layers */}
      <div className="pt-2 border-t border-slate-800/60 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vector & Overlay Layers</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showVelocityVector}
              onChange={() => toggleVectorOpt('showVelocityVector')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 accent-cyan-400"
            />
            <span>Velocity Vector <span className="text-cyan-400 font-mono">(v)</span></span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showVelocityComponents}
              onChange={() => toggleVectorOpt('showVelocityComponents')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 accent-cyan-400"
            />
            <span>Components <span className="text-cyan-400 font-mono">(vx, vy)</span></span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showAccelerationVector}
              onChange={() => toggleVectorOpt('showAccelerationVector')}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 accent-amber-400"
            />
            <span>Gravity Vector <span className="text-amber-400 font-mono">(g)</span></span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showTrajectoryTicks}
              onChange={() => toggleVectorOpt('showTrajectoryTicks')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 accent-cyan-400"
            />
            <span>Time Dots (dt)</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showApexMarker}
              onChange={() => toggleVectorOpt('showApexMarker')}
              className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0 accent-purple-400"
            />
            <span>Apex Caliper <span className="text-purple-400 font-mono">(H)</span></span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showRangeMarker}
              onChange={() => toggleVectorOpt('showRangeMarker')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 accent-cyan-400"
            />
            <span>Range Caliper <span className="text-cyan-400 font-mono">(R)</span></span>
          </label>
        </div>
      </div>

      {/* Trajectory Ghost Comparison */}
      <div className="pt-2 border-t border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Compare Trajectories
          </span>
          {comparisonTrails.length > 0 && (
            <button
              onClick={onClearComparisonTrails}
              className="flex items-center gap-1 text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear ({comparisonTrails.length})</span>
            </button>
          )}
        </div>

        <button
          onClick={onSaveCurrentTrail}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded transition-colors cursor-pointer"
          title="Save current trajectory as a ghost trail to visually compare with adjusted parameters"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Save Current Trail as Ghost</span>
        </button>

        {comparisonTrails.length > 0 && (
          <div className="space-y-1 pt-1">
            {comparisonTrails.map((trail) => (
              <div
                key={trail.id}
                className="flex items-center justify-between px-2 py-1 bg-[#07090e] border border-slate-800/80 rounded text-[11px] font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: trail.color }}
                  />
                  <span className="text-slate-300">{trail.label}</span>
                </div>
                <span className="text-slate-500">
                  R={trail.results.range.toFixed(1)}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
