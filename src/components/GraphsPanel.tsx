/**
 * EQUATION 1 — Analytical & Dynamic Kinematics Graphs
 * Interactive plots for y(t), x(t), vy(t), and y(x) with synchronized time cursor.
 */

import React, { useState, useMemo } from 'react';
import {
  AnalyticalResults,
  ProjectileParameters,
  ProjectileState,
  TrajectorySample,
} from '../physics/types';
import { LineChart, Maximize2 } from 'lucide-react';

interface GraphsPanelProps {
  parameters: ProjectileParameters;
  analytical: AnalyticalResults;
  currentState: ProjectileState;
  trajectoryPoints: TrajectorySample[];
}

type GraphMode = 'height-time' | 'x-time' | 'vy-time' | 'phase-traj';

export const GraphsPanel: React.FC<GraphsPanelProps> = ({
  parameters,
  analytical,
  currentState,
  trajectoryPoints,
}) => {
  const [mode, setMode] = useState<GraphMode>('height-time');
  const [hoverData, setHoverData] = useState<{ xVal: number; yVal: number; px: number; py: number } | null>(null);

  // SVG dimensions
  const svgWidth = 420;
  const svgHeight = 180;
  const padding = { top: 16, right: 20, bottom: 28, left: 45 };
  const plotW = svgWidth - padding.left - padding.right;
  const plotH = svgHeight - padding.top - padding.bottom;

  // Compute graph domains and mapped points
  const graphData = useMemo(() => {
    if (trajectoryPoints.length < 2) return null;

    let xMin = 0;
    let xMax = analytical.timeOfFlight || 1;
    let yMin = 0;
    let yMax = 10;
    let xLabel = 'Time (s)';
    let yLabel = 'Height (m)';
    let currentXVal = currentState.time;
    let currentYVal = currentState.y;

    if (mode === 'height-time') {
      xMin = 0;
      xMax = Math.max(0.1, analytical.timeOfFlight);
      yMin = 0;
      yMax = Math.max(5, analytical.maxHeight * 1.1);
      xLabel = 'Time t (s)';
      yLabel = 'Height y (m)';
      currentXVal = currentState.time;
      currentYVal = currentState.y;
    } else if (mode === 'x-time') {
      xMin = 0;
      xMax = Math.max(0.1, analytical.timeOfFlight);
      yMin = 0;
      yMax = Math.max(5, analytical.range * 1.05);
      xLabel = 'Time t (s)';
      yLabel = 'Distance x (m)';
      currentXVal = currentState.time;
      currentYVal = currentState.x;
    } else if (mode === 'vy-time') {
      xMin = 0;
      xMax = Math.max(0.1, analytical.timeOfFlight);
      const maxVy = Math.max(Math.abs(analytical.initialVy), Math.abs(analytical.initialVy - parameters.gravity * analytical.timeOfFlight), 5);
      yMin = -maxVy * 1.1;
      yMax = maxVy * 1.1;
      xLabel = 'Time t (s)';
      yLabel = 'Velocity vy (m/s)';
      currentXVal = currentState.time;
      currentYVal = currentState.vy;
    } else if (mode === 'phase-traj') {
      xMin = 0;
      xMax = Math.max(5, analytical.range * 1.05);
      yMin = 0;
      yMax = Math.max(5, analytical.maxHeight * 1.1);
      xLabel = 'Horizontal x (m)';
      yLabel = 'Height y (m)';
      currentXVal = currentState.x;
      currentYVal = currentState.y;
    }

    const scaleX = (val: number) => padding.left + ((val - xMin) / (xMax - xMin)) * plotW;
    const scaleY = (val: number) => padding.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

    // Generate path points
    const pointsList: { xVal: number; yVal: number; px: number; py: number }[] = [];
    let pathD = '';

    for (let i = 0; i < trajectoryPoints.length; i++) {
      const pt = trajectoryPoints[i];
      let xv = pt.time;
      let yv = pt.y;

      if (mode === 'height-time') {
        xv = pt.time;
        yv = pt.y;
      } else if (mode === 'x-time') {
        xv = pt.time;
        yv = pt.x;
      } else if (mode === 'vy-time') {
        xv = pt.time;
        yv = pt.vy;
      } else if (mode === 'phase-traj') {
        xv = pt.x;
        yv = pt.y;
      }

      const px = scaleX(xv);
      const py = scaleY(yv);
      pointsList.push({ xVal: xv, yVal: yv, px, py });

      if (i === 0) {
        pathD += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        pathD += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }

    // Zero line Y pixel position (useful for vy-time)
    const zeroY = scaleY(0);

    const currentCursor = {
      px: scaleX(currentXVal),
      py: scaleY(currentYVal),
      xVal: currentXVal,
      yVal: currentYVal,
    };

    return {
      xMin,
      xMax,
      yMin,
      yMax,
      xLabel,
      yLabel,
      pathD,
      zeroY,
      scaleX,
      scaleY,
      currentCursor,
      pointsList,
    };
  }, [trajectoryPoints, analytical, mode, parameters, currentState]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!graphData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    if (svgX < padding.left || svgX > svgWidth - padding.right) {
      setHoverData(null);
      return;
    }

    // Find nearest sample
    let nearest = graphData.pointsList[0];
    let minDist = Math.abs(nearest.px - svgX);
    for (let i = 1; i < graphData.pointsList.length; i++) {
      const d = Math.abs(graphData.pointsList[i].px - svgX);
      if (d < minDist) {
        minDist = d;
        nearest = graphData.pointsList[i];
      }
    }

    setHoverData(nearest);
  };

  return (
    <div className="bg-[#0b101b] border border-slate-800/90 rounded-lg p-4 select-none space-y-3">
      {/* Header & Graph mode switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Dynamic Kinematics Graphs
          </h2>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-slate-800 rounded p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setMode('height-time')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === 'height-time'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            y(t)
          </button>
          <button
            onClick={() => setMode('x-time')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === 'x-time'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            x(t)
          </button>
          <button
            onClick={() => setMode('vy-time')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === 'vy-time'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            vy(t)
          </button>
          <button
            onClick={() => setMode('phase-traj')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === 'phase-traj'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            y(x)
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full bg-[#07090e] border border-slate-800/80 rounded-md overflow-hidden">
        {graphData ? (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair block"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverData(null)}
          >
            {/* Grid horizontal lines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={svgWidth - padding.right}
              y2={padding.top}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotH / 2}
              x2={svgWidth - padding.right}
              y2={padding.top + plotH / 2}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotH}
              x2={svgWidth - padding.right}
              y2={padding.top + plotH}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />

            {/* Zero reference line for vy */}
            {mode === 'vy-time' && (
              <line
                x1={padding.left}
                y1={graphData.zeroY}
                x2={svgWidth - padding.right}
                y2={graphData.zeroY}
                stroke="rgba(56, 189, 248, 0.3)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            )}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotH}
              stroke="rgba(148, 163, 184, 0.4)"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotH}
              x2={svgWidth - padding.right}
              y2={padding.top + plotH}
              stroke="rgba(148, 163, 184, 0.4)"
              strokeWidth="1"
            />

            {/* Y axis tick labels */}
            <text
              x={padding.left - 6}
              y={padding.top + 4}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="end"
            >
              {graphData.yMax.toFixed(1)}
            </text>
            <text
              x={padding.left - 6}
              y={padding.top + plotH / 2 + 3}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="end"
            >
              {((graphData.yMax + graphData.yMin) / 2).toFixed(1)}
            </text>
            <text
              x={padding.left - 6}
              y={padding.top + plotH}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="end"
            >
              {graphData.yMin.toFixed(1)}
            </text>

            {/* X axis tick labels */}
            <text
              x={padding.left}
              y={padding.top + plotH + 16}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="start"
            >
              {graphData.xMin.toFixed(1)}
            </text>
            <text
              x={(padding.left + svgWidth - padding.right) / 2}
              y={padding.top + plotH + 16}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {((graphData.xMax + graphData.xMin) / 2).toFixed(1)}
            </text>
            <text
              x={svgWidth - padding.right}
              y={padding.top + plotH + 16}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              textAnchor="end"
            >
              {graphData.xMax.toFixed(1)}
            </text>

            {/* Main analytical curve */}
            <path
              d={graphData.pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Synchronized simulation time cursor */}
            <line
              x1={graphData.currentCursor.px}
              y1={padding.top}
              x2={graphData.currentCursor.px}
              y2={padding.top + plotH}
              stroke="rgba(0, 229, 255, 0.4)"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <circle
              cx={graphData.currentCursor.px}
              cy={graphData.currentCursor.py}
              r="4.5"
              fill="#ffffff"
              stroke="#00e5ff"
              strokeWidth="2"
            />

            {/* Hover tooltip indicator */}
            {hoverData && (
              <g>
                <circle
                  cx={hoverData.px}
                  cy={hoverData.py}
                  r="3.5"
                  fill="#f59e0b"
                />
              </g>
            )}
          </svg>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-slate-500 font-mono">
            No trajectory data
          </div>
        )}

        {/* Hover readout badge */}
        {hoverData && graphData && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-[#0b101b] border border-slate-700 rounded text-[10px] font-mono text-amber-300">
            {graphData.xLabel.split(' ')[0]}: {hoverData.xVal.toFixed(2)} |{' '}
            {graphData.yLabel.split(' ')[0]}: {hoverData.yVal.toFixed(2)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono">
          Cursor synchronized with current time <span className="text-cyan-400 font-semibold">t={currentState.time.toFixed(2)}s</span>
        </span>
        <span className="font-mono text-emerald-400">
          Analytical curve
        </span>
      </div>
    </div>
  );
};
