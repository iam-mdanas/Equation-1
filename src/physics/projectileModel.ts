/**
 * EQUATION 1 — Scientific Physics Engine
 * Analytical projectile motion model and calculation routines.
 */

import {
  AnalyticalResults,
  ProjectileParameters,
  ProjectileState,
  TrajectorySample,
  ValidationResult,
} from './types';

/**
 * Validates user input parameters.
 * Enforces physical bounds to prevent NaN or divergent states.
 */
export function validateParameters(
  params: Partial<ProjectileParameters>
): ValidationResult {
  const errors: Partial<Record<keyof ProjectileParameters, string>> = {};

  if (params.initialSpeed === undefined || isNaN(params.initialSpeed)) {
    errors.initialSpeed = 'Speed must be a valid number';
  } else if (params.initialSpeed < 0) {
    errors.initialSpeed = 'Speed cannot be negative';
  } else if (params.initialSpeed > 250) {
    errors.initialSpeed = 'Speed maximum is 250 m/s';
  }

  if (params.launchAngleDeg === undefined || isNaN(params.launchAngleDeg)) {
    errors.launchAngleDeg = 'Angle must be a valid number';
  } else if (params.launchAngleDeg < -30 || params.launchAngleDeg > 90) {
    errors.launchAngleDeg = 'Angle must be between -30° and 90°';
  }

  if (params.initialHeight === undefined || isNaN(params.initialHeight)) {
    errors.initialHeight = 'Height must be a valid number';
  } else if (params.initialHeight < 0) {
    errors.initialHeight = 'Height cannot be negative';
  } else if (params.initialHeight > 500) {
    errors.initialHeight = 'Height maximum is 500 m';
  }

  if (params.gravity === undefined || isNaN(params.gravity)) {
    errors.gravity = 'Gravity must be a valid number';
  } else if (params.gravity <= 0.01) {
    errors.gravity = 'Gravity must be greater than 0';
  } else if (params.gravity > 100) {
    errors.gravity = 'Gravity maximum is 100 m/s²';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates all analytical properties of the trajectory.
 * Correctly accounts for non-zero initial height (h0 >= 0).
 */
export function calculateAnalyticalResults(
  params: ProjectileParameters
): AnalyticalResults {
  const { initialSpeed, launchAngleDeg, initialHeight, gravity } = params;

  const thetaRad = (launchAngleDeg * Math.PI) / 180;
  const initialVx = initialSpeed * Math.cos(thetaRad);
  const initialVy = initialSpeed * Math.sin(thetaRad);

  // Discriminant for landing time: 1/2 g T^2 - vy0 T - h0 = 0
  // T = [vy0 + sqrt(vy0^2 + 2*g*h0)] / g
  const discriminant = initialVy * initialVy + 2 * gravity * initialHeight;
  let timeOfFlight = 0;

  if (discriminant >= 0) {
    const root = Math.sqrt(discriminant);
    const t = (initialVy + root) / gravity;
    timeOfFlight = Math.max(0, t);
  }

  // Horizontal range at landing
  const range = Math.max(0, initialVx * timeOfFlight);

  // Apex (maximum height): reached when vy = 0 => t_apex = vy0 / g
  let timeToApex = 0;
  let maxHeight = initialHeight;
  let apexX = 0;

  if (initialVy > 0) {
    timeToApex = initialVy / gravity;
    // Cap apex at time of flight if projectile lands before reaching top (not applicable for vy0 > 0 on flat/cliff, but physically safe)
    if (timeToApex <= timeOfFlight) {
      maxHeight = initialHeight + (initialVy * initialVy) / (2 * gravity);
      apexX = initialVx * timeToApex;
    }
  }

  const heightGainAboveLaunch = maxHeight - initialHeight;

  // Impact speed and angle upon reaching y=0
  const impactVx = initialVx;
  const impactVy = initialVy - gravity * timeOfFlight;
  const impactSpeed = Math.sqrt(impactVx * impactVx + impactVy * impactVy);
  const impactAngleDeg = (Math.atan2(Math.abs(impactVy), Math.abs(impactVx)) * 180) / Math.PI;

  return {
    timeOfFlight,
    range,
    maxHeight,
    heightGainAboveLaunch,
    timeToApex,
    apexX,
    impactSpeed,
    impactAngleDeg,
    initialVx,
    initialVy,
    isLevelGround: initialHeight === 0,
  };
}

/**
 * Computes exact state at any given simulation time t.
 */
export function computeStateAtTime(
  params: ProjectileParameters,
  t: number
): ProjectileState {
  const { initialSpeed, launchAngleDeg, initialHeight, gravity } = params;
  const thetaRad = (launchAngleDeg * Math.PI) / 180;

  const initialVx = initialSpeed * Math.cos(thetaRad);
  const initialVy = initialSpeed * Math.sin(thetaRad);

  // Time clamped at t >= 0
  const clampedTime = Math.max(0, t);

  const x = initialVx * clampedTime;
  const rawY = initialHeight + initialVy * clampedTime - 0.5 * gravity * clampedTime * clampedTime;
  const y = Math.max(0, rawY);

  const vx = initialVx;
  const vy = initialVy - gravity * clampedTime;
  const speed = Math.sqrt(vx * vx + vy * vy);

  const isGrounded = rawY <= 0 && clampedTime > 0.0001;

  return {
    time: clampedTime,
    x,
    y,
    vx,
    vy,
    speed,
    ax: 0,
    ay: -gravity,
    isGrounded,
  };
}

/**
 * Generates discretized samples along the full trajectory for rendering and inspection.
 */
export function generateTrajectoryPoints(
  params: ProjectileParameters,
  results: AnalyticalResults,
  numPoints = 200
): TrajectorySample[] {
  const { timeOfFlight } = results;
  if (timeOfFlight <= 0) {
    return [
      {
        time: 0,
        x: 0,
        y: params.initialHeight,
        vx: params.initialSpeed * Math.cos((params.launchAngleDeg * Math.PI) / 180),
        vy: params.initialSpeed * Math.sin((params.launchAngleDeg * Math.PI) / 180),
        speed: params.initialSpeed,
      },
    ];
  }

  const samples: TrajectorySample[] = [];
  const dt = timeOfFlight / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const t = i === numPoints - 1 ? timeOfFlight : i * dt;
    const state = computeStateAtTime(params, t);
    samples.push({
      time: t,
      x: state.x,
      y: state.y,
      vx: state.vx,
      vy: state.vy,
      speed: state.speed,
    });
  }

  return samples;
}

/**
 * Standard physics presets for exploration.
 */
export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  params: ProjectileParameters;
}

