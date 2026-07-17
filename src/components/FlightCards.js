'use client';

export default function FlightCards({ flights = [], selectedFlight = null, onSelectFlight = null }) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-3xl mb-2">🌤️</div>
        <div className="text-xs text-tdim">No aircraft within range<br />Clear skies above you!</div>
      </div>
    );
  }

  return (
    <div className="px-2 pb-4 space-y-2">
      {flights.filter(Boolean).map((f, i) => {
        const category = f.category || 'civil';
        const isSelected = selectedFlight?.id === f.id;
        
        let borderClass = 'border-neutral/10 hover:border-neutral/20';
        let barClass = 'bg-civil shadow-[0_0_8px_rgba(255,255,255,0.5)]';
        
        if (category === 'private') {
           if (isSelected) borderClass = 'border-private shadow-[0_0_8px_rgba(138,43,226,0.3)] hover:border-private';
           barClass = 'bg-private shadow-[0_0_8px_rgba(138,43,226,0.5)]';
        } else if (category === 'cargo') {
           if (isSelected) borderClass = 'border-cargo shadow-[0_0_8px_rgba(0,255,157,0.3)] hover:border-cargo';
           barClass = 'bg-cargo shadow-[0_0_8px_rgba(0,255,157,0.5)]';
        } else if (category === 'military') {
           if (isSelected) borderClass = 'border-military shadow-[0_0_8px_rgba(204,0,0,0.3)] hover:border-military';
           barClass = 'bg-military shadow-[0_0_8px_rgba(204,0,0,0.5)]';
        } else {
           if (isSelected) borderClass = 'border-civil shadow-[0_0_8px_rgba(255,255,255,0.3)] hover:border-civil';
           barClass = 'bg-civil shadow-[0_0_8px_rgba(255,255,255,0.5)]';
        }

        return (
          <div
            key={f.id}
            onClick={() => onSelectFlight?.(f)}
            className={`bg-panel border rounded-2xl p-3 cursor-pointer transition-all card-animation ${borderClass}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono font-bold text-sm text-white">{f.callsign || 'UNKNOWN'}</div>
              <div className="text-xs font-mono text-neutral bg-neutral/5 border border-neutral/10 px-2 py-0.5 rounded">
                {Number(f.distKm || 0).toFixed(1)} km
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <div className="font-mono text-tdim flex-1">{f.type || '—'}</div>
              {f.onGround && <div className="text-neutral text-xs">ON GROUND</div>}
            </div>
            <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-center">
              <div>
                <div className="font-mono font-bold text-neutral">{String(Math.round(Number(f.altitude) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ft</div>
                <div className="text-tdim">ALT</div>
              </div>
              <div>
                <div className="font-mono font-bold text-neutral">{f.speed || 0} kts</div>
                <div className="text-tdim">SPD</div>
              </div>
              <div>
                <div className="font-mono font-bold text-neutral">{f.heading || 0}°</div>
                <div className="text-tdim">HDG</div>
              </div>
              <div>
                <div className="font-mono font-bold text-neutral">
                  {(f.vertRate || 0) > 200 ? '↑' : (f.vertRate || 0) < -200 ? '↓' : '→'}
                </div>
                <div className="text-tdim">V/S</div>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-neutral/10 rounded-full overflow-hidden">
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
