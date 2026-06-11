'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { fetchFlights, enrichRoutes } from '../lib/flightApi';

const FlightContext = createContext();

const initialState = {
  flights: [],
  selectedFlight: null,
  userLat: 18.6020,
  userLon: 73.7470,
  locationLabel: 'GPS',
  radius: 25,
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
    default:
      return state;
  }
}

export function FlightProvider({ children }) {
  const [state, dispatch] = useReducer(flightReducer, initialState);

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

  const setFlights = useCallback((flights) => {
    dispatch({ type: 'SET_FLIGHTS', payload: flights });
  }, []);

  const setSelectedFlight = useCallback((flight) => {
    dispatch({ type: 'SET_SELECTED_FLIGHT', payload: flight });
  }, []);

  const setLocation = useCallback((lat, lon, label) => {
    dispatch({ type: 'SET_LOCATION', payload: { lat, lon, label } });
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

  const addAlert = useCallback((message) => {
    dispatch({
      type: 'ADD_ALERT',
      payload: { message, timestamp: new Date() },
    });
  }, []);

  const setEnabledAPIs = useCallback((apis) => {
    dispatch({ type: 'SET_ENABLED_APIS', payload: apis });
  }, []);

  const setApiKey = useCallback((key, value) => {
    dispatch({ type: 'SET_API_KEY', payload: { key, value } });
  }, []);

  const fetchAndUpdate = useCallback(async (override = {}) => {
    const lat = override.lat ?? state.userLat;
    const lon = override.lon ?? state.userLon;
    const radius = override.radius ?? state.radius;
    try {
      setApiStatus('loading', 'Fetching flights...');
      const flights = await fetchFlights(lat, lon, radius, state.enabledAPIs, {
        airLabs: state.apiKeys.airLabs,
        aviationStack: state.apiKeys.aviationStack,
      });
      const enriched = await enrichRoutes(flights);
      setFlights(enriched);
      setApiStatus('ok', `Fetched ${enriched.length} flights`);
    } catch (e) {
      setApiStatus('error', 'Failed to fetch flights');
      addAlert(`Fetch error: ${e.message || e}`);
    }
  }, [state.userLat, state.userLon, state.radius, state.enabledAPIs, state.apiKeys, setApiStatus, setFlights, addAlert]);

  useEffect(() => {
    let cancelled = false;
    // initial fetch
    fetchAndUpdate();

    const intervalMs = Math.max(5, state.refreshInterval) * 1000;
    const timer = setInterval(() => {
      if (cancelled) return;
      fetchAndUpdate();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [fetchAndUpdate, state.refreshInterval, state.userLat, state.userLon, state.radius]);

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
    fetchAndUpdate,
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
