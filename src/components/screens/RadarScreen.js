'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
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

  const apiDotClass = {
    live:    'bg-green shadow-[0_0_6px_#00ff9d]',
    ok:      'bg-green shadow-[0_0_6px_#00ff9d]',
    demo:    'bg-amber shadow-[0_0_6px_#ffb300]',
    loading: 'bg-cyan shadow-[0_0_6px_#00c8ff]',
    warning: 'bg-amber shadow-[0_0_6px_#ffb300]',
    error:   'bg-red-500 shadow-[0_0_6px_#ff3b3b]',
    err:     'bg-red-500 shadow-[0_0_6px_#ff3b3b]',
  };
  const dotCls = apiDotClass[state.apiStatus?.type] || apiDotClass.demo;
  const statusLabel = isDemo ? 'DEMO' :
    (state.apiStatus?.type === 'ok' || state.apiStatus?.type === 'live') ? 'LIVE' :
    (state.apiStatus?.type || '').toUpperCase();

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#020a10]">

      {/* ── Compact top strip ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan/15 bg-gradient-to-b from-cyan/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-sm text-cyan tracking-widest drop-shadow-[0_0_12px_rgba(0,200,255,0.5)]">
            SKYWATCH
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono text-green border border-green/30 px-1.5 py-0.5 rounded-full bg-green/10">
            <div className="w-1 h-1 rounded-full bg-green animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono text-cyan/70 truncate max-w-[130px]">
            {state.locationLabel || 'Acquiring...'}
          </span>
          <button
            onClick={onLocationClick}
            className="text-[10px] font-mono text-cyan border border-cyan/20 px-1.5 py-0.5 rounded bg-cyan/10 hover:bg-cyan/20 transition-colors flex-shrink-0"
          >
            LOC
          </button>
          <button
            onClick={recenterLocation}
            className="text-[10px] font-mono text-cyan border border-cyan/20 px-1.5 py-0.5 rounded bg-cyan/10 hover:bg-cyan/20 transition-colors flex-shrink-0"
          >
            ↺
          </button>
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center items-center gap-4 px-2 py-3 flex-shrink-0 w-[72px]">
          <div className="text-center">
            <div className="font-mono font-bold text-xl text-cyan drop-shadow-[0_0_8px_#00c8ff] leading-none">{state.flights.length}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">A/C</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan/80 drop-shadow-[0_0_6px_#00c8ff] leading-none">{state.radius}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">KM</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="flex flex-col items-center gap-1">
            <div className={'w-2 h-2 rounded-full ' + dotCls} />
            <div className="text-[8px] font-mono text-cyan/30 tracking-wider text-center">{statusLabel}</div>
          </div>
          {isDemo && (
            <>
              <div className="w-8 h-px bg-cyan/10" />
              <div className="text-center">
                <div className="text-amber text-base animate-pulse">!</div>
                <div className="text-[8px] font-mono text-amber/60 tracking-wider mt-0.5">DEMO</div>
              </div>
            </>
          )}
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
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/40">N</div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/40">S</div>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/40">E</div>
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/40">W</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-center items-center gap-4 px-2 py-3 flex-shrink-0 w-[72px]">
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan/80 drop-shadow-[0_0_6px_#00c8ff] leading-none">
              {maxAlt > 0 ? (maxAlt / 1000).toFixed(1) + 'k' : '-'}
            </div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">MAX FT</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="text-center">
            <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff] leading-none">{timeStr}</div>
            <div className="text-[9px] font-mono text-cyan/40 tracking-widest mt-1">TIME</div>
          </div>
          <div className="w-8 h-px bg-cyan/10" />
          <div className="flex flex-col gap-2.5 items-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_6px_rgba(0,255,157,0.7)]" />
              <div className="text-[7.5px] font-mono text-cyan/30 tracking-wider">CIVIL</div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(255,136,0,0.7)]" style={{ background: '#ff8800' }} />
              <div className="text-[7.5px] font-mono text-cyan/30 tracking-wider">CARGO</div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(255,0,0,0.7)]" />
              <div className="text-[7.5px] font-mono text-cyan/30 tracking-wider">MIL</div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(0,229,255,0.7)]" style={{ background: '#00e5ff' }} />
              <div className="text-[7.5px] font-mono text-cyan/30 tracking-wider">PRVT</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

