/**
 * EQUATION 1 — Projectile Motion Laboratory
 * "Write it. Transform it. Graph it. Simulate it. Understand it."
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  AnalyticalResults,
  ComparisonTrail,
  ProjectileParameters,
  ProjectileState,
  TrajectorySample,
  VectorDisplayOptions,
} from './physics/types';
import {
  calculateAnalyticalResults,
  computeStateAtTime,
  generateTrajectoryPoints,
} from './physics/projectileModel';
import { ProjectileSimulationEngine } from './physics/simulationEngine';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SimulationCanvas } from './components/SimulationCanvas';
import { PlaybackControls } from './components/PlaybackControls';
import { ParameterPanel } from './components/ParameterPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { GraphsPanel } from './components/GraphsPanel';
import { FormulasPanel } from './components/FormulasPanel';
import { PresetsModal } from './components/PresetsModal';
import { ModelAssumptionsModal } from './components/ModelAssumptionsModal';

// Initial default conditions matching standard physics laboratory benchmark
const DEFAULT_PARAMETERS: ProjectileParameters = {
  initialSpeed: 20.0,
  launchAngleDeg: 45.0,
  initialHeight: 0.0,
  gravity: 9.81,
};

const DEFAULT_VECTOR_OPTIONS: VectorDisplayOptions = {
  showVelocityVector: true,
  showVelocityComponents: false,
  showAccelerationVector: false,
  showTrajectoryTicks: true,
  showApexMarker: true,
  showRangeMarker: true,
  showCoordinateGrid: true,
};

export default function App() {
  const [parameters, setParameters] = useState<ProjectileParameters>(DEFAULT_PARAMETERS);
  const [vectorOptions, setVectorOptions] = useState<VectorDisplayOptions>(DEFAULT_VECTOR_OPTIONS);
  const [comparisonTrails, setComparisonTrails] = useState<ComparisonTrail[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  // Simulation engine reference (singleton lifecycle across renders)
  const engineRef = useRef<ProjectileSimulationEngine | null>(null);

  // Current simulation states
  const [currentState, setCurrentState] = useState<ProjectileState>(() =>
    computeStateAtTime(DEFAULT_PARAMETERS, 0)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new ProjectileSimulationEngine(DEFAULT_PARAMETERS);
  }

  // Analytical quantities
  const analytical = useMemo<AnalyticalResults>(() => {
    return calculateAnalyticalResults(parameters);
  }, [parameters]);

  // Full trajectory discretization
  const trajectoryPoints = useMemo<TrajectorySample[]>(() => {
    return generateTrajectoryPoints(parameters, analytical, 250);
  }, [parameters, analytical]);

  // Register engine callbacks
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const unsubTick = engine.onTick((state) => {
      setCurrentState(state);
    });

    const unsubStatus = engine.onStatusChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTick();
      unsubStatus();
    };
  }, []);

  // Sync parameter changes with simulation engine
  const handleParametersChange = useCallback((newParams: ProjectileParameters) => {
    setParameters(newParams);
    if (engineRef.current) {
      engineRef.current.updateParameters(newParams);
      setCurrentState(engineRef.current.getCurrentState());
    }
  }, []);

  // Playback control actions
  const handleTogglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
  }, []);

  const handleReset = useCallback(() => {
    engineRef.current?.reset();
    if (engineRef.current) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    engineRef.current?.seekTo(time);
    if (engineRef.current) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  }, []);

  const handleStepForward = useCallback(() => {
    engineRef.current?.stepForward(0.05);
    if (engineRef.current) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  }, []);

  const handleStepBackward = useCallback(() => {
    engineRef.current?.stepBackward(0.05);
    if (engineRef.current) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  }, []);

  const handleChangeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    engineRef.current?.setPlaybackSpeed(speed);
  }, []);

  const handleResetAll = useCallback(() => {
    handleParametersChange(DEFAULT_PARAMETERS);
    handleReset();
    setComparisonTrails([]);
  }, [handleParametersChange, handleReset]);

  // Save current trajectory curve as ghost comparison trail
  const handleSaveCurrentTrail = useCallback(() => {
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];
    const color = colors[comparisonTrails.length % colors.length];
    const newTrail: ComparisonTrail = {
      id: `trail-${Date.now()}`,
      label: `u=${parameters.initialSpeed}m/s, θ=${parameters.launchAngleDeg}°`,
      params: { ...parameters },
      results: { ...analytical },
      points: [...trajectoryPoints],
      color,
    };
    setComparisonTrails((prev) => [...prev.slice(-3), newTrail]);
  }, [parameters, analytical, trajectoryPoints, comparisonTrails.length]);

  const handleClearComparisonTrails = useCallback(() => {
    setComparisonTrails([]);
  }, []);

  // Keyboard shortcuts (Space: play/pause, R: reset, Arrow keys: step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a numeric input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlayPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlayPause, handleReset, handleStepForward, handleStepBackward]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Header
        onResetAll={handleResetAll}
        onOpenAssumptions={() => setIsAssumptionsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Central Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-[1700px] mx-auto w-full">
          {/* Top Hero Section: Canvas + Playback Controls + Parameters */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Simulation Canvas & Playback Bar */}
            <div className="xl:col-span-8 space-y-4">
              <SimulationCanvas
                parameters={parameters}
                analytical={analytical}
                currentState={currentState}
                trajectoryPoints={trajectoryPoints}
                vectorOptions={vectorOptions}
                comparisonTrails={comparisonTrails}
                onOpenAssumptions={() => setIsAssumptionsOpen(true)}
              />

              <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentState.time}
                timeOfFlight={analytical.timeOfFlight}
                playbackSpeed={playbackSpeed}
                onTogglePlayPause={handleTogglePlayPause}
                onReset={handleReset}
                onSeek={handleSeek}
                onStepForward={handleStepForward}
                onStepBackward={handleStepBackward}
                onChangeSpeed={handleChangeSpeed}
              />
            </div>

            {/* Right 4 Columns: Physical Parameter Panel */}
            <div className="xl:col-span-4">
              <ParameterPanel
                parameters={parameters}
                onChangeParameters={handleParametersChange}
                vectorOptions={vectorOptions}
                onChangeVectorOptions={setVectorOptions}
                onSaveCurrentTrail={handleSaveCurrentTrail}
                comparisonTrails={comparisonTrails}
                onClearComparisonTrails={handleClearComparisonTrails}
                onResetParameters={() => handleParametersChange(DEFAULT_PARAMETERS)}
              />
            </div>
          </div>

          {/* Lower Scientific Analysis Deck: Measurements + Graphs + Formulas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Telemetry and Results */}
            <div className="lg:col-span-5 flex flex-col">
              <ResultsPanel
                analytical={analytical}
                currentState={currentState}
              />
            </div>

            {/* Dynamic Kinematic Graphs */}
            <div className="lg:col-span-4 flex flex-col">
              <GraphsPanel
                parameters={parameters}
                analytical={analytical}
                currentState={currentState}
                trajectoryPoints={trajectoryPoints}
              />
            </div>

            {/* Mathematical Governing Equations */}
            <div className="lg:col-span-3 flex flex-col">
              <FormulasPanel
                parameters={parameters}
                analytical={analytical}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleParametersChange}
        currentParams={parameters}
      />

      <ModelAssumptionsModal
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
      />
    </div>
  );
}
