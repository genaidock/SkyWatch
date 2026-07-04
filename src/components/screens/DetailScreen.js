'use client';

import { useFlightContext } from '@/context/FlightContext';
import { getAircraftInfo } from '@/lib/utils';

function DetailItem({ label, value }) {
  return (
    <div className="bg-surface border border-cyan/10 rounded-2xl p-3">
      <div className="text-[10px] text-tdim uppercase tracking-[0.32em] mb-2">{label}</div>
      <div className="font-mono text-sm text-white">{value}</div>
    </div>
  );
}

export default function DetailScreen({ onBack }) {
  const { state, setSelectedFlight } = useFlightContext();
  const f = state.selectedFlight;

  if (!f) return null;

  const ac = getAircraftInfo(f.type);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan/15 flex-shrink-0">
        <button
          onClick={() => {
            setSelectedFlight(null);
            onBack?.();
          }}
          className="text-2xl text-cyan cursor-pointer"
        >
          ‹
        </button>
        <div className="font-mono font-black text-2xl text-white tracking-widest flex-1">
          {f.callsign}
        </div>
        <div className="w-2 h-2 rounded-full bg-green glow-animation"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-panel border border-cyan/15 rounded-3xl p-4 space-y-3">
          <div className="text-xs text-tdim uppercase tracking-widest">Route</div>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="From" value={f.from?.code && f.from?.code !== '—' ? `${f.from.code} · ${f.from.city}` : 'Not Available'} />
            <DetailItem label="To" value={f.to?.code && f.to?.code !== '—' ? `${f.to.code} · ${f.to.city}` : 'Not Available'} />
            <DetailItem label="Source" value={f.source || '—'} />
            <DetailItem label="Distance" value={`${f.distKm?.toFixed?.(1) ?? '—'} km`} />
          </div>
          {(!f.from?.code || f.from?.code === '—') && (
            <div className="flex gap-2 mt-4">
              <a
                href={`https://flightaware.com/live/flight/${f.callsign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-surface border border-cyan/15 rounded-xl py-2 text-xs font-mono text-cyan hover:bg-cyan/10 transition-colors"
              >
                🔍 FlightAware
              </a>
              <a
                href={`https://www.flightradar24.com/${f.callsign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-surface border border-cyan/15 rounded-xl py-2 text-xs font-mono text-cyan hover:bg-cyan/10 transition-colors"
              >
                🔍 FlightRadar24
              </a>
            </div>
          )}
        </div>

        <div className="bg-panel border border-cyan/15 rounded-3xl p-4 space-y-3">
          <div className="text-xs text-tdim uppercase tracking-widest">Flight Details</div>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="ICAO24" value={f.icao24 || '—'} />
            <DetailItem label="Registration" value={f.reg || '—'} />
            <DetailItem label="Airline" value={f.country || '—'} />
            <DetailItem label="Aircraft" value={(ac && ac.maker !== '—' ? ac.full : (f.desc || f.type)) || '—'} />
            <DetailItem label="Altitude" value={`${f.altitude?.toLocaleString?.() ?? '—'} ft`} />
            <DetailItem label="Speed" value={`${f.speed ?? '—'} kt`} />
            <DetailItem label="Heading" value={`${f.heading ?? '—'}°`} />
            <DetailItem label="Vertical Rate" value={`${f.vertRate ?? '—'} ft/m`} />
            <DetailItem label="Squawk" value={f.squawk || '—'} />
            <DetailItem label="Status" value={f.onGround ? 'On Ground' : 'Airborne'} />
          </div>
        </div>
      </div>
    </div>
  );
}
