'use client';

import React from 'react';
import { SensorMode } from '@/types/flight';

interface SensorModeSelectorProps {
  currentMode: SensorMode;
  onSelectMode: (mode: SensorMode) => void;
}

const MODES: Array<{ id: SensorMode; label: string; tag: string; color: string; desc: string }> = [
  { id: 'normal', label: 'NRM', tag: 'Vector', color: '#00e5ff', desc: 'Standard Tactical Map' },
  { id: 'nvg', label: 'NVG', tag: 'Night', color: '#39ff14', desc: 'Night Vision Goggles' },
  { id: 'flir', label: 'FLIR', tag: 'Thermal', color: '#ff3366', desc: 'Forward-Looking IR' },
  { id: 'crt', label: 'CRT', tag: 'Radar', color: '#ffb300', desc: 'Phosphor Radar Tube' },
];

export default function SensorModeSelector({ currentMode, onSelectMode }: SensorModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tactical Sensor Vision Mode"
      className="flex items-center gap-1 bg-surface/90 backdrop-blur-md border border-neutral/60 p-1 rounded-2xl shadow-lg pointer-events-auto"
    >
      <div className="hidden sm:flex items-center pl-2 pr-1 text-[9px] font-mono tracking-widest text-tdim font-bold uppercase select-none">
        SENSOR:
      </div>
      {MODES.map((m) => {
        const isSelected = currentMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${m.label} - ${m.desc}`}
            onClick={() => onSelectMode(m.id)}
            className={`min-w-[44px] min-h-[36px] px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 select-none ${
              isSelected
                ? 'bg-neutral text-text shadow-sm border border-neutral/80'
                : 'text-tdim hover:text-text hover:bg-neutral/40'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: isSelected ? m.color : '#64748b',
                boxShadow: isSelected ? `0 0 8px ${m.color}` : 'none',
              }}
            />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
