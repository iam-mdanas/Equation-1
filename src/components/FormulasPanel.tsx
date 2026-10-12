/**
 * EQUATION 1 — Mathematical Equations Panel
 * Displays beautiful LaTeX equations rendered with KaTeX, with support for live numerical substitutions.
 */

import React, { useState } from 'react';
import {
  AnalyticalResults,
  ProjectileParameters,
} from '../physics/types';
import { MathView } from './MathView';
import { Sigma, Variable, FunctionSquare } from 'lucide-react';

interface FormulasPanelProps {
  parameters: ProjectileParameters;
  analytical: AnalyticalResults;
}

export const FormulasPanel: React.FC<FormulasPanelProps> = ({
  parameters,
  analytical,
}) => {
  const [tab, setTab] = useState<'algebraic' | 'substituted'>('algebraic');

  const { initialSpeed, launchAngleDeg, initialHeight, gravity } = parameters;
  const isLevel = initialHeight === 0;

  return (
    <div className="bg-[#0b101b] border border-slate-800/90 rounded-lg p-4 select-none space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sigma className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Governing Equations
          </h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-slate-800 rounded p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setTab('algebraic')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
              tab === 'algebraic'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FunctionSquare className="w-3 h-3" />
            <span>Analytical Form</span>
          </button>
          <button
            onClick={() => setTab('substituted')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
              tab === 'substituted'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Variable className="w-3 h-3" />
            <span>Substituted Values</span>
          </button>
        </div>
      </div>

      {tab === 'algebraic' ? (
        <div className="space-y-3.5 text-xs">
          {/* Horizontal Range */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Horizontal Range (R)</span>
              <span className="font-mono text-[10px] text-cyan-400">
                {isLevel ? 'Level ground (h₀ = 0)' : 'Elevated launch (h₀ > 0)'}
              </span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              {isLevel ? (
                <MathView math="R = \frac{u^2 \sin(2\theta)}{g}" displayMode />
              ) : (
                <MathView
                  math="R = u\cos\theta \cdot \left[ \frac{u\sin\theta + \sqrt{u^2\sin^2\theta + 2gh_0}}{g} \right]"
                  displayMode
                />
              )}
            </div>
          </div>

          {/* Maximum Height */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Maximum Height (H)</span>
              <span className="font-mono text-[10px] text-purple-400">At vy = 0</span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              <MathView
                math={
                  isLevel
                    ? 'H = \frac{u^2 \sin^2\theta}{2g}'
                    : 'H = h_0 + \frac{u^2 \sin^2\theta}{2g}'
                }
                displayMode
              />
            </div>
          </div>

          {/* Time of Flight */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Time of Flight (T)</span>
              <span className="font-mono text-[10px] text-slate-500">Root of y(T) = 0</span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              {isLevel ? (
                <MathView math="T = \frac{2u \sin\theta}{g}" displayMode />
              ) : (
                <MathView
                  math="T = \frac{u\sin\theta + \sqrt{u^2\sin^2\theta + 2gh_0}}{g}"
                  displayMode
                />
              )}
            </div>
          </div>

          {/* Trajectory Parabola Equation */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Trajectory Equation y(x)</span>
              <span className="font-mono text-[10px] text-slate-500">Cartesian profile</span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              <MathView
                math={
                  isLevel
                    ? 'y(x) = x \tan\theta - \frac{g x^2}{2 u^2 \cos^2\theta}'
                    : 'y(x) = h_0 + x \tan\theta - \frac{g x^2}{2 u^2 \cos^2\theta}'
                }
                displayMode
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5 text-xs">
          {/* Substituted Range */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Range Calculation</span>
              <span className="font-mono text-[10px] text-emerald-400">
                = {analytical.range.toFixed(2)} m
              </span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              {isLevel ? (
                <MathView
                  math={`R = \\frac{(${initialSpeed})^2 \\cdot \\sin(${2 * launchAngleDeg}^\\circ)}{${gravity}} = ${analytical.range.toFixed(2)}\\text{ m}`}
                  displayMode
                />
              ) : (
                <MathView
                  math={`R = (${analytical.initialVx.toFixed(2)}) \\times (${analytical.timeOfFlight.toFixed(2)}) = ${analytical.range.toFixed(2)}\\text{ m}`}
                  displayMode
                />
              )}
            </div>
          </div>

          {/* Substituted Height */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Max Height Calculation</span>
              <span className="font-mono text-[10px] text-purple-400">
                = {analytical.maxHeight.toFixed(2)} m
              </span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              <MathView
                math={`H = ${initialHeight} + \\frac{(${analytical.initialVy.toFixed(2)})^2}{2 \\times ${gravity}} = ${analytical.maxHeight.toFixed(2)}\\text{ m}`}
                displayMode
              />
            </div>
          </div>

          {/* Substituted Time of Flight */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Time of Flight Calculation</span>
              <span className="font-mono text-[10px] text-cyan-400">
                = {analytical.timeOfFlight.toFixed(2)} s
              </span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              <MathView
                math={`T = \\frac{${analytical.initialVy.toFixed(2)} + \\sqrt{(${analytical.initialVy.toFixed(2)})^2 + 2(${gravity})(${initialHeight})}}{${gravity}} = ${analytical.timeOfFlight.toFixed(2)}\\text{ s}`}
                displayMode
              />
            </div>
          </div>

          {/* Initial Velocity Vector */}
          <div className="bg-[#07090e] border border-slate-800/80 rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">Decomposed Initial Velocity</span>
              <span className="font-mono text-[10px] text-slate-400">Components</span>
            </div>
            <div className="text-slate-100 overflow-x-auto py-1">
              <MathView
                math={`\\vec{u} = (${analytical.initialVx.toFixed(2)}\\hat{i} + ${analytical.initialVy.toFixed(2)}\\hat{j})\\text{ m/s}`}
                displayMode
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
