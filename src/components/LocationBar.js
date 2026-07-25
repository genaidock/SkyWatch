'use client';

export default function LocationBar({ location, onLocationClick, onRecenter }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral bg-surface flex-shrink-0 text-sm">
      <span className="text-lg">📍</span>
      <div className="flex-1 text-xs font-mono text-tdim overflow-hidden text-ellipsis whitespace-nowrap">
        <b className="text-text">{location}</b>
      </div>
      <button
        onClick={onLocationClick}
        className="text-xs font-mono text-text border border-neutral px-2 py-1 rounded-lg bg-surface shadow-sm hover:bg-neutral/50 transition-colors flex-shrink-0 font-bold"
      >
        ✎ LOCATION
      </button>
      <button
        onClick={onRecenter}
        className="text-xs font-mono text-text border border-neutral px-2 py-1 rounded-lg bg-surface shadow-sm hover:bg-neutral/50 transition-colors flex-shrink-0 font-bold"
      >
        ↺ RECENTER
      </button>
    </div>
  );
}
