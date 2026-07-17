'use client';

export default function LocationBar({ location, onLocationClick, onRecenter }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral/10 bg-surface flex-shrink-0 text-sm">
      <span className="text-lg">📍</span>
      <div className="flex-1 text-xs font-mono text-tdim overflow-hidden text-ellipsis whitespace-nowrap">
        <b className="text-white">{location}</b>
      </div>
      <button
        onClick={onLocationClick}
        className="text-xs font-mono text-neutral border border-neutral/20 px-2 py-1 rounded-lg bg-neutral/5 hover:bg-neutral/10 transition-colors flex-shrink-0"
      >
        ✎ LOCATION
      </button>
      <button
        onClick={onRecenter}
        className="text-xs font-mono text-neutral border border-neutral/20 px-2 py-1 rounded-lg bg-neutral/5 hover:bg-neutral/10 transition-colors flex-shrink-0"
      >
        ↺ RECENTER
      </button>
    </div>
  );
}
