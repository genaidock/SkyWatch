'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import StatBar from '@/components/StatBar';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import MapLibreRadar from '@/components/MapLibreRadar';
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
          className="radar-map-container relative w-full h-[55vh] min-h-[400px] flex-shrink-0 touch-none select-none overflow-hidden bg-neutral/20 border-b border-cyan/20 shadow-sm"
        >
          {state.userLat === null ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-50">
              <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4 shadow-lg shadow-cyan/20"></div>
              <div className="text-cyan font-mono text-sm tracking-widest animate-pulse">ACQUIRING GPS...</div>
            </div>
          ) : (
            <>
              <MapLibreRadar
                flights={state.flights}
                selectedFlight={state.selectedFlight}
                userLat={state.userLat}
                userLon={state.userLon}
                radius={state.radius}
                recenterTrigger={state.recenterTrigger}
                onSelectFlight={onSelectFlight}
              />
            </>
          )}
        </div>

        <div className="px-3 py-2">
          {/* Legend */}
          <div className="flex flex-col gap-2 w-fit max-w-[95%] mx-auto mt-1 mb-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-mono text-tmid justify-center bg-surface border border-neutral rounded-xl py-2 px-3 shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-sm"></div> <span>Cruising</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff003c] shadow-sm"></div> <span>&lt; 3000ft</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffaa00] shadow-sm"></div> <span>Ground / Sel</span></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-mono text-tmid justify-center bg-surface border border-neutral rounded-xl py-2 px-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-civil"></div>
                 <span className="text-text">Civil</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-cargo"></div>
                 <span className="text-text">Cargo</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-private"></div>
                 <span className="text-text">Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-military"></div>
                 <span className="text-text">Military</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14]"></div>
                 <span className="text-text">Heli</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-mono text-text font-bold tracking-widest">NEARBY AIRCRAFT</div>
        </div>
        <FlightCards flights={state.flights} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
