'use client';

import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';
import FlightCards from '@/components/FlightCards';

export default function FlightsScreen({ onShowToast, onSelectFlight }) {
  const { state } = useFlightContext();

  const getFilteredFlights = () => {
    let baseFlights = state.flights.filter(f => {
      const type = f.isHeli ? 'helicopter' : (f.category || 'civil');
      return state.planeTypeFilter?.[type] !== false;
    });

    switch (state.filter) {
      case 'climbing':
        return baseFlights.filter(f => f.vertRate > 200);
      case 'descending':
        return baseFlights.filter(f => f.vertRate < -200);
      case 'cruise':
        return baseFlights.filter(f => Math.abs(f.vertRate) <= 200);
      case 'near':
        return baseFlights.filter(f => f.distKm < 3);
      case 'high':
        return baseFlights.filter(f => f.altitude > 30000);
      default:
        return baseFlights;
    }
  };

  const filtered = getFilteredFlights();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="FLIGHTS" subtitle="ALL AIRCRAFT IN RANGE" liveIndicator />
      <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        {['all', 'climbing', 'descending', 'cruise', 'near', 'high'].map(f => (
          <button
            key={f}
            onClick={() => state.filter !== f && onShowToast(`Filter: ${f}`)}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap flex-shrink-0 border transition-all ${
              state.filter === f
                ? 'bg-cyan/15 border-cyan text-cyan'
                : 'border-cyan/15 text-tdim hover:border-cyan/30'
            }`}
          >
            {f === 'all' && 'All'}
            {f === 'climbing' && '↑ Climbing'}
            {f === 'descending' && '↓ Descending'}
            {f === 'cruise' && '→ Cruise'}
            {f === 'near' && '◎ <3 km'}
            {f === 'high' && '▲ >30k ft'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <FlightCards flights={filtered} selectedFlight={state.selectedFlight} onSelectFlight={onSelectFlight} />
      </div>
    </div>
  );
}
