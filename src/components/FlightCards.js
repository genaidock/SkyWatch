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
      {flights.map((f, i) => (
        <div
          key={f.id}
          onClick={() => onSelectFlight?.(f)}
          className={`bg-panel border border-cyan/15 rounded-2xl p-3 cursor-pointer hover:border-cyan/30 transition-all card-animation ${
            selectedFlight?.id === f.id ? 'border-cyan' : ''
          }`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono font-bold text-sm text-white">{f.callsign}</div>
            <div className="text-xs font-mono text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded">
              {f.distKm.toFixed(1)} km
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <div className="font-mono text-tdim flex-1">{f.type || '—'}</div>
            {f.onGround && <div className="text-amber text-xs">ON GROUND</div>}
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-center">
            <div>
              <div className="font-mono font-bold text-green">{f.altitude.toLocaleString()} ft</div>
              <div className="text-tdim">ALT</div>
            </div>
            <div>
              <div className="font-mono font-bold text-green">{f.speed} kts</div>
              <div className="text-tdim">SPD</div>
            </div>
            <div>
              <div className="font-mono font-bold text-green">{f.heading}°</div>
              <div className="text-tdim">HDG</div>
            </div>
            <div>
              <div className="font-mono font-bold text-green">
                {f.vertRate > 200 ? '↑' : f.vertRate < -200 ? '↓' : '→'}
              </div>
              <div className="text-tdim">V/S</div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-cyan/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan to-green"
              style={{ width: `${Math.min(100, (f.altitude / 42000) * 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
