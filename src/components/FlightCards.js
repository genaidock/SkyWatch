'use client';

export default function FlightCards({ flights = [], selectedFlight = null, onSelectFlight = null }) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-4xl mb-3">🌤️</div>
        <div className="text-sm text-slate-500 font-sans tracking-wide">No aircraft within range<br />Clear skies above you!</div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-6 space-y-3 pt-3">
      {flights.filter(Boolean).map((f, i) => {
        const category = f.category || 'civil';
        const isSelected = selectedFlight?.id === f.id;
        
        let borderClass = 'border-transparent hover:border-slate-300';
        let barClass = 'bg-civil';
        
        if (category === 'private') {
           if (isSelected) borderClass = 'border-private ring-1 ring-private shadow-sm shadow-private/20';
           barClass = 'bg-private';
        } else if (category === 'cargo') {
           if (isSelected) borderClass = 'border-cargo ring-1 ring-cargo shadow-sm shadow-cargo/20';
           barClass = 'bg-cargo';
        } else if (category === 'military') {
           if (isSelected) borderClass = 'border-military ring-1 ring-military shadow-sm shadow-military/20';
           barClass = 'bg-military';
        } else {
           if (isSelected) borderClass = 'border-civil ring-1 ring-civil shadow-sm shadow-civil/20';
           barClass = 'bg-civil';
        }

        return (
          <div
            key={f.id}
            onClick={() => onSelectFlight?.(f)}
            className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm shadow-slate-200/50 card-animation ${borderClass}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-black tracking-wide text-lg text-slate-900">{f.callsign || 'UNKNOWN'}</div>
              <div className="text-xs font-display font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                {Number(f.distKm || 0).toFixed(1)} km
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="font-sans text-xs text-slate-500 font-medium flex-1 tracking-wide">{f.type || '—'}</div>
              {f.onGround && <div className="text-amber-600 font-bold text-[10px] tracking-widest uppercase">On Ground</div>}
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="text-center">
                <div className="font-display font-bold text-slate-800">{String(Math.round(Number(f.altitude) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                <div className="text-[9px] text-slate-400 font-sans tracking-widest uppercase mt-0.5">Alt</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="font-display font-bold text-slate-800">{f.speed || 0}</div>
                <div className="text-[9px] text-slate-400 font-sans tracking-widest uppercase mt-0.5">Spd</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="font-display font-bold text-slate-800">{f.heading || 0}°</div>
                <div className="text-[9px] text-slate-400 font-sans tracking-widest uppercase mt-0.5">Hdg</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="font-display font-bold text-slate-800">
                  {(f.vertRate || 0) > 200 ? '↑' : (f.vertRate || 0) < -200 ? '↓' : '→'}
                </div>
                <div className="text-[9px] text-slate-400 font-sans tracking-widest uppercase mt-0.5">V/S</div>
              </div>
            </div>
            
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barClass}`}
                style={{ width: `${Math.min(100, (Number(f.altitude || 0) / 42000) * 100)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
