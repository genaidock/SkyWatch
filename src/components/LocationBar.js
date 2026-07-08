'use client';

export default function LocationBar({ location, onLocationClick, onRecenter, apiStatus = { type: 'demo', message: 'Loading...' } }) {
  const dotColor = {
    live: 'bg-green drop-shadow-[0_0_6px_#00ff9d]',
    demo: 'bg-amber drop-shadow-[0_0_6px_#ffb300]',
    err: 'bg-red drop-shadow-[0_0_6px_#ff3b3b]',
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-cyan/15 bg-surface flex-shrink-0 text-sm overflow-hidden">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <span className="text-lg flex-shrink-0">📍</span>
        <div className="text-xs font-mono text-cyan truncate">
          <b>{location}</b>
        </div>
        
        <div className="hidden sm:block w-px h-4 bg-cyan/20 mx-2 flex-shrink-0"></div>

        <div className="hidden sm:flex items-center gap-2 truncate">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[apiStatus.type] || dotColor.demo}`}></div>
          <div className="font-mono text-tdim text-xs truncate">
            <b className="text-tmid">{apiStatus.message}</b>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onLocationClick}
          className="text-xs font-mono text-cyan border border-cyan/20 px-2 py-1 rounded-lg bg-cyan/10 hover:bg-cyan/20 transition-colors"
        >
          ✎ LOC
        </button>
        <button
          onClick={onRecenter}
          className="text-xs font-mono text-cyan border border-cyan/20 px-2 py-1 rounded-lg bg-cyan/10 hover:bg-cyan/20 transition-colors"
        >
          ↺ REC
        </button>
      </div>
    </div>
  );
}