export const PHYSICS_PRESETS: PresetDefinition[] = [
  {
    id: 'optimal-range',
    name: 'Optimal 45° Launch',
    description: 'Level ground launch at 45° angle yielding maximum theoretical range.',
    params: {
      initialSpeed: 25,
      launchAngleDeg: 45,
      initialHeight: 0,
      gravity: 9.81,
    },
  },
  {
    id: 'cliff-horizontal',
    name: 'Horizontal Cliff Launch',
    description: 'Launch from 50m elevated cliff with purely horizontal initial velocity.',
    params: {
      initialSpeed: 22,
      launchAngleDeg: 0,
      initialHeight: 50,
      gravity: 9.81,
    },
  },
  {
    id: 'mortar-arc',
    name: 'High-Arc Mortar',
    description: 'Steep 75° elevation trajectory with high maximum altitude and short range.',
    params: {
      initialSpeed: 32,
      launchAngleDeg: 75,
      initialHeight: 0,
      gravity: 9.81,
    },
  },
  {
    id: 'lunar-hop',
    name: 'Apollo Lunar Surface',
    description: 'Trajectory under Moon gravity (1.62 m/s²), showing immense height and range.',
    params: {
      initialSpeed: 18,
      launchAngleDeg: 45,
      initialHeight: 0,
      gravity: 1.62,
    },
  },
  {
    id: 'martian-cliff',
    name: 'Mars Crater Wall',
    description: 'Elevated launch at 35° under Martian gravity (3.71 m/s²).',
    params: {
      initialSpeed: 28,
      launchAngleDeg: 35,
      initialHeight: 30,
      gravity: 3.71,
    },
  },
];

/**
 * Standard planetary gravity presets
 */
export const GRAVITY_PRESETS = [
  { name: 'Earth', value: 9.81, symbol: 'g_⊕' },
  { name: 'Moon', value: 1.62, symbol: 'g_☾' },
  { name: 'Mars', value: 3.71, symbol: 'g_♂' },
  { name: 'Jupiter', value: 24.79, symbol: 'g_♃' },
];
