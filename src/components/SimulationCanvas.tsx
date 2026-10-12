/**
 * EQUATION 1 — Main Simulation Canvas Viewport
 * Orchestrates canvas resizing, device pixel ratio scaling, and mouse probe interactions.
 */

import React, { useRef, useEffect, useState } from 'react';
import { ProjectileCanvasRenderer } from '../canvas/renderer';
import {
  AnalyticalResults,
  ComparisonTrail,
  ProjectileParameters,
  ProjectileState,
  TrajectorySample,
  VectorDisplayOptions,
} from '../physics/types';
import { Maximize2, Crosshair, HelpCircle } from 'lucide-react';

interface SimulationCanvasProps {
  parameters: ProjectileParameters;
  analytical: AnalyticalResults;
  currentState: ProjectileState;
  trajectoryPoints: TrajectorySample[];
  vectorOptions: VectorDisplayOptions;
  comparisonTrails: ComparisonTrail[];
  onOpenAssumptions: () => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  parameters,
  analytical,
  currentState,
  trajectoryPoints,
  vectorOptions,
  comparisonTrails,
  onOpenAssumptions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ProjectileCanvasRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    rendererRef.current = new ProjectileCanvasRenderer(canvasRef.current);
  }, []);

  // ResizeObserver to handle container adjustments smoothly
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render trigger whenever parameters, state, or dimensions change
  useEffect(() => {
    if (!rendererRef.current || !canvasRef.current) return;
    rendererRef.current.render(
      parameters,
      analytical,
      currentState,
      trajectoryPoints,
      vectorOptions,
      comparisonTrails
    );
  }, [
    parameters,
    analytical,
    currentState,
    trajectoryPoints,
    vectorOptions,
    comparisonTrails,
    dimensions,
  ]);

  // Handle mouse movements for interactive trajectory inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const vp = rendererRef.current.calculateViewport(
      parameters,
      analytical,
      dimensions.width,
      dimensions.height
    );
    const world = rendererRef.current.canvasToWorld(cx, cy, vp);

    rendererRef.current.setHoverPoint({ x: Math.max(0, world.x), y: Math.max(0, world.y) });
    rendererRef.current.render(
      parameters,
      analytical,
      currentState,
      trajectoryPoints,
      vectorOptions,
      comparisonTrails
    );
  };

  const handleMouseLeave = () => {
    if (!rendererRef.current) return;
    rendererRef.current.setHoverPoint(null);
    rendererRef.current.render(
      parameters,
      analytical,
      currentState,
      trajectoryPoints,
      vectorOptions,
      comparisonTrails
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Simulation Stage Title & Badge Header (as in reference image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Projectile Motion
          </h1>
          <p className="text-xs text-slate-400">
            Simulate the 2D ballistic trajectory of a projectile launched in a uniform gravitational field.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAssumptions}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 rounded transition-colors cursor-pointer"
            title="Read physical model assumptions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Vacuum (Drag = 0)</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] bg-[#07090e] border border-slate-800/90 rounded-lg overflow-hidden shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        />

        {/* Viewport HUD overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none select-none">
          <div className="px-2 py-0.5 bg-[#0b101b]/80 border border-slate-800 rounded text-[10px] font-mono text-slate-400 backdrop-blur-sm">
            <span>SCALE: AUTO-FIT</span>
          </div>
          {currentState.isGrounded && (
            <div className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-[10px] font-mono text-emerald-300 font-semibold backdrop-blur-sm">
              GROUND IMPACT REACHED
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 pointer-events-none select-none hidden sm:block">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-[#07090e]/70 px-2 py-0.5 rounded border border-slate-800/60">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>Hover trajectory to probe (x, y, t, v)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
