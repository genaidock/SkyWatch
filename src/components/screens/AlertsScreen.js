'use client';

import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function AlertsScreen() {
  const { state } = useFlightContext();

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
            {state.alerts.map((a, i) => (
              <div key={i} className="bg-panel border border-cyan/15 rounded-xl p-3">
                <div className="text-sm text-tmid">{a.message}</div>
                <div className="text-xs font-mono text-tdim mt-1">
                  {a.timestamp?.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
