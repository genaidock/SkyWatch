'use client';

export default function LocationBar({ location, onLocationClick, onRecenter, isPanned = false }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral bg-surface flex-shrink-0 text-sm">
      <span className="text-lg">{isPanned ? '🌐' : '📍'}</span>
      <div className="flex-1 text-xs font-mono text-tdim overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-2">
        {isPanned ? (
          <span className="px-2 py-0.5 bg-cyan/15 border border-cyan/40 text-cyan rounded-md text-[11px] font-bold tracking-wider animate-pulse">
            EXPLORING AIRSPACE
          </span>
        ) : (
          <b className="text-text">{location}</b>
        )}
      </div>
      <button
        type="button"
        onClick={onLocationClick}
        className="min-h-[36px] text-xs font-mono text-text border border-neutral px-2.5 py-1 rounded-lg bg-surface shadow-sm hover:bg-neutral/50 transition-colors flex-shrink-0 font-bold"
      >
        ✎ LOCATION
      </button>
      <button
        type="button"
        onClick={onRecenter}
        className={`min-h-[36px] text-xs font-mono px-3 py-1 rounded-lg transition-all flex-shrink-0 font-bold flex items-center gap-1.5 shadow-sm ${
          isPanned
            ? 'bg-cyan text-black hover:bg-cyan/90 border border-cyan shadow-md shadow-cyan/20 active:scale-95'
            : 'text-text border border-neutral bg-surface hover:bg-neutral/50'
        }`}
        aria-label={isPanned ? 'Return to home GPS location' : 'Recenter map to GPS location'}
      >
        <span>{isPanned ? '🏠' : '↺'}</span>
        <span>{isPanned ? 'HOME' : 'RECENTER'}</span>
      </button>
    </div>
  );
}
