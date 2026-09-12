'use client';

import React from 'react';
import { Flight } from '@/types/flight';

interface CockpitHudOverlayProps {
  flight: Flight;
  onExitChase: () => void;
}

export default function CockpitHudOverlay({ flight, onExitChase }: CockpitHudOverlayProps) {
  const heading = Math.round(flight.heading || 0);
  const altitude = Math.round(flight.altitude || 0);
  const speed = Math.round(flight.speed || 0);
  const vertRate = Math.round(flight.vertRate || 0);

  // Compass ticks around current heading (-30 deg to +30 deg)
  const compassAngles = [-30, -20, -10, 0, 10, 20, 30].map(offset => {
    let ang = (heading + offset + 360) % 360;
    let label: string = String(ang).padStart(3, '0');
    if (ang === 0 || ang === 360) label = 'N';
    else if (ang === 90) label = 'E';
    else if (ang === 180) label = 'S';
    else if (ang === 270) label = 'W';
    return { offset, angle: ang, label };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none overflow-hidden z-20">
      
      {/* ─── Top Bar: Lock Status & Compass Tape & Exit Button ─── */}
      <div className="flex items-start justify-between gap-2">
        {/* Target Lock Banner */}
        <div className="bg-surface/85 backdrop-blur-md border border-cyan/40 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] animate-ping" />
          <div className="font-mono text-xs text-text font-bold tracking-widest flex items-center gap-1.5">
            <span className="text-cyan">TGT LOCK:</span>
            <span>{flight.callsign}</span>
          </div>
          {flight.category === 'military' && (
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-mono rounded font-bold">
              {flight.branch || 'MIL'}
            </span>
          )}
        </div>

        {/* Center Compass Tape */}
        <div className="hidden sm:flex flex-col items-center bg-surface/80 backdrop-blur-md border border-neutral/60 px-4 py-1.5 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 font-mono text-xs text-cyan font-bold tracking-widest">
            {compassAngles.map(({ offset, label }) => (
              <span
                key={offset}
                className={offset === 0 ? 'text-[#00e5ff] scale-125 font-black underline' : 'text-tdim opacity-60 text-[10px]'}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-2 h-1 bg-cyan mt-0.5" />
        </div>

        {/* Exit Chase Mode Button (Touch Target >= 48px) */}
        <button
          type="button"
          onClick={onExitChase}
          aria-label="Exit Cockpit Chase Mode"
          className="pointer-events-auto min-h-[44px] min-w-[110px] px-4 py-2 bg-[#ff003c]/20 hover:bg-[#ff003c]/30 text-[#ff4d6d] hover:text-white border border-[#ff003c]/50 rounded-xl font-mono text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all duration-150 shadow-lg active:scale-95"
        >
          <span>✕</span>
          <span>EXIT CHASE</span>
        </button>
      </div>

      {/* ─── Center Display: Artificial Horizon & Crosshairs ─── */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        {/* Speed Tape (Left) */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-start bg-surface/85 backdrop-blur-md border border-cyan/30 px-2.5 py-3 rounded-xl shadow-lg font-mono">
          <span className="text-[9px] text-tdim font-bold uppercase tracking-wider">AIRSPEED</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-text">{speed}</span>
            <span className="text-[10px] text-cyan font-bold">KT</span>
          </div>
          <div className="w-full h-0.5 bg-cyan/40 my-1" />
          <span className="text-[10px] text-tdim">MACH {(speed / 661).toFixed(2)}</span>
        </div>

        {/* Center Reticle */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Pitch Ladder Marks */}
          <div className="absolute w-24 h-0.5 bg-cyan/40 -top-8" />
          <div className="absolute w-16 h-0.5 bg-cyan/20 -top-16" />
          <div className="absolute w-24 h-0.5 bg-cyan/40 -bottom-8" />
          <div className="absolute w-16 h-0.5 bg-cyan/20 -bottom-16" />

          {/* Central Crosshair */}
          <div className="w-10 h-10 border border-cyan/60 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan rounded-full shadow-[0_0_8px_#00e5ff]" />
          </div>
          {/* Horizon Wings */}
          <div className="absolute w-20 h-0.5 bg-cyan/70 left-2" />
          <div className="absolute w-20 h-0.5 bg-cyan/70 right-2" />
        </div>

        {/* Altitude Ladder (Right) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end bg-surface/85 backdrop-blur-md border border-cyan/30 px-2.5 py-3 rounded-xl shadow-lg font-mono">
          <span className="text-[9px] text-tdim font-bold uppercase tracking-wider">ALTITUDE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-text">{altitude.toLocaleString()}</span>
            <span className="text-[10px] text-cyan font-bold">FT</span>
          </div>
          <div className="w-full h-0.5 bg-cyan/40 my-1" />
          <div className="flex items-center gap-1 text-[10px]">
            <span className={vertRate >= 0 ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
              {vertRate >= 0 ? '▲' : '▼'} {Math.abs(vertRate)}
            </span>
            <span className="text-tdim">FPM</span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar: Telemetry Readout Strip ─── */}
      <div className="bg-surface/90 backdrop-blur-md border border-neutral/70 px-4 py-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm font-black text-text tracking-wide">
            {flight.type || 'AIRCRAFT'}
          </div>
          <span className="text-neutral">•</span>
          <div className="font-mono text-xs text-tdim">
            HDG <span className="text-cyan font-bold">{heading}°</span>
          </div>
          <span className="text-neutral">•</span>
          <div className="font-mono text-xs text-tdim">
            SQK <span className="text-text font-bold">{flight.squawk || '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="text-tdim">
            ROUTE: <span className="text-text font-bold">{flight.from?.code || '—'} → {flight.to?.code || '—'}</span>
          </div>
          <span className="text-neutral">•</span>
          <div className="text-tdim">
            DIST: <span className="text-cyan font-bold">{flight.distKm?.toFixed(1) ?? '—'} km</span>
          </div>
        </div>
      </div>

    </div>
  );
}
