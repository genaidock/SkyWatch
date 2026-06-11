'use client';

import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function SettingsScreen({ onShowToast }) {
  const { state, setApiKey, setEnabledAPIs, setRadius, setRefreshInterval } = useFlightContext();

  const toggleApi = (key) => {
    setEnabledAPIs({
      ...state.enabledAPIs,
      [key]: !state.enabledAPIs[key],
    });
    onShowToast(`${key} ${state.enabledAPIs[key] ? 'disabled' : 'enabled'}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="SETTINGS" subtitle="PREFERENCES & ACCOUNT" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Location Section */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">📍 LOCATION</div>
          <button className="w-full bg-panel border border-cyan/15 rounded-xl p-3 hover:border-cyan/30 transition-colors text-left">
            <div className="text-sm text-text">Set Location</div>
            <div className="text-xs text-tdim mt-1">{state.locationLabel}</div>
          </button>
        </div>

        {/* Radar Section */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🛰 RADAR</div>
          <div className="space-y-2">
            <div className="bg-panel border border-cyan/15 rounded-xl p-3">
              <div className="text-sm text-text mb-2">Scan Radius</div>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map(r => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${state.radius === r ? 'bg-cyan text-bg font-bold' : 'bg-surface text-tdim border border-cyan/15 hover:border-cyan/50'}`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-panel border border-cyan/15 rounded-xl p-3">
              <div className="text-sm text-text mb-2">Auto-Refresh</div>
              <div className="flex gap-2">
                {[15, 20, 45, 60].map(t => (
                  <button
                    key={t}
                    onClick={() => setRefreshInterval(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${state.refreshInterval === t ? 'bg-cyan text-bg font-bold' : 'bg-surface text-tdim border border-cyan/15 hover:border-cyan/50'}`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Source Toggles */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🔌 DATA SOURCES</div>
          <div className="space-y-3">
            {[
              { key: 'airplaneslive', label: 'Airplanes.live' },
              { key: 'adsblol', label: 'ADS-B.lol' },
              { key: 'aviationstack', label: 'AviationStack' },
              { key: 'airlabs', label: 'AirLabs.co' },
            ].map(api => (
              <div key={api.key} className="bg-panel border border-cyan/15 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm text-text">{api.label}</div>
                  <div className="text-xs text-tdim mt-1">{state.enabledAPIs[api.key] ? 'Enabled' : 'Disabled'}</div>
                </div>
                <button
                  onClick={() => toggleApi(api.key)}
                  className={`px-3 py-2 rounded-full font-mono text-xs font-bold transition-colors ${state.enabledAPIs[api.key] ? 'bg-green/10 border border-green text-green hover:bg-green/20' : 'bg-surface border border-cyan/15 text-tdim hover:bg-surface/80'}`}
                >
                  {state.enabledAPIs[api.key] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🔑 API KEYS</div>
          <div className="space-y-3">
            <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-4">
              <div className="font-mono text-sm text-cyan tracking-wider mb-3">⭐ AIRLABS.CO</div>
              <input
                type="password"
                placeholder="Paste AirLabs API key…"
                className="w-full bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text text-sm focus:border-cyan outline-none mb-2"
                value={state.apiKeys.airLabs}
                onChange={(e) => setApiKey('airLabs', e.target.value)}
              />
              <button
                onClick={() => onShowToast('AirLabs key updated')}
                className="w-full bg-cyan/20 border border-cyan text-cyan px-3 py-2 rounded-lg font-mono text-xs font-bold hover:bg-cyan/30 transition-colors"
              >
                SAVE KEY
              </button>
            </div>
            <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-4">
              <div className="font-mono text-sm text-cyan tracking-wider mb-3">✈️ AVIATIONSTACK</div>
              <input
                type="password"
                placeholder="Paste AviationStack API key…"
                className="w-full bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text text-sm focus:border-cyan outline-none mb-2"
                value={state.apiKeys.aviationStack}
                onChange={(e) => setApiKey('aviationStack', e.target.value)}
              />
              <button
                onClick={() => onShowToast('AviationStack key updated')}
                className="w-full bg-cyan/20 border border-cyan text-cyan px-3 py-2 rounded-lg font-mono text-xs font-bold hover:bg-cyan/30 transition-colors"
              >
                SAVE KEY
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">ℹ️ ABOUT</div>
          <div className="bg-panel border border-cyan/15 rounded-xl p-3">
            <div className="text-sm text-text">SkyWatch v6.0</div>
            <div className="text-xs text-tdim mt-1">Next.js Edition with Real-time Flight Tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
}
