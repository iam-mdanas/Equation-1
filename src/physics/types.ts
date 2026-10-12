/**
 * EQUATION 1 — Scientific Physics Engine
 * Core types for ideal projectile motion.
 */

export interface ProjectileParameters {
  /** Initial launch speed in m/s (u >= 0) */
  initialSpeed: number;
  /** Launch angle relative to horizontal in degrees (-30° to 90°) */
  launchAngleDeg: number;
  /** Initial vertical launch position in meters (h >= 0) */
  initialHeight: number;
  /** Acceleration due to gravity in m/s² (g > 0) */
  gravity: number;
}

export interface ProjectileState {
  /** Elapsed simulation time in seconds */
  time: number;
  /** Current horizontal position in meters */
  x: number;
  /** Current vertical position in meters */
  y: number;
  /** Horizontal velocity component in m/s */
  vx: number;
  /** Vertical velocity component in m/s */
  vy: number;
  /** Instantaneous scalar speed in m/s: sqrt(vx² + vy²) */
  speed: number;
  /** Horizontal acceleration in m/s² (0 in ideal model) */
  ax: number;
  /** Vertical acceleration in m/s² (-g in ideal model) */
  ay: number;
  /** Has projectile reached the ground (y <= 0) */
  isGrounded: boolean;
}

export interface TrajectorySample {
  time: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface AnalyticalResults {
  /** Total flight duration until landing in seconds */
  timeOfFlight: number;
  /** Total horizontal distance traveled upon landing in meters */
  range: number;
  /** Maximum vertical position reached (above ground y=0) in meters */
  maxHeight: number;
  /** Vertical gain above launch elevation in meters: maxHeight - initialHeight */
  heightGainAboveLaunch: number;
  /** Time at which apex is reached in seconds */
  timeToApex: number;
  /** Horizontal position at apex in meters */
  apexX: number;
  /** Impact speed upon touching ground (y=0) in m/s */
  impactSpeed: number;
  /** Impact angle in degrees relative to horizontal */
  impactAngleDeg: number;
  /** Initial horizontal velocity component u * cos(θ) */
  initialVx: number;
  /** Initial vertical velocity component u * sin(θ) */
  initialVy: number;
  /** Whether launch and impact occur at identical elevation (initialHeight === 0) */
  isLevelGround: boolean;
}

export interface ComparisonTrail {
  id: string;
  label: string;
  params: ProjectileParameters;
  results: AnalyticalResults;
  points: TrajectorySample[];
  color: string;
}

export interface VectorDisplayOptions {
  showVelocityVector: boolean;
  showVelocityComponents: boolean;
  showAccelerationVector: boolean;
  showTrajectoryTicks: boolean;
  showApexMarker: boolean;
  showRangeMarker: boolean;
  showCoordinateGrid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ProjectileParameters, string>>;
}
