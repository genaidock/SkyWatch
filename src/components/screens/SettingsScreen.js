'use client';

import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function SettingsScreen({ onShowToast }) {
  const { state, setEnabledAPIs, setPlaneTypeFilter, setSensorMode } = useFlightContext();

  const toggleApi = (key) => {
    const isCurrentlyEnabled = state.enabledAPIs[key];
    const enabledCount = Object.values(state.enabledAPIs).filter(Boolean).length;

    if (isCurrentlyEnabled && enabledCount <= 1) {
      onShowToast('Cannot disable the last active API source.');
      return;
    }

    setEnabledAPIs({
      ...state.enabledAPIs,
      [key]: !isCurrentlyEnabled,
    });
    onShowToast(`${key.toUpperCase()} ${isCurrentlyEnabled ? 'disabled' : 'enabled'}`);
  };

  const sensorModes = [
    { id: 'normal', name: 'Standard Radar', desc: 'Tactical cyan neon display with high contrast', color: '#00e5ff' },
    { id: 'crt', name: 'Amber CRT', desc: 'Vintage amber phosphor radar terminal with scanlines', color: '#ffaa00' },
    { id: 'nvg', name: 'Night Vision (NVG)', desc: 'Military Gen-3 green phosphor with peripheral vignette', color: '#00ff66' },
    { id: 'flir', name: 'FLIR Thermal', desc: 'Thermal infrared white-hot sensor mode', color: '#ffffff' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="SETTINGS" subtitle="PREFERENCES & SENSORS" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Tactical Sensor Vision Modes */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">👁️ TACTICAL SENSOR VISION</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sensorModes.map(mode => {
              const isActive = (state.sensorMode || 'normal') === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSensorMode(mode.id);
                    onShowToast(`Sensor mode: ${mode.name}`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-surface border-cyan shadow-lg shadow-cyan/15 ring-1 ring-cyan'
                      : 'bg-surface/60 border-neutral/60 hover:bg-neutral/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mode.color }} />
                      <span className="font-mono text-sm font-bold text-text">{mode.name}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono font-bold text-cyan bg-cyan/15 px-1.5 py-0.5 rounded border border-cyan/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-tdim leading-relaxed">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aircraft Types */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">✈️ AIRCRAFT RADAR FILTERS</div>
          <div className="space-y-2.5">
            {[
              { key: 'civil', label: 'Civilian / Commercial', color: '#00e5ff' },
              { key: 'cargo', label: 'Cargo Freighters', color: '#00ff9d' },
              { key: 'private', label: 'Private / VIP Executive', color: '#8a2be2' },
              { key: 'military', label: 'Military Aircraft', color: '#ff003c' },
              { key: 'helicopter', label: 'Rotorcraft / Helicopters', color: '#39ff14' },
            ].map(type => {
              const isVisible = state.planeTypeFilter?.[type.key] !== false;
              return (
                <div key={type.key} className="bg-surface border border-neutral/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                    <div>
                      <div className="font-mono text-sm text-text font-bold">{type.label}</div>
                      <div className="text-xs text-tdim">{isVisible ? 'Visible on radar' : 'Hidden from radar'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlaneTypeFilter({ ...state.planeTypeFilter, [type.key]: !isVisible })}
                    className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      isVisible
                        ? 'bg-cyan border border-cyan text-white hover:opacity-90'
                        : 'bg-surface border border-neutral text-tdim hover:bg-neutral/50'
                    }`}
                  >
                    {isVisible ? 'SHOWN' : 'HIDDEN'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Data Sources */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🔌 RADAR DATA FEEDS</div>
          <div className="space-y-2.5">
            {[
              { key: 'adsblol', label: 'ADS-B.lol', desc: 'Real-time open community ADS-B feeder network' },
              { key: 'adsbfi', label: 'ADS-B.fi', desc: 'Worldwide crowdsourced unfiltered transponder network' },
              { key: 'airplaneslive', label: 'Airplanes.live', desc: 'Community aggregator (requires access/proxy)' },
              { key: 'opensky', label: 'OpenSky Network', desc: 'Global academic and crowdsourced transponder sensors' },
            ].map(api => {
              const isEnabled = state.enabledAPIs?.[api.key];
              return (
                <div key={api.key} className="bg-surface border border-neutral/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-mono text-sm text-text font-bold">{api.label}</div>
                    <div className="text-xs text-tdim mt-0.5">{api.desc}</div>
                    <div className="text-xs font-mono text-tdim mt-1">
                      Status: <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-tdim'}>{isEnabled ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApi(api.key)}
                    className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      isEnabled
                        ? 'bg-emerald-500 border border-emerald-400 text-white hover:opacity-90'
                        : 'bg-surface border border-neutral text-tdim hover:bg-neutral/50'
                    }`}
                  >
                    {isEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* About SkyWatch v7.0 */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">ℹ️ SYSTEM INTEL</div>
          <div className="bg-surface border border-neutral/60 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text font-black font-display">SkyWatch v7.0</div>
              <span className="font-mono text-[10px] bg-cyan/15 text-cyan px-2 py-0.5 rounded font-bold border border-cyan/30">
                GOD&apos;S EYE EDITION
              </span>
            </div>
            <div className="text-xs text-tdim leading-relaxed">
              Boundless 3D airspace intelligence featuring dead-reckoning interpolation, Cockpit Chase HUD, great-circle flight trajectory reconstruction, and multi-spectrum sensor vision modes.
            </div>
            <div className="pt-2 border-t border-neutral/40 flex items-center justify-between text-[10px] font-mono text-tdim">
              <span>ENGINE: MAPLIBRE GL v4</span>
              <span>FEED: LIVE ADS-B</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
