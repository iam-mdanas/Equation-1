/**
 * EQUATION 1 — High-Precision Canvas Visualization Engine
 * Renders projectile motion, coordinate grids, vectors, and calipers.
 */

import {
  AnalyticalResults,
  ComparisonTrail,
  ProjectileParameters,
  ProjectileState,
  TrajectorySample,
  VectorDisplayOptions,
} from '../physics/types';

export interface ViewportTransform {
  scale: number; // pixels per meter
  offsetX: number; // canvas pixels
  offsetY: number; // canvas pixels
  worldWidth: number;
  worldHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

export class ProjectileCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hoverWorldPoint: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Could not obtain 2D rendering context');
    }
    this.ctx = context;
  }

  public setHoverPoint(point: { x: number; y: number } | null): void {
    this.hoverWorldPoint = point;
  }

  /**
   * Calculates metric scale and offsets to fit trajectory with scientific margins.
   */
  public calculateViewport(
    params: ProjectileParameters,
    results: AnalyticalResults,
    width: number,
    height: number
  ): ViewportTransform {
    const minPaddingLeft = 70;
    const minPaddingRight = 50;
    const minPaddingTop = 50;
    const minPaddingBottom = 60;

    // Determine world bounds needed to comfortably display trajectory
    const targetMaxX = Math.max(results.range, 15);
    const targetMaxY = Math.max(results.maxHeight, params.initialHeight, 10);

    // Give 15% breathing room horizontally, 20% vertically
    const worldWidthNeeded = targetMaxX * 1.15;
    const worldHeightNeeded = targetMaxY * 1.25;

    const availablePxW = Math.max(100, width - (minPaddingLeft + minPaddingRight));
    const availablePxH = Math.max(100, height - (minPaddingTop + minPaddingBottom));

    // Uniform isotropic scale (pixels per meter)
    const scale = Math.min(availablePxW / worldWidthNeeded, availablePxH / worldHeightNeeded);

    // Ground line Y position in canvas coordinates
    const groundCanvasY = height - minPaddingBottom;
    const originCanvasX = minPaddingLeft;

    return {
      scale,
      offsetX: originCanvasX,
      offsetY: groundCanvasY,
      worldWidth: width / scale,
      worldHeight: height / scale,
      canvasWidth: width,
      canvasHeight: height,
    };
  }

  /**
   * Converts world coordinates (meters) to canvas coordinates (pixels).
   */
  public worldToCanvas(
    wx: number,
    wy: number,
    vp: ViewportTransform
  ): { x: number; y: number } {
    return {
      x: vp.offsetX + wx * vp.scale,
      y: vp.offsetY - wy * vp.scale, // inverted Y axis
    };
  }

  /**
   * Converts canvas coordinates (pixels) to world coordinates (meters).
   */
  public canvasToWorld(
    cx: number,
    cy: number,
    vp: ViewportTransform
  ): { x: number; y: number } {
    return {
      x: (cx - vp.offsetX) / vp.scale,
      y: (vp.offsetY - cy) / vp.scale,
    };
  }

  /**
   * Main render pass.
   */
  public render(
    params: ProjectileParameters,
    results: AnalyticalResults,
    currentState: ProjectileState,
    trajectoryPoints: TrajectorySample[],
    vectorOpts: VectorDisplayOptions,
    comparisonTrails: ComparisonTrail[] = []
  ): void {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Ensure backing store matches display resolution
    if (
      this.canvas.width !== Math.floor(width * dpr) ||
      this.canvas.height !== Math.floor(height * dpr)
    ) {
      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(dpr, dpr);

    const vp = this.calculateViewport(params, results, width, height);

    // 1. Background fill
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, width, height);

    // 2. Coordinate Grid & Axes
    if (vectorOpts.showCoordinateGrid) {
      this.drawCoordinateGrid(ctx, vp);
    }

    // 3. Ground Plane & Elevated Launch Pedestal (if initialHeight > 0)
    this.drawGroundAndPedestal(ctx, vp, params.initialHeight);

    // 4. Ghost Comparison Trails
    comparisonTrails.forEach((trail) => {
      this.drawComparisonTrail(ctx, vp, trail);
    });

    // 5. Analytical Trajectory Path & Equidistant Time Ticks
    this.drawTheoreticalTrajectory(ctx, vp, trajectoryPoints, vectorOpts);

    // 6. Traversed Path Segment (progress up to current time)
    this.drawTraversedTrajectory(ctx, vp, trajectoryPoints, currentState.time);

    // 7. Caliper Markers (Apex & Range)
    if (vectorOpts.showApexMarker && results.timeToApex > 0) {
      this.drawApexCaliper(ctx, vp, results);
    }
    if (vectorOpts.showRangeMarker && results.range > 0) {
      this.drawRangeCaliper(ctx, vp, results);
    }

    // 8. Launch Angle Caliper / Arc at Launch Point
    this.drawLaunchAngleArc(ctx, vp, params);

    // 9. Vectors at Current Projectile Position
    this.drawVectors(ctx, vp, currentState, vectorOpts);

    // 10. Current Projectile Body
    this.drawProjectile(ctx, vp, currentState);

    // 11. Interactive Hover Probe (if mouse is inside)
    if (this.hoverWorldPoint) {
      this.drawHoverProbe(ctx, vp, this.hoverWorldPoint, trajectoryPoints);
    }

    ctx.restore();
  }

  /**
   * Draws scientific coordinate grid with adaptive metric tick spacing.
   */
  private drawCoordinateGrid(ctx: CanvasRenderingContext2D, vp: ViewportTransform): void {
    const maxX = (vp.canvasWidth - vp.offsetX) / vp.scale;
    const maxY = vp.offsetY / vp.scale;

    // Select nice rounded metric step: 5, 10, 20, 25, 50, 100
    const desiredPxStep = 60;
    const rawStep = desiredPxStep / vp.scale;
    let step = 10;
    if (rawStep <= 2) step = 2;
    else if (rawStep <= 5) step = 5;
    else if (rawStep <= 10) step = 10;
    else if (rawStep <= 25) step = 25;
    else if (rawStep <= 50) step = 50;
    else if (rawStep <= 100) step = 100;
    else step = Math.ceil(rawStep / 50) * 50;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Vertical grid lines (X axis ticks)
    for (let x = 0; x <= maxX + step; x += step) {
      const p = this.worldToCanvas(x, 0, vp);
      if (p.x > vp.canvasWidth + 20) break;

      ctx.strokeStyle = x === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, vp.canvasHeight);
      ctx.stroke();

      // Tick label on X axis
      if (x > 0 && p.x < vp.canvasWidth - 20) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.fillText(`${x}m`, p.x, vp.offsetY + 8);
      }
    }

    // Horizontal grid lines (Y axis ticks)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= maxY + step; y += step) {
      const p = this.worldToCanvas(0, y, vp);
      if (p.y < 10) break;

      ctx.strokeStyle = y === 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(vp.canvasWidth, p.y);
      ctx.stroke();

      // Tick label on Y axis
      if (y >= 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.fillText(`${y}m`, vp.offsetX - 8, p.y);
      }
    }

    // Axis titles
    ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Horizontal Distance x (m)', vp.canvasWidth - 16, vp.offsetY + 36);

    ctx.save();
    ctx.translate(22, 24);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'right';
    ctx.fillText('Vertical Height y (m)', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draws ground line and pedestal for elevated initial height.
   */
  private drawGroundAndPedestal(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    initialHeight: number
  ): void {
    const origin = this.worldToCanvas(0, 0, vp);

    ctx.save();

    // Ground fill below y = 0
    const groundGradient = ctx.createLinearGradient(0, origin.y, 0, vp.canvasHeight);
    groundGradient.addColorStop(0, '#0c121e');
    groundGradient.addColorStop(1, '#07090e');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, origin.y, vp.canvasWidth, vp.canvasHeight - origin.y);

    // Ground surface hairline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(vp.canvasWidth, origin.y);
    ctx.stroke();

    // Elevated pedestal / cliff when initialHeight > 0
    if (initialHeight > 0) {
      const launchPt = this.worldToCanvas(0, initialHeight, vp);
      const cliffWidth = Math.max(35, 25 * (vp.scale / 10));
      const cliffLeft = origin.x - cliffWidth;

      // Pedestal body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cliffLeft, launchPt.y, cliffWidth, origin.y - launchPt.y);

      // Hatching stripes on pedestal face for technical blueprint feel
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = 1;
      const stripeSpacing = 8;
      for (let y = launchPt.y + 4; y < origin.y; y += stripeSpacing) {
        ctx.beginPath();
        ctx.moveTo(cliffLeft, y);
        ctx.lineTo(cliffLeft + Math.min(cliffWidth, y - launchPt.y), y - Math.min(cliffWidth, y - launchPt.y) + launchPt.y);
        ctx.stroke();
      }

      // Pedestal border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cliffLeft, origin.y);
      ctx.lineTo(cliffLeft, launchPt.y);
      ctx.lineTo(origin.x, launchPt.y);
      ctx.lineTo(origin.x, origin.y);
      ctx.stroke();

      // Pedestal height dimension label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const midY = (launchPt.y + origin.y) / 2;
      ctx.fillText(`h₀ = ${initialHeight.toFixed(1)}m`, cliffLeft - 6, midY);

      // Height caliper line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cliffLeft - 3, launchPt.y);
      ctx.lineTo(cliffLeft - 3, origin.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Draws the theoretical analytical trajectory curve.
   */
  private drawTheoreticalTrajectory(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    points: TrajectorySample[],
    vectorOpts: VectorDisplayOptions
  ): void {
    if (points.length < 2) return;

    ctx.save();

    // Subtle faint path glow
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    const first = this.worldToCanvas(points[0].x, points[0].y, vp);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length; i++) {
      const p = this.worldToCanvas(points[i].x, points[i].y, vp);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Equidistant time tick dots (stroboscopic representation)
    if (vectorOpts.showTrajectoryTicks && points.length > 10) {
      const tickStep = Math.max(1, Math.floor(points.length / 25));
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';

      for (let i = 0; i < points.length; i += tickStep) {
        const pt = this.worldToCanvas(points[i].x, points[i].y, vp);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draws the active traversed trajectory segment up to the current simulation time.
   */
  private drawTraversedTrajectory(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    points: TrajectorySample[],
    currentTime: number
  ): void {
    if (points.length < 2 || currentTime <= 0) return;

    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const first = this.worldToCanvas(points[0].x, points[0].y, vp);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length; i++) {
      if (points[i].time > currentTime) {
        // Interpolate exact endpoint
        const prev = points[i - 1];
        const curr = points[i];
        const fraction = (currentTime - prev.time) / (curr.time - prev.time);
        const ix = prev.x + (curr.x - prev.x) * fraction;
        const iy = prev.y + (curr.y - prev.y) * fraction;
        const interpPt = this.worldToCanvas(ix, iy, vp);
        ctx.lineTo(interpPt.x, interpPt.y);
        break;
      }
      const p = this.worldToCanvas(points[i].x, points[i].y, vp);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws ghost trajectory for comparisons.
   */
  private drawComparisonTrail(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    trail: ComparisonTrail
  ): void {
    if (trail.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = trail.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.55;

    ctx.beginPath();
    const first = this.worldToCanvas(trail.points[0].x, trail.points[0].y, vp);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < trail.points.length; i++) {
      const p = this.worldToCanvas(trail.points[i].x, trail.points[i].y, vp);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Label near peak or end
    const midIdx = Math.floor(trail.points.length / 2);
    const midPt = this.worldToCanvas(trail.points[midIdx].x, trail.points[midIdx].y, vp);
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = trail.color;
    ctx.fillText(`${trail.label}`, midPt.x + 4, midPt.y - 8);

    ctx.restore();
  }

  /**
   * Draws launch angle arc indicator at launch coordinate (0, h0).
   */
  private drawLaunchAngleArc(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    params: ProjectileParameters
  ): void {
    const origin = this.worldToCanvas(0, params.initialHeight, vp);
    const angleRad = (params.launchAngleDeg * Math.PI) / 180;
    const arcRadius = Math.min(42, Math.max(22, 28 * (vp.scale / 10)));

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Horizontal reference dashed line
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + arcRadius + 18, origin.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arc from horizontal 0 to angleRad (clockwise in canvas space because Y is inverted)
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, arcRadius, 0, -angleRad, angleRad > 0);
    ctx.stroke();

    // Angle text label
    const labelAngle = -angleRad / 2;
    const labelDistance = arcRadius + 14;
    const lx = origin.x + Math.cos(labelAngle) * labelDistance;
    const ly = origin.y + Math.sin(labelAngle) * labelDistance;

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`θ = ${params.launchAngleDeg.toFixed(0)}°`, lx, ly);

    ctx.restore();
  }

  /**
   * Draws apex caliper marker with maximum height value.
   */
  private drawApexCaliper(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    results: AnalyticalResults
  ): void {
    const apexTop = this.worldToCanvas(results.apexX, results.maxHeight, vp);
    const apexGround = this.worldToCanvas(results.apexX, 0, vp);

    ctx.save();

    // Vertical dashed caliper line
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)'; // restrained purple accent
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(apexTop.x, apexTop.y);
    ctx.lineTo(apexGround.x, apexGround.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cross tick at top
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(apexTop.x - 6, apexTop.y);
    ctx.lineTo(apexTop.x + 6, apexTop.y);
    ctx.stroke();

    // Measurement badge
    const badgeY = (apexTop.y + apexGround.y) / 2;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#f3e8ff';
    ctx.fillText(`H = ${results.maxHeight.toFixed(2)} m`, apexTop.x + 8, badgeY);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`t = ${results.timeToApex.toFixed(2)}s`, apexTop.x + 8, badgeY + 13);

    ctx.restore();
  }

  /**
   * Draws horizontal range caliper at ground landing point.
   */
  private drawRangeCaliper(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    results: AnalyticalResults
  ): void {
    const origin = this.worldToCanvas(0, 0, vp);
    const land = this.worldToCanvas(results.range, 0, vp);

    ctx.save();

    // Target landing indicator on ground
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(land.x, land.y, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Cross ticks at landing point
    ctx.beginPath();
    ctx.moveTo(land.x - 7, land.y);
    ctx.lineTo(land.x + 7, land.y);
    ctx.moveTo(land.x, land.y - 7);
    ctx.lineTo(land.x, land.y + 7);
    ctx.stroke();

    // Dimension caliper line below ground
    const caliperY = origin.y + 24;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // End drop lines
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y + 4);
    ctx.lineTo(origin.x, caliperY);
    ctx.moveTo(land.x, origin.y + 4);
    ctx.lineTo(land.x, caliperY);
    ctx.stroke();

    // Horizontal dimension line with arrows
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(origin.x, caliperY);
    ctx.lineTo(land.x, caliperY);
    ctx.stroke();

    // Arrow ticks
    ctx.beginPath();
    ctx.moveTo(origin.x + 6, caliperY - 3);
    ctx.lineTo(origin.x, caliperY);
    ctx.lineTo(origin.x + 6, caliperY + 3);

    ctx.moveTo(land.x - 6, caliperY - 3);
    ctx.lineTo(land.x, caliperY);
    ctx.lineTo(land.x - 6, caliperY + 3);
    ctx.stroke();

    // Range text label centered
    const midX = (origin.x + land.x) / 2;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`R = ${results.range.toFixed(2)} m`, midX, caliperY + 4);

    ctx.restore();
  }

  /**
   * Draws dynamic vectors (velocity, components, acceleration).
   */
  private drawVectors(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    state: ProjectileState,
    vectorOpts: VectorDisplayOptions
  ): void {
    const pt = this.worldToCanvas(state.x, state.y, vp);

    // Vector scale factor: length in pixels per 1 m/s
    const vScale = Math.min(3.0, Math.max(1.2, vp.scale * 0.15));

    ctx.save();

    // 1. Velocity components (vx and vy)
    if (vectorOpts.showVelocityComponents) {
      // Horizontal vx (cyan)
      const vxPx = state.vx * vScale;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + vxPx, pt.y);
      ctx.stroke();
      this.drawArrowHead(ctx, pt.x, pt.y, pt.x + vxPx, pt.y, '#38bdf8');

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`vₓ=${state.vx.toFixed(1)}`, pt.x + vxPx / 2, pt.y - 7);

      // Vertical vy (cyan)
      const vyPx = -state.vy * vScale; // inverted Y
      ctx.beginPath();
      ctx.moveTo(pt.x + vxPx, pt.y);
      ctx.lineTo(pt.x + vxPx, pt.y + vyPx);
      ctx.stroke();
      this.drawArrowHead(ctx, pt.x + vxPx, pt.y, pt.x + vxPx, pt.y + vyPx, '#38bdf8');

      ctx.textAlign = 'left';
      ctx.fillText(`vᵧ=${state.vy.toFixed(1)}`, pt.x + vxPx + 6, pt.y + vyPx / 2);

      ctx.setLineDash([]);
    }

    // 2. Resultant Velocity Vector v (bold electric cyan)
    if (vectorOpts.showVelocityVector && state.speed > 0.05) {
      const vxPx = state.vx * vScale;
      const vyPx = -state.vy * vScale;
      const targetX = pt.x + vxPx;
      const targetY = pt.y + vyPx;

      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      this.drawArrowHead(ctx, pt.x, pt.y, targetX, targetY, '#00e5ff', 8);

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(` v=${state.speed.toFixed(1)} m/s`, targetX + 4, targetY - 4);
    }

    // 3. Acceleration Vector g (downward red/amber)
    if (vectorOpts.showAccelerationVector) {
      const gLength = Math.min(45, Math.max(22, Math.abs(state.ay) * 2.5));
      const targetY = pt.y + gLength;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x, targetY);
      ctx.stroke();

      this.drawArrowHead(ctx, pt.x, pt.y, pt.x, targetY, '#f59e0b', 7);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`g=${Math.abs(state.ay).toFixed(2)} m/s²`, pt.x + 6, targetY - 8);
    }

    ctx.restore();
  }

  /**
   * Helper to draw clean arrow heads.
   */
  private drawArrowHead(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    size = 6
  ): void {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws projectile body (high-precision glowing orb).
   */
  private drawProjectile(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    state: ProjectileState
  ): void {
    const pt = this.worldToCanvas(state.x, state.y, vp);

    ctx.save();

    // Outer subtle glow
    const glow = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, 14);
    glow.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Projectile core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Projectile border ring
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws interactive mouse probe with trajectory snapping.
   */
  private drawHoverProbe(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    mouseWorld: { x: number; y: number },
    samples: TrajectorySample[]
  ): void {
    if (samples.length === 0) return;

    // Find closest sample point along trajectory to mouse X
    let closest = samples[0];
    let minDist = Math.abs(samples[0].x - mouseWorld.x);

    for (let i = 1; i < samples.length; i++) {
      const d = Math.abs(samples[i].x - mouseWorld.x);
      if (d < minDist) {
        minDist = d;
        closest = samples[i];
      }
    }

    const pt = this.worldToCanvas(closest.x, closest.y, vp);

    ctx.save();

    // Vertical indicator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, vp.canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe circle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Monospace HUD tooltip
    const boxW = 120;
    const boxH = 68;
    let boxX = pt.x + 12;
    if (boxX + boxW > vp.canvasWidth - 10) {
      boxX = pt.x - boxW - 12;
    }
    const boxY = Math.max(10, Math.min(vp.canvasHeight - boxH - 10, pt.y - boxH / 2));

    ctx.fillStyle = '#0b101b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText(`t  = ${closest.time.toFixed(2)} s`, boxX + 8, boxY + 16);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`x  = ${closest.x.toFixed(2)} m`, boxX + 8, boxY + 30);
    ctx.fillText(`y  = ${closest.y.toFixed(2)} m`, boxX + 8, boxY + 44);

    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`|v|= ${closest.speed.toFixed(2)} m/s`, boxX + 8, boxY + 58);

    ctx.restore();
  }
}
