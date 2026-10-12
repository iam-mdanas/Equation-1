/**
 * EQUATION 1 — Playback & Time Controls
 * Provides deterministic scrubbing, stepping, playback speed, and run/pause triggers.
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Gauge,
} from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  timeOfFlight: number;
  playbackSpeed: number;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onChangeSpeed: (speed: number) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1.0, 2.0];

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  timeOfFlight,
  playbackSpeed,
  onTogglePlayPause,
  onReset,
  onSeek,
  onStepForward,
  onStepBackward,
  onChangeSpeed,
}) => {
  const progressRatio = timeOfFlight > 0 ? Math.min(1, currentTime / timeOfFlight) : 0;

  return (
    <div className="bg-[#0b101b] border border-slate-800/90 rounded-lg p-3 sm:p-4 select-none space-y-3">
      {/* Top row: Timeline scrubber & time readout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">
            t = {currentTime.toFixed(2)}s
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">
            T = {timeOfFlight.toFixed(2)}s
          </span>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex bg-[#07090e] border border-slate-800 rounded p-0.5">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrub range slider */}
      <div className="relative flex items-center group">
        <input
          type="range"
          min={0}
          max={timeOfFlight || 1}
          step={0.01}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        {/* Progress highlight bar behind thumb */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-cyan-500/60 rounded-lg pointer-events-none"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Bottom control button bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Main Play / Pause CTA */}
          <button
            onClick={onTogglePlayPause}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
            }`}
            title={isPlaying ? 'Pause simulation (Space)' : 'Start simulation (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Step Backward */}
          <button
            onClick={onStepBackward}
            disabled={currentTime <= 0}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Step backward 0.05 seconds"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={currentTime >= timeOfFlight}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Step forward 0.05 seconds"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 rounded-md text-xs font-medium transition-colors cursor-pointer"
            title="Reset simulation time to t = 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden md:block">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">Space</kbd> to play/pause
        </div>
      </div>
    </div>
  );
};
