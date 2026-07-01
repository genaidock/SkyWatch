'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { fetchFlights, enrichRoutes } from '../lib/flightApi';

const FlightContext = createContext();

const initialState = {
  flights: [],
  selectedFlight: null,
  userLat: 18.6020,
  userLon: 73.7470,
  locationLabel: 'GPS',
  radius: 100,
  refreshInterval: 60,
  filter: 'all',
  apiStatus: { type: 'demo', message: 'Initializing...' },
  alerts: [],
  enabledAPIs: {
    airplaneslive: true,
    adsblol: true,
    aviationstack: false,
    airlabs: false,
  },
  apiKeys: {
    airLabs: '',
    aviationStack: '',
  },
  apiKeysConfigured: {
    airLabs: false,
    aviationStack: false,
  },
};

function flightReducer(state, action) {
  switch (action.type) {
    case 'SET_FLIGHTS':
      return { ...state, flights: action.payload };
    case 'SET_SELECTED_FLIGHT':
      return { ...state, selectedFlight: action.payload };
    case 'SET_LOCATION':
      return {
        ...state,
        userLat: action.payload.lat,
        userLon: action.payload.lon,
        locationLabel: action.payload.label,
      };
    case 'SET_RADIUS':
      return { ...state, radius: action.payload };
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.payload };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts].slice(0, 30),
      };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    case 'SET_ENABLED_APIS':
      return { ...state, enabledAPIs: action.payload };
    case 'SET_API_KEY':
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SET_API_KEYS_CONFIGURED':
      return { ...state, apiKeysConfigured: action.payload };
    case 'SET_GLOBAL_SETTINGS':
      return {
        ...state,
        radius: action.payload.radius ?? state.radius,
        refreshInterval: action.payload.refreshInterval ?? state.refreshInterval,
        enabledAPIs: action.payload.enabledAPIs ?? state.enabledAPIs,
        apiKeysConfigured: action.payload.apiKeysConfigured ?? state.apiKeysConfigured,
      };
    default:
      return state;
  }
}

