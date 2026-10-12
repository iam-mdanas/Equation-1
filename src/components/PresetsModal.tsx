/**
 * EQUATION 1 — Physics Presets Explorer Modal
 * Allows rapid selection of curated physical ballistic conditions.
 */

import React from 'react';
import { PHYSICS_PRESETS, PresetDefinition } from '../physics/projectileModel';
import { ProjectileParameters } from '../physics/types';
import { X, Sparkles, Check } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (params: ProjectileParameters) => void;
  currentParams: ProjectileParameters;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentParams,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#0b101b] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Physics Scenario Presets
              </h2>
              <p className="text-xs text-slate-400">
                Explore canonical projectile motion experiments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close presets modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Presets */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {PHYSICS_PRESETS.map((preset: PresetDefinition) => {
            const isMatch =
              preset.params.initialSpeed === currentParams.initialSpeed &&
              preset.params.launchAngleDeg === currentParams.launchAngleDeg &&
              preset.params.initialHeight === currentParams.initialHeight &&
              Math.abs(preset.params.gravity - currentParams.gravity) < 0.05;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.params);
                  onClose();
                }}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isMatch
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                    : 'bg-[#07090e] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {preset.name}
                    </span>
                    {isMatch && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{preset.description}</p>
                </div>

                <div className="flex flex-wrap sm:flex-col items-end gap-1 font-mono text-[11px] text-slate-400 shrink-0">
                  <span>u = {preset.params.initialSpeed} m/s</span>
                  <span>θ = {preset.params.launchAngleDeg}°</span>
                  <span>h₀ = {preset.params.initialHeight} m</span>
                  <span>g = {preset.params.gravity} m/s²</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#07090e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
