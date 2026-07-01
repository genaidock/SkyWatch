'use client';

import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function AlertsScreen({ onSelectFlight, onShowToast }) {
  const { state } = useFlightContext();

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'emergency': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'military': return 'border-green-500 bg-green-500/10 text-green-400';
      case 'private': return 'border-purple-500 bg-purple-500/10 text-purple-400';
      default: return 'border-cyan/15 bg-panel text-tmid';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'military': return '🪖';
      case 'private': return '🥂';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="ALERTS" subtitle="NOTIFICATIONS" liveIndicator />
      <div className="flex-1 overflow-y-auto">
        {state.alerts.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-xs text-tdim">No alerts yet</div>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-2">
            {state.alerts.map((a, i) => {
              const catStyle = getCategoryStyles(a.category);
              const icon = getCategoryIcon(a.category);
              
              const handleClick = () => {
                if (!a.flightId) return;
                const flight = state.flights.find(f => f.id === a.flightId);
                if (flight) {
                  onSelectFlight(flight);
                } else {
                  onShowToast('Aircraft has left the radar range.');
                }
              };

              return (
                <div 
                  key={i} 
                  onClick={handleClick}
                  className={`border rounded-xl p-3 ${catStyle} ${a.flightId ? 'cursor-pointer hover:opacity-80 active:scale-[0.98] transition-all' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none mt-0.5">{icon}</span>
                    <div>
                      <div className="text-sm font-medium">{a.message}</div>
                      <div className="text-xs font-mono opacity-70 mt-1">
                        {a.timestamp?.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
