'use client';

import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import StatBar from '@/components/StatBar';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import RadarCanvas from '@/components/RadarCanvas';
import FlightCards from '@/components/FlightCards';

export default function RadarScreen({ onShowToast, onLocationClick, onSelectFlight }) {
  const { state, trailsRef, recenterLocation } = useFlightContext();

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
        <RadarCanvas
          flights={state.flights}
          selectedFlight={state.selectedFlight}
          userLat={state.userLat}
          userLon={state.userLon}
          radius={state.radius}
          onSelectFlight={onSelectFlight}
          trailsRef={trailsRef}
        />
        <div className="px-3 py-2">
          <div className="text-xs font-mono text-cyan tracking-widest">NEARBY AIRCRAFT</div>
        </div>
        <FlightCards flights={state.flights} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
