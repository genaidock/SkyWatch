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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] shadow-2xl shadow-slate-900/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-display font-bold text-lg tracking-wide text-slate-900">SET LOCATION</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Actions */}
          <div className="flex justify-between items-end">
            <p className="font-sans text-[10px] tracking-widest uppercase font-semibold text-slate-500">Quick Select</p>
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
              className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-sans text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1"
            >
              <span className="text-cyan">🎯</span> USE GPS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            {INDIA_AIRPORTS.slice(0, 4).map(a => (
              <button
                key={a.code}
                onClick={() => handlePickAirport(a.lat, a.lon, a.code, a.name)}
                className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:border-slate-200 transition-colors text-left shadow-sm group"
              >
                <div className="font-display font-black text-slate-800 text-lg group-hover:text-cyan transition-colors">{a.code}</div>
                <div className="text-xs text-slate-500 font-sans tracking-wide mt-1 line-clamp-1">{a.name}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-sans text-sm focus:border-cyan outline-none shadow-sm transition-colors cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-sans text-sm focus:border-cyan outline-none shadow-sm transition-colors cursor-pointer"
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
          
          <div className="h-px bg-slate-100 w-full my-4"></div>

          {/* Manual Coordinates */}
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase font-semibold text-slate-500 mb-3">Manual Coordinates</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Lat (e.g. 18.6)"
                step="0.0001"
                value={manLat}
                onChange={(e) => setManLat(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-display font-medium text-sm focus:border-cyan focus:ring-1 focus:ring-cyan outline-none shadow-sm transition-all"
              />
              <input
                type="number"
                placeholder="Lon (e.g. 73.7)"
                step="0.0001"
                value={manLon}
                onChange={(e) => setManLon(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-display font-medium text-sm focus:border-cyan focus:ring-1 focus:ring-cyan outline-none shadow-sm transition-all"
              />
              <button
                onClick={handlePickManual}
                className="bg-cyan border-cyan text-white px-4 py-2.5 rounded-xl font-sans text-sm font-bold shadow-sm shadow-cyan/20 transition-colors"
              >
                SET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
