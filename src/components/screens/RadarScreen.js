'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import Header from '@/components/Header';
import LocationBar from '@/components/LocationBar';
import ApiStatus from '@/components/ApiStatus';
import RadarMapBackground from '@/components/RadarMapBackground';
import RadarCanvas from '@/components/RadarCanvas';

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return h + ':' + m;
}

export default function RadarScreen({ onShowToast, onLocationClick, onSelectFlight }) {
  const { state, trailsRef, recenterLocation } = useFlightContext();
  const [timeStr, setTimeStr] = useState('--:--');

  useEffect(() => {
    const update = () => setTimeStr(formatTime(new Date()));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const maxAlt = state.flights.length > 0 ? Math.max(...state.flights.map(f => f.altitude || 0)) : 0;
  const isDemo = state.flights.length > 0 && state.flights.every(f => f.isDemo);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#020a10]">
      {/* ── Original Top Bars ── */}
      <Header title="SKYWATCH" subtitle="See flights around us...!!!" liveIndicator />
      <LocationBar location={state.locationLabel} onLocationClick={onLocationClick} onRecenter={recenterLocation} apiStatus={state.apiStatus} />
      {isDemo && (
        <div className="mx-3 mt-1 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-lg text-yellow-400 text-xs font-mono text-center animate-pulse flex-shrink-0">
          ⚠ DEMO MODE — No live data. Check API status above.
        </div>
      )}

      {/* ── 3-column body ── */}
      <div className="flex flex-1 overflow-hidden mt-1">

        {/* LEFT PANEL (Stats) */}
        <div className="flex flex-col justify-center items-center gap-6 px-2 py-3 flex-shrink-0 w-[72px]">
          <div className="text-center">
            <div className="font-mono font-bold text-xl text-cyan drop-shadow-[0_0_8px_#00c8ff] leading-none">{state.flights.length}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">AIRCRAFT</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan/80 drop-shadow-[0_0_6px_#00c8ff] leading-none">{state.radius}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">RADIUS</div>
          </div>
        </div>

        {/* CENTER – RADAR */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-1">
          <div
            className="radar-map-container relative touch-none select-none"
            style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', background: '#040d14' }}
          >
            {state.userLat === null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040d14] z-50">
                <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,200,255,0.5)]" />
                <div className="text-cyan font-mono text-sm tracking-widest animate-pulse">ACQUIRING GPS...</div>
              </div>
            ) : (
              <>
                <RadarMapBackground userLat={state.userLat} userLon={state.userLon} radius={state.radius} />
                <RadarCanvas
                  flights={state.flights}
                  selectedFlight={state.selectedFlight}
                  userLat={state.userLat}
                  userLon={state.userLon}
                  radius={state.radius}
                  onSelectFlight={onSelectFlight}
                  trailsRef={trailsRef}
                />
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (Stats & Legend) */}
        <div className="flex flex-col justify-center items-center gap-6 px-2 py-3 flex-shrink-0 w-[72px]">
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan/80 drop-shadow-[0_0_6px_#00c8ff] leading-none">
              {maxAlt > 0 ? (maxAlt / 1000).toFixed(1) + 'k' : '-'}
            </div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">MAX ALT</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff] leading-none">{timeStr}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">UPDATED</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          
          {/* Original Legend Restored */}
          <div className="flex flex-col gap-3 items-center mt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_8px_rgba(0,255,157,0.6)]" />
              <div className="text-[8px] font-mono text-cyan/40 tracking-wider text-center leading-tight">CRUISING</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,59,59,0.6)]" />
              <div className="text-[8px] font-mono text-cyan/40 tracking-wider text-center leading-tight">&lt; 3000FT</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_8px_rgba(255,179,0,0.6)]" />
              <div className="text-[8px] font-mono text-cyan/40 tracking-wider text-center leading-tight">GND/SEL</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
