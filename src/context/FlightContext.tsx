'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { fetchFlights, enrichRoutes } from '../lib/flightApi';

const FlightContext = createContext<any>(undefined);

const initialState = {
  flights: [],
  selectedFlight: null,
  userLat: null,
  userLon: null,
  locationLabel: 'Acquiring GPS...',
  recenterTrigger: 0,
  radius: 100,
  filter: 'all',
  apiStatus: { type: 'demo', message: 'Initializing...' },
  alerts: [],
  enabledAPIs: {
      airplaneslive: true,
      adsblol: true,
      opensky: true,
      airlabs: false,
    },
  apiKeys: {
    airLabs: '',
  },
  apiKeysConfigured: {
    airLabs: false,
  },
};

function flightReducer(state, action) {
  switch (action.type) {
    case 'SET_FLIGHTS': {
      const now = Date.now();
      const RETENTION_MS = 120000; // Keep planes for 120s even if missing from one fetch
      
      const newFlights = action.payload;
      const mergedMap = new Map();

      // Retain old flights if they are recent
      for (const old of state.flights) {
        if (now - (old.lastUpdated || now) < RETENTION_MS) {
          mergedMap.set(old.id, old);
        }
      }

      // Overwrite with fresh data, preserving previous position for smooth interpolation
      for (const fresh of newFlights) {
        const existing = mergedMap.get(fresh.id);
        if (existing) {
          // Carry forward the old rendered position so the canvas can interpolate smoothly
          fresh.prevLat = existing.lat;
          fresh.prevLon = existing.lon;
          fresh.prevHeading = existing.heading;
        }
        mergedMap.set(fresh.id, fresh);
      }

      return { ...state, flights: Array.from(mergedMap.values()) };
    }
    case 'SET_SELECTED_FLIGHT':
      return { ...state, selectedFlight: action.payload };
    case 'SET_LOCATION':
      return {
        ...state,
        userLat: action.payload.lat,
        userLon: action.payload.lon,
        locationLabel: action.payload.label,
        recenterTrigger: state.recenterTrigger + 1,
      };
    case 'TRIGGER_RECENTER':
      return { ...state, recenterTrigger: state.recenterTrigger + 1 };
    case 'SET_RADIUS':
      return { ...state, radius: action.payload };
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
    if (typeof window === 'undefined') return;

    // Load persisted API keys so they remain visible for the admin
    try {
      const savedKeys = localStorage.getItem('skywatch_apikeys');
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        if (parsed.airLabs) dispatch({ type: 'SET_API_KEY', payload: { key: 'airLabs', value: parsed.airLabs } });
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      dispatch({ type: 'SET_LOCATION', payload: { lat: 18.6020, lon: 73.7470, label: 'Default (Pune)' } });
      return;
    }

    const loadFallbackLocation = () => {
      try {
        const saved = localStorage.getItem('skywatch_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lat && parsed.lon) {
            dispatch({ type: 'SET_LOCATION', payload: { lat: parsed.lat, lon: parsed.lon, label: parsed.label || `Cached ${parsed.lat.toFixed(4)}, ${parsed.lon.toFixed(4)}` } });
            return;
          }
        }
      } catch (e) { /* ignore */ }
      dispatch({ type: 'SET_LOCATION', payload: { lat: 18.6020, lon: 73.7470, label: 'Default (Pune)' } });
    };

    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        loadFallbackLocation();
      }
    }, 2500);

    const success = (pos) => {
      resolved = true;
      clearTimeout(timeoutId);
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      dispatch({ type: 'SET_LOCATION', payload: { lat, lon, label: `GPS ${lat.toFixed(4)}, ${lon.toFixed(4)}` } });
      dispatch({ type: 'SET_API_STATUS', payload: { type: 'ok', message: 'Location acquired' } });
    };

    const error = (err) => {
      resolved = true;
      clearTimeout(timeoutId);
      loadFallbackLocation();
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
    dispatch({ type: 'TRIGGER_RECENTER' });
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
    for (const [id, ts] of Array.from(alertedPlanes.current.entries())) {
      if (now - ts > oneHour) alertedPlanes.current.delete(id);
    }
    for (const f of flights) {
      if (!alertedPlanes.current.has(f.id)) {
        const category = f.category;
        let label = '';
        const sq = String(f.squawk || '');
        
        let alertCategory = category;
        if (sq === '7700') { label = 'General Emergency'; alertCategory = 'emergency'; }
        else if (sq === '7600') { label = 'Radio Failure'; alertCategory = 'emergency'; }
        else if (sq === '7500') { label = 'Hijacking'; alertCategory = 'emergency'; }
        else if (f.isHeli) { label = 'Helicopter'; alertCategory = 'helicopter'; }
        else if (category === 'military') { label = 'Military Aircraft'; }
        else if (category === 'private') { label = 'Private Jet / VIP'; }
        else if (category === 'cargo') { label = 'Cargo Freighter'; }
        if (label) {
          addAlert({ message: `[${label}] ${f.callsign} (${f.type}) detected ${Math.round(f.distKm)}km away.`, category: alertCategory, flightId: f.id });
          alertedPlanes.current.set(f.id, now);
        }
      }
    }
  }, [addAlert]);

  const processFlightData = useCallback(async (rawFlights) => {
      const enriched = await enrichRoutes(rawFlights);
      const timestamped = enriched.map(f => {
        const desc = (f.desc || '').toLowerCase();
        const type = (f.type || '').toUpperCase();
        const cat = f.category || 'civil';
        const isHeli = cat === 'helicopter' || desc.includes('helicopter') || desc.includes('rotorcraft') || /^(R44|R66|B06|B40|AW1|S76|S92|AS3|EC1|H12|H13|H14|H15|UH60|AH64|CH47)/.test(type);
        return { ...f, lastUpdated: Date.now(), isHeli };
      });
      setFlights(timestamped);
      setApiStatus('ok', `Tracking ${enriched.length} flights`);
      runAlerts(timestamped);

      // Update trails
      const trails = trailsRef.current;
      const now = Date.now();
      const MAX_TOTAL_TRAILS = 200; // Safety cap to prevent unbounded growth
      for (const f of timestamped) {
        const key = f.icao24 || f.callsign || f.id;
        let pts = trails.get(key) || [];
        pts.push({ lat: f.lat, lon: f.lon, ts: now });
        // Keep positions within the last 3 minutes, max 60 points
        pts = pts.filter(p => now - p.ts < 180000).slice(-60);
        trails.set(key, pts);
      }
      // Prune stale trails for flights no longer seen
      trails.forEach((pts, trailKey) => {
        const lastTs = pts[pts.length - 1]?.ts || 0;
        if (now - lastTs > 30000) {
          trails.delete(trailKey);
        }
      });
      // Safety: if too many trails, remove oldest by last timestamp
      if (trails.size > MAX_TOTAL_TRAILS) {
        const sorted = Array.from(trails.entries()).sort((a, b) => (a[1][a[1].length - 1]?.ts || 0) - (b[1][b[1].length - 1]?.ts || 0));
        const toRemove = sorted.slice(0, trails.size - MAX_TOTAL_TRAILS);
        toRemove.forEach(([key]) => trails.delete(key));
      }
    }, [setFlights, setApiStatus, runAlerts]);

  // Polling fallback (used when SSE is unavailable)
  const pollFlights = useCallback(async (override: any = {}) => {
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
      if (!canSSE || state.userLat === null || state.userLon === null) return;

      let reconnectAttempt = 0;
      const MAX_RECONNECT_ATTEMPTS = 10;
      const BASE_RECONNECT_DELAY = 1000; // 1 second
      const MAX_RECONNECT_DELAY = 30000; // 30 seconds
      let reconnectTimer = null;

      const connect = () => {
        const params = new URLSearchParams({
          lat: state.userLat.toFixed(4),
          lon: state.userLon.toFixed(4),
          radius: String(state.radius),
        });
        for (const [key, val] of Object.entries(state.enabledAPIs)) {
          params.set(key, String(!!val));
        }
        const url = `/api/flights/stream?${params}`;
        const es = new EventSource(url);
        let connected = false;

        es.onopen = () => {
          connected = true;
          sseActive.current = true;
          reconnectAttempt = 0; // Reset on successful connection
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
        
          // Exponential backoff reconnection
          if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(
              BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempt) + Math.random() * 1000,
              MAX_RECONNECT_DELAY
            );
            reconnectAttempt++;
            console.log(`SSE reconnecting in ${delay}ms (attempt ${reconnectAttempt}/${MAX_RECONNECT_ATTEMPTS})`);
            reconnectTimer = setTimeout(connect, delay);
          } else {
            console.error('SSE max reconnection attempts reached, falling back to polling');
          }
        };

        // Store reference for cleanup
        (window as any).__skywatch_sse = es;
      };

      connect();

      return () => {
        sseActive.current = false;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if ((window as any).__skywatch_sse) (window as any).__skywatch_sse.close();
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

    const intervalMs = 5000;
    const timer = setInterval(doPoll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pollFlights, state.userLat, state.userLon, state.radius]);

  const value = {
    state,
    setFlights,
    setSelectedFlight,
    setLocation,
    setRadius,
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
