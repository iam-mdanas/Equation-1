/**
 * EQUATION 1 — Scientific Laboratory Sidebar Navigation
 * Mimics modular multi-experiment structure while anchoring Projectile Motion as the active module.
 */

import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronRight,
  Activity,
  Zap,
  Eye,
  Flame,
  Binary,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  isOpenDefault: boolean;
  items: {
    id: string;
    label: string;
    isActive?: boolean;
    isComingSoon?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mechanics: true,
    waves: false,
    em: false,
    optics: false,
    thermo: false,
    modern: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: { key: string; section: NavSection }[] = [
    {
      key: 'mechanics',
      section: {
        title: 'Mechanics',
        icon: <Compass className="w-4 h-4 text-cyan-400" />,
        isOpenDefault: true,
        items: [
          { id: 'projectile', label: 'Projectile Motion', isActive: true },
          { id: 'freefall', label: 'Free Fall', isComingSoon: true },
          { id: 'newton', label: "Newton's Laws", isComingSoon: true },
          { id: 'incline', label: 'Inclined Plane', isComingSoon: true },
          { id: 'collision', label: 'Collisions & Momentum', isComingSoon: true },
          { id: 'spring', label: 'Spring-Mass System', isComingSoon: true },
          { id: 'pendulum', label: 'Simple Pendulum', isComingSoon: true },
          { id: 'circular', label: 'Circular Motion', isComingSoon: true },
        ],
      },
    },
    {
      key: 'waves',
      section: {
        title: 'Waves & Oscillations',
        icon: <Activity className="w-4 h-4 text-slate-400" />,
        isOpenDefault: false,
        items: [
          { id: 'shm', label: 'Simple Harmonic Motion', isComingSoon: true },
          { id: 'interference', label: 'Wave Interference', isComingSoon: true },
          { id: 'resonance', label: 'Resonance', isComingSoon: true },
          { id: 'doppler', label: 'Doppler Effect', isComingSoon: true },
        ],
      },
    },
    {
      key: 'em',
      section: {
        title: 'Electricity & Magnetism',
        icon: <Zap className="w-4 h-4 text-slate-400" />,
        isOpenDefault: false,
        items: [
          { id: 'lorentz', label: 'Lorentz Force', isComingSoon: true },
          { id: 'circuits', label: 'RLC Circuits', isComingSoon: true },
        ],
      },
    },
    {
      key: 'optics',
      section: {
        title: 'Optics',
        icon: <Eye className="w-4 h-4 text-slate-400" />,
        isOpenDefault: false,
        items: [
          { id: 'snell', label: "Snell's Law & Refraction", isComingSoon: true },
          { id: 'diffraction', label: 'Double-Slit Diffraction', isComingSoon: true },
        ],
      },
    },
    {
      key: 'thermo',
      section: {
        title: 'Thermodynamics',
        icon: <Flame className="w-4 h-4 text-slate-400" />,
        isOpenDefault: false,
        items: [
          { id: 'carnot', label: 'Carnot Heat Engine', isComingSoon: true },
          { id: 'kinetic', label: 'Kinetic Gas Theory', isComingSoon: true },
        ],
      },
    },
    {
      key: 'modern',
      section: {
        title: 'Modern Physics',
        icon: <Binary className="w-4 h-4 text-slate-400" />,
        isOpenDefault: false,
        items: [
          { id: 'photoelectric', label: 'Photoelectric Effect', isComingSoon: true },
          { id: 'bohr', label: 'Bohr Hydrogen Model', isComingSoon: true },
        ],
      },
    },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-14 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col items-center py-4 gap-4 select-none shrink-0 transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Expand modules sidebar"
          aria-label="Expand modules sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <div className="w-8 h-[1px] bg-slate-800" />
        <div
          className="p-2 text-cyan-400 bg-cyan-500/10 rounded-lg border border-cyan-500/30 cursor-pointer"
          title="Active Module: Projectile Motion"
        >
          <Compass className="w-4 h-4" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col select-none shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Module Catalog
        </span>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-2 text-xs">
        {sections.map(({ key, section }) => {
          const isOpen = openSections[key];
          return (
            <div key={key} className="space-y-1">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-medium">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isOpen && (
                <div className="pl-4 pr-1 space-y-0.5 border-l border-slate-800/80 ml-3">
                  {section.items.map((item) => {
                    if (item.isActive) {
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-2.5 py-1.5 text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded font-medium cursor-default"
                        >
                          <span>{item.label}</span>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-cyan-400 font-bold">
                            Live
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-2.5 py-1.5 text-slate-500 hover:text-slate-400 rounded transition-colors cursor-not-allowed group"
                        title="Planned module for upcoming Equation 1 release"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-500 shrink-0">
                          v2
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800/60 bg-[#070a10]">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">EQUATION 1 Engine</span>
          <p className="mt-1 text-slate-500">
            Precision deterministic kinematic integrator with zero numerical drift.
          </p>
        </div>
      </div>
    </aside>
  );
};
