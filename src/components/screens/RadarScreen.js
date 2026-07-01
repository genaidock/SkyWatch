'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import StatBar from '@/components/StatBar';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import dynamic from 'next/dynamic';
import FlightCards from '@/components/FlightCards';

const RadarMapBackground = dynamic(() => import('@/components/RadarMapBackground'), { ssr: false });
const RadarCanvas = dynamic(() => import('@/components/RadarCanvas'), { ssr: false });

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
          className="radar-map-container relative mx-auto flex-shrink-0"
          style={{
            width: '100%',
            maxWidth: 'min(100%, 60vh)',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#040d14',
          }}
        >
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
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/40">W</div>
          </div>
        </div>

        <div className="px-3 py-2">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-tdim mt-1 mb-5 justify-center bg-panel border border-cyan/15 rounded-xl py-2 px-3 mx-auto w-fit">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_8px_rgba(0,255,157,0.6)]"></div> <span className="pt-0.5">Cruising</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,59,59,0.6)]"></div> <span className="pt-0.5">&lt; 3000ft</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_8px_rgba(255,179,0,0.6)]"></div> <span className="pt-0.5">Ground / Sel</span></div>
          </div>
          <div className="text-xs font-mono text-cyan tracking-widest">NEARBY AIRCRAFT</div>
        </div>
        <FlightCards flights={state.flights} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
