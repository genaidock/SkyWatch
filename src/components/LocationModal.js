'use client';

import { INDIA_AIRPORTS, GLOBAL_AIRPORTS, ALL_AIRPORTS } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useFlightContext } from '@/context/FlightContext';

export default function LocationModal({ show, onClose }) {
  const { state, setLocation } = useFlightContext();
  const [manLat, setManLat] = useState('');
  const [manLon, setManLon] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handlePickAirport = (lat, lon, code, name) => {
    setLocation(lat, lon, `📍 ${code} — ${name}`);
    setSearchTerm('');
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
    setSearchTerm('');
    onClose();
  };

  const filteredAirports = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return ALL_AIRPORTS.filter(a => 
      a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [searchTerm]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] shadow-2xl shadow-slate-900/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-lg tracking-wide text-slate-900">SET LOCATION</h2>
            <p className="text-[11px] text-slate-500 font-mono">110+ DOMESTIC & INTERNATIONAL AIRPORTS</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Search Airports */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search airports (e.g. DEL, London, BOM, JFK, Pune)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-slate-800 font-sans text-xs focus:border-cyan focus:bg-white outline-none shadow-sm transition-all"
                autoFocus
              />
              <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            {searchTerm.trim().length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-inner">
                {filteredAirports.length === 0 ? (
                  <div className="text-xs text-slate-400 p-2 text-center">No airport found matching &quot;{searchTerm}&quot;</div>
                ) : (
                  filteredAirports.map(a => (
                    <button
                      key={a.code}
                      onClick={() => handlePickAirport(a.lat, a.lon, a.code, a.name)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-200 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan group-hover:underline">{a.code}</span>
                        <span className="text-xs text-slate-700 truncate max-w-[240px]">{a.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">SELECT ➔</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-end">
            <p className="font-sans text-[10px] tracking-widest uppercase font-semibold text-slate-500">Popular Hubs</p>
            <button
              disabled={isLocating}
              onClick={() => {
                if (navigator.geolocation) {
                  setIsLocating(true);
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const lat = pos.coords.latitude;
                      const lon = pos.coords.longitude;
                      setLocation(lat, lon, `GPS ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                      setIsLocating(false);
                      onClose();
                    },
                    (err) => {
                      setIsLocating(false);
                      let msg = err.message;
                      if (err.code === 1) msg = "Permission denied. Please allow location access in your browser settings.";
                      if (err.code === 2) msg = "Position unavailable. Please try again.";
                      if (err.code === 3) msg = "Request timed out.";
                      alert(`GPS Error: ${msg}`);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                  );
                } else {
                  alert('Geolocation is not supported by your browser.');
                }
              }}
              className={`bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer ${isLocating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              <span className={isLocating ? 'animate-spin inline-block' : 'text-cyan'}>
                {isLocating ? '⏳' : '🎯'}
              </span> 
              <span>{isLocating ? 'LOCATING...' : 'USE GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {INDIA_AIRPORTS.slice(0, 4).map(a => (
              <button
                key={a.code}
                onClick={() => handlePickAirport(a.lat, a.lon, a.code, a.name)}
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100 hover:border-slate-200 transition-colors text-left shadow-sm group cursor-pointer"
              >
                <div className="font-display font-black text-slate-800 text-base group-hover:text-cyan transition-colors">{a.code}</div>
                <div className="text-[11px] text-slate-500 font-sans tracking-wide mt-0.5 line-clamp-1">{a.name}</div>
              </button>
            ))}
          </div>

          {/* Categorized Dropdowns */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-slate-500 mb-1 block">
                🇮🇳 Domestic Airports ({INDIA_AIRPORTS.length})
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-sans text-xs focus:border-cyan outline-none shadow-sm transition-colors cursor-pointer"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [lat, lon, code, name] = e.target.value.split('|');
                  handlePickAirport(parseFloat(lat), parseFloat(lon), code, name);
                }}
                defaultValue=""
              >
                <option value="" disabled>Select Indian Airport ({INDIA_AIRPORTS.length} airports)...</option>
                {INDIA_AIRPORTS.map(a => (
                  <option key={a.code} value={`${a.lat}|${a.lon}|${a.code}|${a.name}`}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-slate-500 mb-1 block">
                🌐 International Airports ({GLOBAL_AIRPORTS.length})
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-sans text-xs focus:border-cyan outline-none shadow-sm transition-colors cursor-pointer"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [lat, lon, code, name] = e.target.value.split('|');
                  handlePickAirport(parseFloat(lat), parseFloat(lon), code, name);
                }}
                defaultValue=""
              >
                <option value="" disabled>Select Global Hub ({GLOBAL_AIRPORTS.length} airports)...</option>
                {GLOBAL_AIRPORTS.map(a => (
                  <option key={a.code} value={`${a.lat}|${a.lon}|${a.code}|${a.name}`}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="h-px bg-slate-100 w-full my-3"></div>

          {/* Manual Coordinates */}
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase font-semibold text-slate-500 mb-2">Manual Coordinates</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Lat (e.g. 18.6)"
                step="0.0001"
                value={manLat}
                onChange={(e) => setManLat(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-display font-medium text-xs focus:border-cyan focus:ring-1 focus:ring-cyan outline-none shadow-sm transition-all"
              />
              <input
                type="number"
                placeholder="Lon (e.g. 73.7)"
                step="0.0001"
                value={manLon}
                onChange={(e) => setManLon(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-display font-medium text-xs focus:border-cyan focus:ring-1 focus:ring-cyan outline-none shadow-sm transition-all"
              />
              <button
                onClick={handlePickManual}
                className="bg-cyan border-cyan text-white px-4 py-2 rounded-xl font-sans text-xs font-bold shadow-sm shadow-cyan/20 transition-colors cursor-pointer"
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
