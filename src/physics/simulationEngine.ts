/**
 * EQUATION 1 — Simulation Engine
 * High-precision, decoupled time-stepping engine using requestAnimationFrame.
 */

import {
  calculateAnalyticalResults,
  computeStateAtTime,
} from './projectileModel';
import {
  AnalyticalResults,
  ProjectileParameters,
  ProjectileState,
} from './types';

export type TickListener = (state: ProjectileState, analytical: AnalyticalResults) => void;
export type StatusListener = (isPlaying: boolean, isCompleted: boolean) => void;

export class ProjectileSimulationEngine {
  private params: ProjectileParameters;
  private analytical: AnalyticalResults;
  private currentTime = 0;
  private isPlaying = false;
  private playbackSpeed = 1.0;
  private lastRafTime: number | null = null;
  private rafId: number | null = null;

  private tickListeners: Set<TickListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();

  constructor(initialParams: ProjectileParameters) {
    this.params = { ...initialParams };
    this.analytical = calculateAnalyticalResults(this.params);
  }

  public updateParameters(params: ProjectileParameters): void {
    const wasPlaying = this.isPlaying;
    this.params = { ...params };
    this.analytical = calculateAnalyticalResults(this.params);

    // If current time exceeds new time of flight, clamp or reset
    if (this.currentTime >= this.analytical.timeOfFlight) {
      this.currentTime = 0;
      if (wasPlaying) {
        this.pause();
      }
    }

    this.notifyTick();
  }

  public getParameters(): ProjectileParameters {
    return { ...this.params };
  }

  public getAnalyticalResults(): AnalyticalResults {
    return this.analytical;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getCurrentState(): ProjectileState {
    return computeStateAtTime(this.params, this.currentTime);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, Math.min(10, speed));
  }

  public play(): void {
    if (this.isPlaying) return;

    // If already at or past the end, rewind to start
    if (this.currentTime >= this.analytical.timeOfFlight) {
      this.currentTime = 0;
    }

    this.isPlaying = true;
    this.lastRafTime = performance.now();
    this.notifyStatus();
    this.scheduleNextFrame();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.lastRafTime = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.notifyStatus();
  }

  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public reset(): void {
    this.pause();
    this.currentTime = 0;
    this.notifyTick();
    this.notifyStatus();
  }

  public restart(): void {
    this.reset();
    this.play();
  }

  public seekTo(time: number): void {
    const clamped = Math.max(0, Math.min(this.analytical.timeOfFlight, time));
    this.currentTime = clamped;
    this.notifyTick();
  }

  public stepForward(stepSeconds = 0.05): void {
    this.pause();
    const nextTime = Math.min(this.analytical.timeOfFlight, this.currentTime + stepSeconds);
    this.currentTime = nextTime;
    this.notifyTick();
  }

  public stepBackward(stepSeconds = 0.05): void {
    this.pause();
    const prevTime = Math.max(0, this.currentTime - stepSeconds);
    this.currentTime = prevTime;
    this.notifyTick();
  }

  public onTick(listener: TickListener): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public destroy(): void {
    this.pause();
    this.tickListeners.clear;
    this.statusListeners.clear();
  }

  private scheduleNextFrame(): void {
    this.rafId = requestAnimationFrame((now) => this.onFrame(now));
  }

  private onFrame(now: number): void {
    if (!this.isPlaying) return;

    if (this.lastRafTime === null) {
      this.lastRafTime = now;
    }

    const elapsedRealSec = (now - this.lastRafTime) / 1000;
    this.lastRafTime = now;

    // Safety clamp to prevent physics jumps if tab was backgrounded (max 100ms real delta)
    const clampedRealSec = Math.min(0.1, elapsedRealSec);
    const simDt = clampedRealSec * this.playbackSpeed;

    this.currentTime += simDt;

    if (this.currentTime >= this.analytical.timeOfFlight) {
      this.currentTime = this.analytical.timeOfFlight;
      this.pause();
      this.notifyTick();
      return;
    }

    this.notifyTick();
    this.scheduleNextFrame();
  }

  private notifyTick(): void {
    const state = this.getCurrentState();
    this.tickListeners.forEach((listener) => {
      try {
        listener(state, this.analytical);
      } catch (err) {
        console.error('Error in simulation tick listener', err);
      }
    });
  }

  private notifyStatus(): void {
    const isCompleted = this.currentTime >= this.analytical.timeOfFlight;
    this.statusListeners.forEach((listener) => {
      try {
        listener(this.isPlaying, isCompleted);
      } catch (err) {
        console.error('Error in simulation status listener', err);
      }
    });
  }
}
