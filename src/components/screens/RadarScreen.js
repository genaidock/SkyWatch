'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import StatBar from '@/components/StatBar';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import RadarMapBackground from '@/components/RadarMapBackground';
import RadarCanvas from '@/components/RadarCanvas';
import FlightCards from '@/components/FlightCards';

export default function RadarScreen({ onShowToast, onLocationClick, onSelectFlight }) {
  const { state, trailsRef, recenterLocation } = useFlightContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxAlt = state.flights.length > 0 ? Math.max(...state.flights.map(f => f.altitude || 0)) : 0;
  const isDemo = state.flights.length > 0 && state.flights.every(f => f.isDemo);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="SKYWATCH" subtitle="See flights around us...!!!" liveIndicator />
      <StatBar flights={state.flights.length} radius={state.radius} maxAlt={maxAlt} />
      <LocationBar location={state.locationLabel} onLocationClick={onLocationClick} onRecenter={recenterLocation} />
      <ApiStatus status={state.apiStatus} />
      {isDemo && (
        <div className="mx-3 mt-1 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-lg text-yellow-400 text-xs font-mono text-center animate-pulse">
          ⚠ DEMO MODE — No live data. Check API status above.
        </div>
      )}
      <div className="flex-1 overflow-y-auto">

        {/* ─── Radar + Map container ─── */}
        <div
          className="radar-map-container relative mx-auto flex-shrink-0 touch-none select-none"
          style={{
            width: '100%',
            maxWidth: 'min(100%, 60vh)',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#040d14',
          }}
        >
          {state.userLat === null ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040d14] z-50">
              <div className="w-12 h-12 border-4 border-[#00e5ff]/20 border-t-[#00e5ff] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
              <div className="text-[#00e5ff] font-mono text-sm tracking-widest animate-pulse">ACQUIRING GPS...</div>
            </div>
          ) : (
            <>
              {/* Layer 0 – Map tiles (always render to avoid hydration mismatch) */}
              <RadarMapBackground
                userLat={state.userLat}
                userLon={state.userLon}
                radius={state.radius}
              />

          {/* Layer 1 – Radar canvas (transparent bg, draws on top of map) */}
          <RadarCanvas
            flights={state.flights}
            selectedFlight={state.selectedFlight}
            userLat={state.userLat}
            userLon={state.userLon}
            radius={state.radius}
            onSelectFlight={onSelectFlight}
            trailsRef={trailsRef}
          />

          {/* Layer 2 – Compass labels */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/40">N</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/40">S</div>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/40">E</div>
          </div>
            </>
          )}
        </div>

        <div className="px-3 py-2">
          {/* Legend */}
          <div className="flex flex-col gap-2 w-fit max-w-[95%] mx-auto mt-1 mb-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-mono text-tdim justify-center bg-panel border border-neutral/15 rounded-xl py-2 px-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)]"></div> <span className="pt-0.5">Cruising</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_8px_rgba(255,0,60,0.6)]"></div> <span className="pt-0.5">&lt; 3000ft</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.6)]"></div> <span className="pt-0.5">Ground / Sel</span></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-mono text-tdim justify-center bg-panel border border-neutral/15 rounded-xl py-2 px-3">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff] shadow-[0_0_8px_#ffffff]"></div>
                 <span className="pt-0.5 text-neutral">Civil</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]"></div>
                 <span className="pt-0.5 text-neutral">Cargo</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#8a2be2] shadow-[0_0_8px_#8a2be2]"></div>
                 <span className="pt-0.5 text-neutral">Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#cc0000] shadow-[0_0_8px_#cc0000]"></div>
                 <span className="pt-0.5 text-neutral">Military</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]"></div>
                 <span className="pt-0.5 text-neutral">Heli</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-mono text-neutral tracking-widest">NEARBY AIRCRAFT</div>
        </div>
        <FlightCards flights={state.flights} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
