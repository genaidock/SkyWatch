'use client';

import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import StatBar from '@/components/StatBar';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import RadarCanvas from '@/components/RadarCanvas';
import FlightCards from '@/components/FlightCards';

export default function RadarScreen({ onShowToast, onLocationClick, onSelectFlight }) {
  const { state } = useFlightContext();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="SKYWATCH" subtitle="See flights around us...!!!" liveIndicator />
      <StatBar flights={state.flights.length} radius={state.radius} />
      <LocationBar location={state.locationLabel} onShowToast={onShowToast} onLocationClick={onLocationClick} />
      <ApiStatus status={state.apiStatus} />
      <div className="flex-1 overflow-y-auto">
        <RadarCanvas
          flights={state.flights}
          selectedFlight={state.selectedFlight}
          userLat={state.userLat}
          userLon={state.userLon}
          radius={state.radius}
          onSelectFlight={onSelectFlight}
        />
        <div className="px-3 py-2">
          <div className="text-xs font-mono text-cyan tracking-widest">NEARBY AIRCRAFT</div>
        </div>
        <FlightCards flights={state.flights} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
