'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import { getAircraftInfo } from '@/lib/utils';
import { fetchAircraftDetails } from '@/lib/flightApi';
import airlineMappings from '@/lib/airlineMappings.json';

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

  const [acDetails, setAcDetails] = useState(null);

  useEffect(() => {
    let active = true;
    if (f?.icao24) {
      setAcDetails(null);
      fetchAircraftDetails(f.icao24).then(data => {
        if (active && data) setAcDetails(data);
      });
    }
    return () => { active = false; };
  }, [f?.icao24]);

  const ac = getAircraftInfo(f.type);
  
  // Use fetched aircraft details if available, fallback to basic logic
  const displayReg = acDetails?.registration || f.reg || '—';
  const displayCountry = acDetails?.registered_owner_country_name || f.country || '—';
  const displayMaker = acDetails?.manufacturer || (ac && ac.maker !== '—' ? ac.maker : null);
  const displayModel = acDetails?.type || (ac && ac.maker !== '—' ? ac.model : f.desc || f.type);
  const displayAircraft = displayMaker ? `${displayMaker} ${displayModel}` : displayModel || '—';
  const displayOwner = acDetails?.registered_owner || (f.airlineObj ? f.airlineObj.name : '—');

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan/15 flex-shrink-0">
        <button
          onClick={() => {
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
          <div className="relative flex items-center justify-center mb-4 mt-1 min-h-[40px]">
            <div className="absolute left-0 text-xs text-tdim uppercase tracking-widest">Route</div>
            {f.airlineObj && (
              <div className="flex items-center gap-3 text-sm text-cyan font-mono bg-cyan/10 px-4 py-2 rounded-xl border border-cyan/20 shadow-sm">
                {(airlineMappings[f.airlineObj.icao] || airlineMappings[f.airlineObj.iata]) && (
                  <img 
                    src={`/airlines/assets/${airlineMappings[f.airlineObj.icao] || airlineMappings[f.airlineObj.iata]}/icon.svg`} 
                    alt={f.airlineObj.name} 
                    className="h-6 w-auto object-contain"
                  />
                )}
                <span>{f.airlineObj.name} {f.airlineObj.callsign ? `("${f.airlineObj.callsign}")` : ''}</span>
              </div>
            )}
          </div>
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
            <DetailItem label="Registration" value={displayReg} />
            <DetailItem label="Owner/Airline" value={displayOwner} />
            <DetailItem label="Country" value={displayCountry} />
            <DetailItem label="Aircraft" value={displayAircraft} />
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
