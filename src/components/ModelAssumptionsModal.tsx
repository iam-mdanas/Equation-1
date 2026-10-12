/**
 * EQUATION 1 — Physical Model Assumptions Modal
 * Rigorously explains the mathematical assumptions of the ideal projectile model.
 */

import React from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MathView } from './MathView';

interface ModelAssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelAssumptionsModal: React.FC<ModelAssumptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#0b101b] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Physical Model Assumptions
              </h2>
              <p className="text-xs text-slate-400">
                Ideal 2D Ballistic Motion Framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close assumptions modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1. Zero Aerodynamic Drag (Vacuum Trajectory)
            </h3>
            <p className="text-slate-400 pl-5">
              Air resistance is assumed to be zero (<MathView math="F_{\text{drag}} = 0" />).
              Consequently, the horizontal acceleration is identically zero (<MathView math="a_x = 0" />),
              meaning horizontal velocity <MathView math="v_x = u \cos\theta" /> remains strictly constant
              throughout the flight.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              2. Uniform Gravitational Field
            </h3>
            <p className="text-slate-400 pl-5">
              The acceleration due to gravity <MathView math="\vec{g} = -g \hat{j}" /> is constant in magnitude
              and direction across the entire trajectory. Variations with altitude and planetary curvature are
              neglected for short-range ballistic motions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              3. Point Mass Projectile
            </h3>
            <p className="text-slate-400 pl-5">
              The projectile is modeled as a point mass without rotational inertia, aerodynamic spin
              (Magnus effect), or aerodynamic lift.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              4. Generalized Non-Zero Initial Elevation
            </h3>
            <p className="text-slate-400 pl-5">
              Unlike introductory textbooks that only provide symmetric formulas (<MathView math="h_0 = 0" />),
              Equation 1 accurately solves the generalized quadratic trajectory for arbitrary launch heights
              <MathView math="h_0 \ge 0" />:
            </p>
            <div className="p-2 bg-[#07090e] border border-slate-800 rounded font-mono text-center my-1">
              <MathView math="y(t) = h_0 + u\sin\theta \cdot t - \frac{1}{2}g t^2 = 0" displayMode />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#07090e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