export function FlightProvider({ children }) {
  const [state, dispatch] = useReducer(flightReducer, initialState);
  const alertedPlanes = useRef(new Map());
  const sseActive = useRef(false);
  const trailsRef = useRef(new Map());

  useEffect(() => {
    // Load persisted location immediately
    try {
      const saved = localStorage.getItem('skywatch_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lon) {
          dispatch({ type: 'SET_LOCATION', payload: { lat: parsed.lat, lon: parsed.lon, label: parsed.label || `Cached ${parsed.lat.toFixed(4)}, ${parsed.lon.toFixed(4)}` } });
        }
      }
    } catch (e) { /* ignore */ }

    // Load persisted API keys so they remain visible for the admin
    try {
      const savedKeys = localStorage.getItem('skywatch_apikeys');
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        if (parsed.airLabs) dispatch({ type: 'SET_API_KEY', payload: { key: 'airLabs', value: parsed.airLabs } });
        if (parsed.aviationStack) dispatch({ type: 'SET_API_KEY', payload: { key: 'aviationStack', value: parsed.aviationStack } });
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) return;

    const success = (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      dispatch({ type: 'SET_LOCATION', payload: { lat, lon, label: `GPS ${lat.toFixed(4)}, ${lon.toFixed(4)}` } });
      dispatch({ type: 'SET_API_STATUS', payload: { type: 'ok', message: 'Location acquired' } });
    };

    const error = (err) => {
      dispatch({ type: 'SET_API_STATUS', payload: { type: 'warning', message: 'Location unavailable' } });
    };

    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 600000, timeout: 10000 });
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          dispatch({ type: 'SET_GLOBAL_SETTINGS', payload: data.settings });
        }
      })
      .catch(err => console.error('Failed to load global settings:', err));
  }, []);

  const setFlights = useCallback((flights) => {
    dispatch({ type: 'SET_FLIGHTS', payload: flights });
  }, []);

  const setSelectedFlight = useCallback((flight) => {
    dispatch({ type: 'SET_SELECTED_FLIGHT', payload: flight });
  }, []);

  const setLocation = useCallback((lat, lon, label) => {
    dispatch({ type: 'SET_LOCATION', payload: { lat, lon, label } });
    try { localStorage.setItem('skywatch_location', JSON.stringify({ lat, lon, label })); } catch (e) { /* ignore */ }
  }, []);

  const setRadius = useCallback((radius) => {
    dispatch({ type: 'SET_RADIUS', payload: radius });
  }, []);

  const setRefreshInterval = useCallback((interval) => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  }, []);

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setApiStatus = useCallback((type, message) => {
    dispatch({ type: 'SET_API_STATUS', payload: { type, message } });
  }, []);

  const addAlert = useCallback((alertInput) => {
    const isString = typeof alertInput === 'string';
    const message = isString ? alertInput : alertInput.message;
    const category = isString ? 'system' : (alertInput.category || 'system');
    const flightId = isString ? null : alertInput.flightId;
    dispatch({
      type: 'ADD_ALERT',
      payload: { message, category, timestamp: new Date(), flightId },
    });
  }, []);

  const recenterLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords.latitude, pos.coords.longitude, `GPS ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
      () => addAlert('GPS location unavailable'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [setLocation, addAlert]);

  const setEnabledAPIs = useCallback((apis) => {
    dispatch({ type: 'SET_ENABLED_APIS', payload: apis });
  }, []);

  const setApiKey = useCallback((key, value) => {
    dispatch({ type: 'SET_API_KEY', payload: { key, value } });
    try {
      const savedKeys = JSON.parse(localStorage.getItem('skywatch_apikeys') || '{}');
      savedKeys[key] = value;
      localStorage.setItem('skywatch_apikeys', JSON.stringify(savedKeys));
    } catch (e) { /* ignore */ }
  }, []);

  const updateGlobalSettings = useCallback(async (newSettings, password) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, settings: newSettings })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }
    dispatch({ type: 'SET_GLOBAL_SETTINGS', payload: data.settings });
  }, []);

  // Shared smart alert logic
  const runAlerts = useCallback((flights) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    for (const [id, ts] of alertedPlanes.current.entries()) {
      if (now - ts > oneHour) alertedPlanes.current.delete(id);
    }
    for (const f of flights) {
      if (!alertedPlanes.current.has(f.id)) {
        let category = null;
        let label = '';
        const desc = (f.desc || '').toLowerCase();
        const type = (f.type || '').toUpperCase();
        const sq = String(f.squawk || '');
        if (sq === '7700') { category = 'emergency'; label = 'General Emergency'; }
        else if (sq === '7600') { category = 'emergency'; label = 'Radio Failure'; }
        else if (sq === '7500') { category = 'emergency'; label = 'Hijacking'; }
        else if (/military|air force|navy|army|coast guard|nato/.test(desc) || /^(F16|F35|C17|C130|EUFI|B52)$/.test(type)) {
          category = 'military'; label = 'Military Aircraft';
        }
        else if (/gulfstream|challenger|citation|falcon|learjet|legacy/.test(desc) || /^(GLF|C56|CL3|F2TH|E55|E50)/.test(type)) {
          category = 'private'; label = 'Private Jet / VIP';
        }
        if (category) {
          addAlert({ message: `[${label}] ${f.callsign} (${f.type}) detected ${Math.round(f.distKm)}km away.`, category, flightId: f.id });
          alertedPlanes.current.set(f.id, now);
        }
      }
    }
  }, [addAlert]);

  const processFlightData = useCallback(async (rawFlights) => {
    const enriched = await enrichRoutes(rawFlights);
    const timestamped = enriched.map(f => ({ ...f, lastUpdated: Date.now() }));
    setFlights(timestamped);
    setApiStatus('ok', `Tracking ${enriched.length} flights`);
    runAlerts(timestamped);

    // Update trails
    const trails = trailsRef.current;
    const now = Date.now();
    for (const f of timestamped) {
      const key = f.icao24 || f.callsign || f.id;
      let pts = trails.get(key) || [];
      pts.push({ lat: f.lat, lon: f.lon, ts: now });
      // Keep positions within the last 3 minutes, max 60 points
      pts = pts.filter(p => now - p.ts < 180000).slice(-60);
      trails.set(key, pts);
    }
    // Prune stale trails for flights no longer seen
    const seenSet = new Set(timestamped.map(f => f.icao24 || f.callsign || f.id));
    trails.forEach((_, trailKey) => {
      if (!seenSet.has(trailKey)) trails.delete(trailKey);
    });
  }, [setFlights, setApiStatus, runAlerts]);

  // Polling fallback (used when SSE is unavailable)
  const pollFlights = useCallback(async (override = {}) => {
    const lat = override.lat ?? state.userLat;
    const lon = override.lon ?? state.userLon;
    const radius = override.radius ?? state.radius;
    try {
      setApiStatus('loading', 'Fetching flights...');
      const flights = await fetchFlights(lat, lon, radius, state.enabledAPIs);
      await processFlightData(flights);
    } catch (e) {
      setApiStatus('error', 'Failed to fetch flights');
      addAlert(`Fetch error: ${e.message || e}`);
    }
  }, [state.userLat, state.userLon, state.radius, state.enabledAPIs, setApiStatus, processFlightData, addAlert]);

  // SSE for real-time updates
  useEffect(() => {
    const canSSE = typeof window !== 'undefined' && window.EventSource && !sseActive.current;
    if (!canSSE) return;

    const params = new URLSearchParams({
      lat: state.userLat.toFixed(4),
      lon: state.userLon.toFixed(4),
      radius: String(state.radius),
    });
    const url = `/api/flights/stream?${params}`;
    const es = new EventSource(url);
    let connected = false;

    es.onopen = () => {
      connected = true;
      sseActive.current = true;
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.flights) {
          processFlightData(data.flights);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    es.onerror = () => {
      sseActive.current = false;
      es.close();
    };

    return () => {
      sseActive.current = false;
      es.close();
    };
  }, [state.userLat, state.userLon, state.radius, processFlightData]);

  // Fallback polling (only runs if SSE is not active)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    const doPoll = () => {
      if (!cancelled && !sseActive.current) {
        pollFlights();
      }
    };

    // Initial fetch (always, so we get data immediately)
    if (!sseActive.current) pollFlights();

    const intervalMs = Math.max(5, state.refreshInterval) * 1000;
    const timer = setInterval(doPoll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pollFlights, state.refreshInterval, state.userLat, state.userLon, state.radius]);

  const value = {
    state,
    setFlights,
    setSelectedFlight,
    setLocation,
    setRadius,
    setRefreshInterval,
    setFilter,
    setApiStatus,
    addAlert,
    setEnabledAPIs,
    setApiKey,
    pollFlights,
    recenterLocation,
    updateGlobalSettings,
    trailsRef,
  };

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}

export function useFlightContext() {
  const context = useContext(FlightContext);
  if (!context) {
    throw new Error('useFlightContext must be used within FlightProvider');
  }
  return context;
}
