'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import MapLibreRadar from '@/components/MapLibreRadar';
import SensorModeSelector from '@/components/SensorModeSelector';

export default function RadarScreen({ onShowToast, onLocationClick, onSelectFlight }) {
  const { state, setSelectedFlight, trailsRef, recenterLocation, setSensorMode, setChaseMode, setViewport } = useFlightContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleFlights = state.flights.filter(f => {
    const type = f.isHeli ? 'helicopter' : (f.category || 'civil');
    return state.planeTypeFilter?.[type] !== false;
  });

  const isDemo = state.flights.length > 0 && state.flights.every(f => f.isDemo);
  const selected = state.selectedFlight;

  return (
    <div className={`relative w-full h-full flex-1 overflow-hidden select-none bg-neutral/20 ${
      state.sensorMode && state.sensorMode !== 'normal' ? `sensor-${state.sensorMode}` : ''
    }`}>
      {state.userLat === null ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4 shadow-lg shadow-cyan/20"></div>
          <div className="text-cyan font-mono text-sm tracking-widest animate-pulse">ACQUIRING GPS...</div>
        </div>
      ) : (
        <>
          {/* ─── 100% Fullscreen Map ─── */}
          <MapLibreRadar
            flights={visibleFlights}
            selectedFlight={selected}
            userLat={state.userLat}
            userLon={state.userLon}
            radius={state.radius}
            recenterTrigger={state.recenterTrigger}
            onSelectFlight={(flight) => {
              setSelectedFlight(flight);
            }}
            isChaseMode={state.isChaseMode}
            onExitChase={() => setChaseMode(false)}
            onViewportChange={(centerLat, centerLon, radiusKm, isPanned) => {
              setViewport(centerLat, centerLon, radiusKm, isPanned);
            }}
            trailsRef={trailsRef}
            sensorMode={state.sensorMode}
          />

          {/* ─── Floating Top HUD Bar ─── */}
          <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2">
            {/* Title & Pulse Indicator */}
            <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 bg-surface/85 backdrop-blur-md border border-neutral/60 rounded-2xl shadow-lg shadow-black/20">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping absolute opacity-75" />
                <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#00e5ff]" />
              </div>
              <span className="font-display font-black text-sm tracking-wider text-text">SKYWATCH</span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
                v7.0
              </span>
              <div className="w-px h-3.5 bg-neutral/80 mx-0.5" />
              <span className="font-mono text-xs font-bold text-text/80">
                {visibleFlights.length} <span className="text-[10px] text-tdim">AIRBORNE</span>
              </span>
            </div>

            {/* Right: Location & Sensor Vision Controls */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* Location Badge / Re-center Button */}
              {state.viewport?.isPanned ? (
                <button
                  type="button"
                  onClick={recenterLocation}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/90 hover:bg-amber-500 text-black font-mono text-xs font-bold rounded-2xl shadow-lg transition-all animate-pulse cursor-pointer"
                  title="Recenter radar to home location"
                >
                  <span>⌖</span>
                  <span>HOME</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLocationClick}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-surface/85 backdrop-blur-md border border-neutral/60 text-text font-mono text-xs rounded-2xl shadow-lg hover:bg-neutral/40 transition-colors cursor-pointer"
                >
                  <span className="text-cyan">📍</span>
                  <span className="truncate max-w-[120px]">{state.locationLabel}</span>
                </button>
              )}

              {/* Sensor Mode Selector */}
              <SensorModeSelector
                currentMode={state.sensorMode || 'normal'}
                onSelectMode={(mode) => setSensorMode(mode)}
              />
            </div>
          </div>

          {/* Demo Mode Alert Banner */}
          {isDemo && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-3 py-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/40 rounded-xl text-yellow-400 text-xs font-mono shadow-lg">
              ⚠ DEMO MODE — Showing synthetic radar targets
            </div>
          )}

          {/* ─── Floating Selected Flight Quick-Intel HUD Card ─── */}
          {selected && !state.isChaseMode && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="bg-surface/90 backdrop-blur-xl border border-cyan/40 shadow-2xl shadow-black/40 rounded-2xl p-3.5 flex flex-col gap-2.5">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-base tracking-wider text-text">
                      {selected.callsign || selected.icao24 || 'UNKNOWN'}
                    </span>
                    {selected.category && selected.category !== 'civil' && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        selected.category === 'military' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        selected.category === 'cargo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        selected.category === 'helicopter' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/40' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      }`}>
                        {selected.category}
                      </span>
                    )}
                    {selected.type && selected.type !== '—' && (
                      <span className="text-[10px] font-mono text-tdim">
                        {selected.type}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFlight(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-tdim hover:text-text hover:bg-neutral/40 transition-colors text-xs font-bold cursor-pointer"
                    aria-label="Close selection"
                  >
                    ✕
                  </button>
                </div>

                {/* Route Row */}
                <div className="flex items-center justify-between text-xs font-mono bg-neutral/25 px-2.5 py-1.5 rounded-xl border border-neutral/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-tdim">FROM:</span>
                    <span className="font-bold text-text">{selected.from?.code && selected.from.code !== '—' ? selected.from.code : 'UNKNOWN'}</span>
                  </div>
                  <span className="text-cyan">➔</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-tdim">TO:</span>
                    <span className="font-bold text-text">{selected.to?.code && selected.to.code !== '—' ? selected.to.code : 'UNKNOWN'}</span>
                  </div>
                </div>

                {/* Telemetry Row */}
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                  <div className="bg-neutral/20 py-1 px-1.5 rounded-lg border border-neutral/30">
                    <div className="text-[9px] text-tdim">ALTITUDE</div>
                    <div className="text-xs font-bold text-cyan">{selected.altitude ? `${selected.altitude.toLocaleString()}ft` : '—'}</div>
                  </div>
                  <div className="bg-neutral/20 py-1 px-1.5 rounded-lg border border-neutral/30">
                    <div className="text-[9px] text-tdim">SPEED</div>
                    <div className="text-xs font-bold text-text">{selected.speed ? `${selected.speed}kt` : '—'}</div>
                  </div>
                  <div className="bg-neutral/20 py-1 px-1.5 rounded-lg border border-neutral/30">
                    <div className="text-[9px] text-tdim">HEADING</div>
                    <div className="text-xs font-bold text-text">{selected.heading ? `${selected.heading}°` : '—'}</div>
                  </div>
                  <div className="bg-neutral/20 py-1 px-1.5 rounded-lg border border-neutral/30">
                    <div className="text-[9px] text-tdim">SQUAWK</div>
                    <div className="text-xs font-bold text-amber-400">{selected.squawk || '—'}</div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setChaseMode(true)}
                    className="flex-1 py-2 px-3 bg-cyan hover:bg-cyan/90 text-black font-mono text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>CHASE 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectFlight(selected)}
                    className="flex-1 py-2 px-3 bg-surface hover:bg-neutral/50 border border-neutral text-text font-mono text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>ℹ️</span>
                    <span>FULL INTEL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tactical Scanlines / Vignette Filter Overlays */}
          {(state.sensorMode === 'nvg' || state.sensorMode === 'crt') && (
            <div className="absolute inset-0 scanlines-overlay pointer-events-none z-10" />
          )}
          {(state.sensorMode === 'flir' || state.sensorMode === 'nvg') && (
            <div className="absolute inset-0 vignette-overlay pointer-events-none z-10" />
          )}
        </>
      )}
    </div>
  );
}
