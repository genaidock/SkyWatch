'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function SettingsScreen({ onShowToast }) {
  const { state, setApiKey, setEnabledAPIs, setRadius, updateGlobalSettings, setPlaneTypeFilter } = useFlightContext();
  const [adminPassword, setAdminPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    onShowToast(`${key} ${isCurrentlyEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleAdminSave = async () => {
    setIsSaving(true);
    try {
      await updateGlobalSettings({
        radius: state.radius,
        refreshInterval: state.refreshInterval,
        enabledAPIs: state.enabledAPIs,
        apiKeys: state.apiKeys,
      }, adminPassword);
      onShowToast('Global settings updated successfully!');
      setShowPasswordModal(false);
      setAdminPassword('');
    } catch (err) {
      onShowToast(err.message || 'Failed to update global settings');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="SETTINGS" subtitle="PREFERENCES & ACCOUNT" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Location Section */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">📍 LOCATION</div>
          <button className="w-full bg-surface border border-neutral rounded-xl p-3 hover:bg-neutral/50 transition-colors text-left shadow-sm">
            <div className="text-sm text-text font-bold">Set Location</div>
            <div className="text-xs text-tdim mt-1">{state.locationLabel}</div>
          </button>
        </div>

        {/* Radar Section */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🛰 RADAR</div>
          <div className="space-y-2">
            <div className="bg-surface border border-neutral rounded-xl p-3 shadow-sm">
              <div className="text-sm text-text mb-2 font-bold">Scan Radius</div>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map(r => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors shadow-sm ${state.radius === r ? 'bg-cyan text-white font-bold' : 'bg-surface text-text border border-neutral hover:bg-neutral/50'}`}
                  >
                    {r}km
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
              { key: 'adsbfi', label: 'ADS-B.fi' },
              { key: 'airlabs', label: 'AirLabs.co' },
            ].map(api => (
              <div key={api.key} className="bg-surface border border-neutral rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-mono text-sm text-text font-bold">{api.label}</div>
                  <div className="text-xs text-tdim mt-1">{state.enabledAPIs[api.key] ? 'Enabled' : 'Disabled'}</div>
                </div>
                <button
                  onClick={() => toggleApi(api.key)}
                  className={`px-3 py-2 rounded-full font-mono text-xs font-bold transition-colors shadow-sm ${state.enabledAPIs[api.key] ? 'bg-cargo border border-cargo text-white hover:opacity-80' : 'bg-surface border border-neutral text-tdim hover:bg-neutral/50'}`}
                >
                  {state.enabledAPIs[api.key] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>



        {/* Aircraft Types */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">✈️ AIRCRAFT TYPES</div>
          <div className="space-y-3">
            {[
              { key: 'civil', label: 'Civilian / Commercial' },
              { key: 'cargo', label: 'Cargo Freighters' },
              { key: 'private', label: 'Private / VIP' },
              { key: 'military', label: 'Military' },
              { key: 'helicopter', label: 'Helicopters' },
            ].map(type => (
              <div key={type.key} className="bg-surface border border-neutral rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-mono text-sm text-text font-bold">{type.label}</div>
                  <div className="text-xs text-tdim mt-1">{state.planeTypeFilter?.[type.key] !== false ? 'Visible' : 'Hidden'}</div>
                </div>
                <button
                  onClick={() => setPlaneTypeFilter({ ...state.planeTypeFilter, [type.key]: state.planeTypeFilter?.[type.key] === false ? true : false })}
                  className={`px-3 py-2 rounded-full font-mono text-xs font-bold transition-colors shadow-sm ${state.planeTypeFilter?.[type.key] !== false ? 'bg-cyan border border-cyan text-white hover:opacity-80' : 'bg-surface border border-neutral text-tdim hover:bg-neutral/50'}`}
                >
                  {state.planeTypeFilter?.[type.key] !== false ? 'SHOW' : 'HIDE'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🔑 API KEYS</div>
          <div className="space-y-3">
            <div className="bg-surface border border-neutral rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm text-cyan tracking-wider font-bold">⭐ AIRLABS.CO</div>
                {state.apiKeysConfigured?.airLabs && (
                  <span className="text-xs text-cargo font-mono font-bold">✓ Configured</span>
                )}
              </div>
              <input
                type="password"
                placeholder="Enter new key (or leave blank to keep current)"
                className="w-full bg-surface border border-neutral rounded-lg px-3 py-2 text-text text-sm focus:border-cyan outline-none mb-2 shadow-sm"
                value={state.apiKeys.airLabs}
                onChange={(e) => setApiKey('airLabs', e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* Global Admin Save */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">🛡️ ADMIN CONTROLS</div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-military border border-military text-white px-4 py-3 rounded-xl font-mono text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
          >
            SAVE AS GLOBAL DEFAULTS
          </button>
          <div className="text-xs text-tdim mt-2 text-center">
            Applies your current settings & API keys to all users.
          </div>
        </div>

        {/* About */}
        <div>
          <div className="font-mono text-xs text-tdim tracking-widest mb-3">ℹ️ ABOUT</div>
          <div className="bg-surface border border-neutral rounded-xl p-3 shadow-sm">
            <div className="text-sm text-text font-bold">SkyWatch v6.0</div>
            <div className="text-xs text-tdim mt-1">Next.js Edition with Real-time Flight Tracking</div>
          </div>
        </div>
      </div>

      {/* Password Modal Overlay */}
      {showPasswordModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral/80 backdrop-blur-sm">
          <div className="bg-surface border border-neutral rounded-2xl w-full max-w-xs p-6 shadow-2xl">
            <div className="font-mono font-bold text-lg text-cyan mb-2 text-center">🛡️ Admin Verification</div>
            <p className="text-xs text-tdim mb-4 text-center">Enter admin password to save settings globally.</p>
            <input 
              type="password"
              placeholder="Password"
              className="w-full bg-surface border border-neutral rounded-lg px-3 py-2 text-text mb-4 focus:border-cyan outline-none text-center tracking-widest shadow-sm"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSave()}
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowPasswordModal(false); setAdminPassword(''); }}
                className="flex-1 bg-surface border border-neutral text-tdim px-3 py-2 rounded-lg font-mono text-xs hover:bg-neutral/50 font-bold shadow-sm"
              >
                CANCEL
              </button>
              <button 
                onClick={handleAdminSave}
                disabled={isSaving || !adminPassword}
                className="flex-1 bg-red-500 border border-red-400 text-white px-3 py-2 rounded-lg font-mono text-xs font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
