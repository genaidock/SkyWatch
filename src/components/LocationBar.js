'use client';

export default function LocationBar({ location, onShowToast, onLocationClick }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan/15 bg-surface flex-shrink-0 text-sm">
      <span className="text-lg">📍</span>
      <div className="flex-1 text-xs font-mono text-tdim overflow-hidden text-ellipsis whitespace-nowrap">
        <b className="text-cyan">{location}</b>
      </div>
      <button
        onClick={onLocationClick}
        className="text-xs font-mono text-cyan border border-cyan/20 px-2 py-1 rounded-lg bg-cyan/10 hover:bg-cyan/20 transition-colors flex-shrink-0"
      >
        ✎ LOCATION
      </button>
      <button
        onClick={() => onShowToast('Refreshing...')}
        className="text-xs font-mono text-cyan border border-cyan/20 px-2 py-1 rounded-lg bg-cyan/10 hover:bg-cyan/20 transition-colors flex-shrink-0"
      >
        ↺
      </button>
    </div>
  );
}
