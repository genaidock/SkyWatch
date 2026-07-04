'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useFlightContext } from '@/context/FlightContext';

export default function SettingsScreen({ onShowToast }) {
  const { state, setApiKey, setEnabledAPIs, setRadius, setRefreshInterval, updateGlobalSettings } = useFlightContext();
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
                {[5, 15, 30, 60].map(t => (
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
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm text-cyan tracking-wider">⭐ AIRLABS.CO</div>
                {state.apiKeysConfigured?.airLabs && (
                  <span className="text-xs text-green font-mono">✓ Configured</span>
                )}
              </div>
              <input
                type="password"
                placeholder="Enter new key (or leave blank to keep current)"
                className="w-full bg-surface border border-cyan/15 rounded-lg px-3 py-2 text-text text-sm focus:border-cyan outline-none mb-2"
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
            className="w-full bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl font-mono text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
          <div className="bg-panel border border-cyan/15 rounded-xl p-3">
            <div className="text-sm text-text">SkyWatch v6.0</div>
            <div className="text-xs text-tdim mt-1">Next.js Edition with Real-time Flight Tracking</div>
          </div>
        </div>
      </div>

      {/* Password Modal Overlay */}
      {showPasswordModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-panel border border-cyan/30 rounded-2xl w-full max-w-xs p-6 shadow-2xl">
            <div className="font-mono font-bold text-lg text-cyan mb-2 text-center">🛡️ Admin Verification</div>
            <p className="text-xs text-tdim mb-4 text-center">Enter admin password to save settings globally.</p>
            <input 
              type="password"
              placeholder="Password"
              className="w-full bg-bg border border-cyan/20 rounded-lg px-3 py-2 text-text mb-4 focus:border-cyan outline-none text-center tracking-widest"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSave()}
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowPasswordModal(false); setAdminPassword(''); }}
                className="flex-1 bg-surface border border-cyan/20 text-tdim px-3 py-2 rounded-lg font-mono text-xs hover:bg-surface/80"
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
