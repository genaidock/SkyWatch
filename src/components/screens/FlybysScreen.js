'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';
import { calculateFlybys } from '@/lib/utils';
import airlineMappings from '@/lib/airlineMappings.json';
import { getAircraftInfo } from '@/lib/utils';

export default function FlybysScreen({ onSelectFlight }) {
  const { state } = useFlightContext();

  const flybys = useMemo(() => {
    return calculateFlybys(state.flights, state.userLat, state.userLon, 15);
  }, [state.flights, state.userLat, state.userLon]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="FLYBYS" subtitle="INCOMING AIRCRAFT (15 KM RADIUS)" liveIndicator />
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {flybys.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-4 opacity-50">🔭</div>
            <div className="text-sm text-tdim">No incoming flybys predicted right now.<br/>Wait for planes to head your way.</div>
          </div>
        ) : (
          flybys.map((f, i) => {
            const ac = getAircraftInfo(f.type);
            const airlineObj = airlineMappings[f.icao24] || airlineMappings[f.callsign?.substring(0, 3)] || f.airlineObj || null;
            
            // ETA formatting
            const mins = Math.max(1, Math.round(f.etaMin));
            
            return (
              <div 
                key={f.id} 
                onClick={() => onSelectFlight(f)}
                className="bg-panel border border-cyan/15 rounded-xl p-4 cursor-pointer hover:border-cyan/40 transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-bold text-lg text-white">{f.callsign || f.reg || 'UNKNOWN'}</div>
                    {airlineObj && (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {airlineObj.logo ? (
                          <img src={airlineObj.logo} alt="logo" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="text-[10px]">✈️</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-cyan font-bold font-mono bg-cyan/10 px-2 py-1 rounded-md text-sm shadow-sm border border-cyan/20">
                    IN {mins} MIN
                  </div>
                </div>
                
                <div className="text-sm text-tmid mb-3">
                  {ac.full}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/20 rounded p-2 border border-white/5">
                    <div className="text-[10px] text-tdim tracking-wider uppercase mb-1">Passes Within</div>
                    <div className="text-sm font-mono text-white">{f.cpaDist.toFixed(1)} km</div>
                  </div>
                  <div className="bg-black/20 rounded p-2 border border-white/5">
                    <div className="text-[10px] text-tdim tracking-wider uppercase mb-1">Direction</div>
                    <div className="text-sm font-mono text-white">{f.approachDir}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
