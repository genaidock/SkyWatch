'use client';

import { INDIA_AIRPORTS, GLOBAL_AIRPORTS } from '@/lib/utils';
import { useState } from 'react';
import { useFlightContext } from '@/context/FlightContext';

export default function LocationModal({ show, onClose }) {
  const { state, setLocation } = useFlightContext();
  const [manLat, setManLat] = useState('');
  const [manLon, setManLon] = useState('');

  const handlePickAirport = (lat, lon, code, name) => {
    setLocation(lat, lon, `📍 ${code} — ${name}`);
    onClose();
  };

  const handlePickManual = () => {
    const lat = parseFloat(manLat);
    const lon = parseFloat(manLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Invalid coordinates');
      return;
    }
    setLocation(lat, lon, `Manual ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
    setManLat('');
    setManLon('');
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-40 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-t-3xl p-6 pb-10 max-h-90vh overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4"></div>
        <h2 className="text-center font-mono text-cyan text-lg tracking-wider mb-6">📍 SET LOCATION</h2>

        {/* Quick Select Airports */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <p className="font-mono text-xs text-tdim tracking-wider">QUICK SELECT</p>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    setLocation(lat, lon, `GPS ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                    onClose();
                  });
                }
              }}
              className="bg-green/10 border border-green text-green px-3 py-1.5 rounded-lg font-mono text-xs font-bold hover:bg-green/20 transition-colors"
            >
              📍 USE GPS
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {INDIA_AIRPORTS.slice(0, 4).map(a => (
              <button
                key={a.code}
                onClick={() => handlePickAirport(a.lat, a.lon, a.code, a.name)}
                className="bg-panel border border-cyan/15 rounded-xl p-3 hover:border-cyan/30 transition-colors text-left"
              >
                <div className="font-mono text-white font-bold">{a.code}</div>
                <div className="text-xs text-tdim">{a.name}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2 relative">
            <select
              className="w-full bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-cyan outline-none"
              onChange={(e) => {
                if (!e.target.value) return;
                const [lat, lon, code, name] = e.target.value.split('|');
                handlePickAirport(parseFloat(lat), parseFloat(lon), code, name);
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Indian Airport...</option>
              {INDIA_AIRPORTS.map(a => (
                <option key={a.code} value={`${a.lat}|${a.lon}|${a.code}|${a.name}`}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>

            <select
              className="w-full bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-cyan outline-none"
              onChange={(e) => {
                if (!e.target.value) return;
                const [lat, lon, code, name] = e.target.value.split('|');
                handlePickAirport(parseFloat(lat), parseFloat(lon), code, name);
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Global Airport...</option>
              {GLOBAL_AIRPORTS.map(a => (
                <option key={a.code} value={`${a.lat}|${a.lon}|${a.code}|${a.name}`}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manual Coordinates */}
        <div>
          <p className="font-mono text-xs text-tdim tracking-wider mb-3">MANUAL COORDINATES</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Latitude (e.g. 18.60)"
              step="0.0001"
              value={manLat}
              onChange={(e) => setManLat(e.target.value)}
              className="flex-1 bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-cyan outline-none"
            />
            <input
              type="number"
              placeholder="Longitude (e.g. 73.74)"
              step="0.0001"
              value={manLon}
              onChange={(e) => setManLon(e.target.value)}
              className="flex-1 bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-cyan outline-none"
            />
            <button
              onClick={handlePickManual}
              className="bg-cyan/20 border border-cyan text-cyan px-3 py-2 rounded-lg font-mono text-sm font-bold hover:bg-cyan/30 transition-colors"
            >
              SET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
